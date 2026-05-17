import Anthropic from "@anthropic-ai/sdk"
import { AI_MODEL, AI_MAX_TOKENS } from "../config/ai"

export type BillData = {
  comercializadora: string | null
  producto: string | null
  es_mercado_libre: boolean | null
  fecha_inicio: string | null
  fecha_fin: string | null
  dias_facturados: number | null
  consumo_kwh: number | null
  consumo_anual_estimado_kwh: number | null
  termino_fijo_eur_dia: number | null
  termino_variable_eur_kwh: number | null
  presion_bar: number | null
  descuentos: { descripcion: string; porcentaje: number }[]
  importe_total: number | null
  peaje_acceso: string | null
}

const OCR_PROMPT = `Eres un sistema de extracción de datos de facturas de gas natural españolas.
Extrae los siguientes campos de la factura y devuelve ÚNICAMENTE un objeto JSON
válido, sin texto adicional, sin markdown, sin explicaciones.

Si un campo no aparece en la factura, devuélvelo como null.
Si el consumo anual no aparece explícito, calcúlalo extrapolando desde
el consumo del período facturado y los días.

Campos a extraer:
{
  "comercializadora": string,
  "producto": string,
  "es_mercado_libre": boolean,
  "fecha_inicio": "YYYY-MM-DD",
  "fecha_fin": "YYYY-MM-DD",
  "dias_facturados": number,
  "consumo_kwh": number,
  "consumo_anual_estimado_kwh": number,
  "termino_fijo_eur_dia": number,
  "termino_variable_eur_kwh": number,
  "presion_bar": number,
  "descuentos": [{ "descripcion": string, "porcentaje": number }],
  "importe_total": number,
  "peaje_acceso": string
}`

export async function extractBillData(file: File): Promise<BillData> {
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
    ? {
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: base64 },
      }
    : {
        type: "image",
        source: { type: "base64", media_type: file.type as SupportedImageType, data: base64 },
      }

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: AI_MAX_TOKENS,
    messages: [
      {
        role: "user",
        content: [fileContent, { type: "text", text: OCR_PROMPT }],
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("La IA no devolvió texto")
  }

  const raw = textBlock.text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")
  const parsed = JSON.parse(raw) as BillData
  return parsed
}
