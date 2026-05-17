import type { TurResult } from "./tur"

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

export type AnalysisResult = {
  elegible_tur: boolean
  razon_no_elegible: string | null
  esta_en_tur: boolean
  tramo_tur: "TUR1" | "TUR2" | "TUR3" | null
  tur_referencia: TurResult | null
  desviacion_variable_pct: number
  desviacion_fijo_pct: number
  ahorro_mensual_estimado_eur: number
  ahorro_anual_estimado_eur: number
  tiene_descuento_trampa: boolean
  alertas: string[]
}

const DIAS_MES = 365 / 12
const DESCUENTO_TRAMPA_UMBRAL_PCT = 20

export function analyzeGasBill(billData: BillData, turData: TurResult | null): AnalysisResult {
  const alertas: string[] = []

  // --- Elegibilidad ---
  if (billData.presion_bar !== null && billData.presion_bar > 4) {
    return {
      elegible_tur: false,
      razon_no_elegible: `Tu suministro opera a ${billData.presion_bar} bar. La TUR solo aplica a suministros con presión de 4 bar o inferior.`,
      esta_en_tur: false,
      tramo_tur: null,
      tur_referencia: null,
      desviacion_variable_pct: 0,
      desviacion_fijo_pct: 0,
      ahorro_mensual_estimado_eur: 0,
      ahorro_anual_estimado_eur: 0,
      tiene_descuento_trampa: false,
      alertas: [],
    }
  }

  const consumoAnual = billData.consumo_anual_estimado_kwh ?? estimarConsumoAnual(billData)

  if (consumoAnual !== null && consumoAnual > 50000) {
    return {
      elegible_tur: false,
      razon_no_elegible: `Tu consumo anual estimado es de ${Math.round(consumoAnual).toLocaleString("es-ES")} kWh. La TUR solo aplica a consumos de hasta 50.000 kWh al año.`,
      esta_en_tur: false,
      tramo_tur: null,
      tur_referencia: null,
      desviacion_variable_pct: 0,
      desviacion_fijo_pct: 0,
      ahorro_mensual_estimado_eur: 0,
      ahorro_anual_estimado_eur: 0,
      tiene_descuento_trampa: false,
      alertas: [],
    }
  }

  // --- ¿Ya está en TUR? ---
  const estaEnTur = billData.es_mercado_libre === false

  // --- Tramo TUR ---
  const tramoTur = turData?.tramo ?? null

  if (consumoAnual !== null && tramoTur) {
    alertas.push(
      `Tu consumo anual estimado es de ${Math.round(consumoAnual).toLocaleString("es-ES")} kWh. ` +
        `Tienes derecho a acogerte a la ${tramoTur === "TUR1" ? "TUR.1" : tramoTur === "TUR2" ? "TUR.2" : "TUR.3"}.`
    )
  }

  if (!turData) {
    return {
      elegible_tur: true,
      razon_no_elegible: null,
      esta_en_tur: estaEnTur,
      tramo_tur: tramoTur,
      tur_referencia: null,
      desviacion_variable_pct: 0,
      desviacion_fijo_pct: 0,
      ahorro_mensual_estimado_eur: 0,
      ahorro_anual_estimado_eur: 0,
      tiene_descuento_trampa: false,
      alertas,
    }
  }

  // --- Desviaciones ---
  const turVariable = turData.variable_eur_kwh
  const turFijo = turData.fijo_eur_dia

  const facturaVariable = billData.termino_variable_eur_kwh ?? turVariable
  const facturaFijo = billData.termino_fijo_eur_dia ?? turFijo

  const desviacionVariablePct = pct(facturaVariable - turVariable, turVariable)
  const desviacionFijoPct = pct(facturaFijo - turFijo, turFijo)

  // --- Descuento trampa ---
  let tieneTrampa = false
  const totalDescuentoPct = (billData.descuentos ?? []).reduce((acc, d) => acc + d.porcentaje, 0)

  if (totalDescuentoPct > 0 && desviacionVariablePct > DESCUENTO_TRAMPA_UMBRAL_PCT) {
    const facturaVariableConDescuento = facturaVariable * (1 - totalDescuentoPct / 100)
    const desviacionTrasDescuento = pct(facturaVariableConDescuento - turVariable, turVariable)
    if (desviacionTrasDescuento > DESCUENTO_TRAMPA_UMBRAL_PCT) {
      tieneTrampa = true
      alertas.push(
        `Tu compañía te ofrece un ${totalDescuentoPct.toFixed(0)}% de descuento, pero aun así pagas ` +
          `un ${Math.round(desviacionTrasDescuento)}% más que la tarifa oficial.`
      )
    }
  }

  // --- Ahorro estimado ---
  const consumoMensualKwh = consumoAnual !== null ? consumoAnual / 12 : (billData.consumo_kwh ?? 0)
  const ahorroVariableMensual = (facturaVariable - turVariable) * consumoMensualKwh
  const ahorroFijoMensual = (facturaFijo - turFijo) * DIAS_MES
  const ahorroMensual = Math.max(0, ahorroVariableMensual + ahorroFijoMensual)
  const ahorroAnual = ahorroMensual * 12

  // --- Alerta fecha de cambio ---
  if (!estaEnTur && billData.fecha_inicio) {
    alertas.push(
      `Llevas en mercado libre desde al menos ${formatFecha(billData.fecha_inicio)}. ` +
        `El cambio a TUR es gratuito y puedes hacerlo hoy.`
    )
  }

  return {
    elegible_tur: true,
    razon_no_elegible: null,
    esta_en_tur: estaEnTur,
    tramo_tur: tramoTur,
    tur_referencia: turData,
    desviacion_variable_pct: desviacionVariablePct,
    desviacion_fijo_pct: desviacionFijoPct,
    ahorro_mensual_estimado_eur: round2(ahorroMensual),
    ahorro_anual_estimado_eur: round2(ahorroAnual),
    tiene_descuento_trampa: tieneTrampa,
    alertas,
  }
}

function estimarConsumoAnual(billData: BillData): number | null {
  if (!billData.consumo_kwh || !billData.dias_facturados || billData.dias_facturados === 0) return null
  return (billData.consumo_kwh / billData.dias_facturados) * 365
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
