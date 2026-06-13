import type { ElectricBillData } from "./ocr-electric"
import type { PvpcResult } from "./pvpc"

export type ElectricAnalysisResult = {
  tipo_energia: "electricidad"
  elegible_pvpc: boolean
  razon_no_elegible: string | null
  esta_en_pvpc: boolean
  pvpc_referencia: {
    fecha_inicio: string
    fecha_fin: string
    zona: string
    media_eur_kwh: number
    min_eur_kwh: number
    max_eur_kwh: number
  } | null
  desviacion_energia_pct: number
  ahorro_mensual_estimado_eur: number
  ahorro_anual_estimado_eur: number
  tiene_descuento_trampa: boolean
  alertas: string[]
}

const DIAS_MES = 365 / 12
const DESCUENTO_TRAMPA_UMBRAL_PCT = 20

export function analyzeElectricBill(
  billData: ElectricBillData,
  pvpcData: PvpcResult | null
): ElectricAnalysisResult {
  const alertas: string[] = []
  const estaEnPvpc = billData.es_mercado_libre === false

  if (!pvpcData) {
    return {
      tipo_energia: "electricidad",
      elegible_pvpc: true,
      razon_no_elegible: null,
      esta_en_pvpc: estaEnPvpc,
      pvpc_referencia: null,
      desviacion_energia_pct: 0,
      ahorro_mensual_estimado_eur: 0,
      ahorro_anual_estimado_eur: 0,
      tiene_descuento_trampa: false,
      alertas,
    }
  }

  const pvpcMedio = pvpcData.media_eur_kwh
  const facturaEnergia = billData.termino_energia_eur_kwh ?? pvpcMedio

  const desviacionPct = pct(facturaEnergia - pvpcMedio, pvpcMedio)

  // Descuento trampa
  let tieneTrampa = false
  const totalDescuentoPct = (billData.descuentos ?? []).reduce((acc, d) => acc + d.porcentaje, 0)
  if (totalDescuentoPct > 0 && desviacionPct > DESCUENTO_TRAMPA_UMBRAL_PCT) {
    const facturaConDescuento = facturaEnergia * (1 - totalDescuentoPct / 100)
    const desviacionTrasDescuento = pct(facturaConDescuento - pvpcMedio, pvpcMedio)
    if (desviacionTrasDescuento > DESCUENTO_TRAMPA_UMBRAL_PCT) {
      tieneTrampa = true
      alertas.push(
        `Tu compañía te ofrece un ${totalDescuentoPct.toFixed(0)}% de descuento, pero aun así pagas ` +
          `un ${Math.round(desviacionTrasDescuento)}% más que el PVPC del mismo período.`
      )
    }
  }

  // Ahorro estimado
  const diasFacturados = billData.dias_facturados ?? DIAS_MES
  const consumoMensualKwh = billData.consumo_kwh !== null
    ? (billData.consumo_kwh / diasFacturados) * DIAS_MES
    : 0
  const ahorroMensual = Math.max(0, (facturaEnergia - pvpcMedio) * consumoMensualKwh)
  const ahorroAnual = ahorroMensual * 12

  if (!estaEnPvpc && billData.fecha_inicio) {
    alertas.push(
      `Llevas en mercado libre desde al menos ${formatFecha(billData.fecha_inicio)}. ` +
        `Puedes pedir el cambio al PVPC gratis.`
    )
  }

  return {
    tipo_energia: "electricidad",
    elegible_pvpc: true,
    razon_no_elegible: null,
    esta_en_pvpc: estaEnPvpc,
    pvpc_referencia: {
      fecha_inicio: pvpcData.fecha_inicio,
      fecha_fin: pvpcData.fecha_fin,
      zona: pvpcData.zona,
      media_eur_kwh: pvpcData.media_eur_kwh,
      min_eur_kwh: pvpcData.min_eur_kwh,
      max_eur_kwh: pvpcData.max_eur_kwh,
    },
    desviacion_energia_pct: desviacionPct,
    ahorro_mensual_estimado_eur: round2(ahorroMensual),
    ahorro_anual_estimado_eur: round2(ahorroAnual),
    tiene_descuento_trampa: tieneTrampa,
    alertas,
  }
}

function pct(diferencia: number, base: number): number {
  if (base === 0) return 0
  return round2((diferencia / base) * 100)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function formatFecha(iso: string): string {
  const [year, month] = iso.split("-")
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
  return `${meses[parseInt(month) - 1]} de ${year}`
}
