import { NextRequest, NextResponse } from "next/server"
import { extractBillData } from "../../../lib/ocr"
import { analyzeGasBill, type BillData } from "../../../lib/analyzer"
import { getTurForDate } from "../../../lib/tur"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") ?? ""
    const tipoEnergia = "gas" // campo reservado para electricidad en el futuro

    let billData: BillData

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      const factura = formData.get("factura")

      if (!factura || !(factura instanceof File)) {
        return NextResponse.json(
          { success: false, error: "Se esperaba un fichero en el campo 'factura'" },
          { status: 400 }
        )
      }

      billData = await extractBillData(factura)
    } else {
      const body = await request.json() as { tipo_energia?: string } & BillData
      billData = body as BillData
    }

    if (tipoEnergia !== "gas") {
      return NextResponse.json(
        { success: false, error: "Solo se soporta tipo_energia: 'gas' por ahora" },
        { status: 400 }
      )
    }

    const fechaReferencia = billData.fecha_inicio ?? billData.fecha_fin ?? new Date().toISOString().slice(0, 10)
    const consumoAnual = billData.consumo_anual_estimado_kwh ?? estimarConsumoAnual(billData) ?? 5000
    const turData = getTurForDate(fechaReferencia, consumoAnual)

    const resultado = analyzeGasBill(billData, turData)

    return NextResponse.json({ success: true, data: resultado, factura: billData })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

function estimarConsumoAnual(billData: BillData): number | null {
  if (!billData.consumo_kwh || !billData.dias_facturados || billData.dias_facturados === 0) return null
  return (billData.consumo_kwh / billData.dias_facturados) * 365
}
