import Anthropic from "@anthropic-ai/sdk"
import { AI_MODEL, AI_MAX_TOKENS } from "../config/ai"

export type EnergiaPeriodo = {
  periodo: "punta" | "llano" | "valle"
  precio_eur_kwh: number | null
  consumo_kwh: number | null
}

export type ElectricBillData = {
  comercializadora: string | null
  producto: string | null
  es_mercado_libre: boolean | null
  fecha_inicio: string | null
  fecha_fin: string | null
  dias_facturados: number | null
  consumo_kwh: number | null
  potencia_contratada_kw: number | null
  termino_potencia_eur_kw_dia: number | null
  termino_energia_eur_kwh: number | null
  energia_periodos: EnergiaPeriodo[]
  importe_total: number | null
  descuentos: { descripcion: string; porcentaje: number }[]
}

const OCR_PROMPT_ELECTRIC = `Eres un sistema de extracción de datos de facturas de electricidad españolas.
Extrae los siguientes campos de la factura y devuelve ÚNICAMENTE un objeto JSON
válido, sin texto adicional, sin markdown, sin explicaciones.

Si un campo no aparece en la factura, devuélvelo como null.

Notas importantes:
- "es_mercado_libre": true si la tarifa es de mercado libre; false si es PVPC o tarifa regulada.
- IMPORTANTE — precio de la energía. NO calcules medias ni hagas operaciones aritméticas.
  Limítate a COPIAR los números que aparecen en la factura:
  - Si la factura tiene discriminación horaria (tarifa 2.0TD con períodos punta/llano/valle),
    rellena "energia_periodos" con un objeto por cada período, copiando su precio (€/kWh) y su
    consumo (kWh) tal como figuran en la factura. En ese caso deja "termino_energia_eur_kwh" en null.
  - Si la factura tiene un único precio de energía (sin discriminación horaria), rellena
    "termino_energia_eur_kwh" con ese precio y deja "energia_periodos" como array vacío [].
- "termino_potencia_eur_kw_dia": coste diario por kW de potencia contratada.
- "potencia_contratada_kw": la potencia contratada total (P1 o suma P1+P2 si aparece).
- "descuentos": lista de descuentos aplicados con su porcentaje. Array vacío si no hay ninguno.

Campos a extraer:
{
  "comercializadora": string,
  "producto": string,
  "es_mercado_libre": boolean,
  "fecha_inicio": "YYYY-MM-DD",
  "fecha_fin": "YYYY-MM-DD",
  "dias_facturados": number,
  "consumo_kwh": number,
  "potencia_contratada_kw": number,
  "termino_potencia_eur_kw_dia": number,
  "termino_energia_eur_kwh": number | null,
  "energia_periodos": [{ "periodo": "punta" | "llano" | "valle", "precio_eur_kwh": number, "consumo_kwh": number }],
  "importe_total": number,
  "descuentos": [{ "descripcion": string, "porcentaje": number }]
}`

export async function extractElectricBillData(file: File): Promise<ElectricBillData> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const arrayBuffer = await file.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")
  const isPdf = file.type === "application/pdf"

  type SupportedImageType = "image/jpeg" | "image/png" | "image/gif" | "image/webp"
  const SUPPORTED_IMAGE_TYPES: SupportedImageType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"]

  if (!isPdf && !SUPPORTED_IMAGE_TYPES.includes(file.type as SupportedImageType)) {
    throw new Error(`Tipo de fichero no soportado: ${file.type}. Usa PDF, JPEG, PNG, GIF o WEBP.`)
  }

  type ContentBlock =
    | { type: "document"; source: { type: "base64"; media_type: "application/pdf"; data: string } }
    | { type: "image"; source: { type: "base64"; media_type: SupportedImageType; data: string } }

  const fileContent: ContentBlock = isPdf
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: base64 } }
    : { type: "image", source: { type: "base64", media_type: file.type as SupportedImageType, data: base64 } }

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    messages: [{ role: "user", content: [fileContent, { type: "text", text: OCR_PROMPT_ELECTRIC }] }],
  })

  const textBlock = response.content.find((b) => b.type === "text")
  if (!textBlock || textBlock.type !== "text") throw new Error("La IA no devolvió texto")

  const raw = textBlock.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
  const parsed = JSON.parse(raw) as ElectricBillData
  if (!Array.isArray(parsed.energia_periodos)) parsed.energia_periodos = []
  return parsed
}
