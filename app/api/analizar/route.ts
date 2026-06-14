import { NextRequest, NextResponse } from "next/server"
import { extractBillData } from "../../../lib/ocr"
import { analyzeGasBill, type BillData } from "../../../lib/analyzer"
import { getTurForDate } from "../../../lib/tur"
import { extractElectricBillData, type ElectricBillData } from "../../../lib/ocr-electric"
import { analyzeElectricBill } from "../../../lib/analyzer-electric"
import { getPvpcForPeriod } from "../../../lib/pvpc"
import { getSupabaseServer } from "../../../lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? ""

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const tipoEnergia = (formData.get("tipo_energia") as string) ?? "gas"
      const factura = formData.get("factura")

      if (!factura || !(factura instanceof File)) {
        return NextResponse.json(
          { success: false, error: "Se esperaba un fichero en el campo 'factura'" },
          { status: 400 }
        )
      }

      if (tipoEnergia === "electricidad") {
        const billData = await extractElectricBillData(factura)
        return await handleElectric(billData)
      }

      const billData = await extractBillData(factura)
      return await handleGas(billData)
    }

    // JSON manual
    const body = await request.json() as { tipo_energia?: string } & (BillData | ElectricBillData)
    const tipoEnergia = body.tipo_energia ?? "gas"

    if (tipoEnergia === "electricidad") {
      return await handleElectric(body as ElectricBillData)
    }

    return handleGas(body as BillData)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

async function handleGas(billData: BillData) {
  const fechaReferencia = billData.fecha_inicio ?? billData.fecha_fin ?? new Date().toISOString().slice(0, 10)
  const consumoAnual = billData.consumo_anual_estimado_kwh ?? estimarConsumoAnualGas(billData) ?? 5000
  const turData = getTurForDate(fechaReferencia, consumoAnual)
  const resultado = analyzeGasBill(billData, turData)

  await registrarAnalisis({
    tipo_energia: "gas",
    mercado_libre: !resultado.esta_en_tur,
    precio_usuario_eur_kwh: billData.termino_variable_eur_kwh,
    precio_referencia_eur_kwh: turData?.variable_eur_kwh ?? null,
    desviacion_pct: resultado.desviacion_variable_pct,
    ahorro_mensual_eur: resultado.ahorro_mensual_estimado_eur,
  })

  return NextResponse.json({ success: true, tipo_energia: "gas", data: resultado, factura: billData })
}

async function handleElectric(billData: ElectricBillData) {
  const { fecha_inicio, fecha_fin } = billData
  const pvpcData = fecha_inicio && fecha_fin
    ? await getPvpcForPeriod(fecha_inicio, fecha_fin)
    : null
  const resultado = analyzeElectricBill(billData, pvpcData)

  await registrarAnalisis({
    tipo_energia: "electricidad",
    mercado_libre: !resultado.esta_en_pvpc,
    precio_usuario_eur_kwh: resultado.precio_usuario_eur_kwh,
    precio_referencia_eur_kwh: pvpcData?.media_eur_kwh ?? null,
    desviacion_pct: resultado.desviacion_energia_pct,
    ahorro_mensual_eur: resultado.ahorro_mensual_estimado_eur,
  })

  return NextResponse.json({ success: true, tipo_energia: "electricidad", data: resultado, factura: billData })
}

type AnalisisRow = {
  tipo_energia: string
  mercado_libre: boolean
  precio_usuario_eur_kwh: number | null
  precio_referencia_eur_kwh: number | null
  desviacion_pct: number
  ahorro_mensual_eur: number
}

async function registrarAnalisis(row: AnalisisRow): Promise<void> {
  const db = getSupabaseServer()
  if (!db) return
  const { error } = await db.from("analisis").insert(row)
  if (error) console.error("[analytics] INSERT failed:", error.message)
}

function estimarConsumoAnualGas(billData: BillData): number | null {
  if (!billData.consumo_kwh || !billData.dias_facturados || billData.dias_facturados === 0) return null
  return (billData.consumo_kwh / billData.dias_facturados) * 365
}
