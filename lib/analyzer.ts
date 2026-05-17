// Lógica principal de análisis de facturas de gas contra la TUR
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
  tramo_tur: "TUR1" | "TUR2" | null
  tur_referencia: TurResult | null
  desviacion_variable_pct: number
  desviacion_fijo_pct: number
  ahorro_mensual_estimado_eur: number
  ahorro_anual_estimado_eur: number
  tiene_descuento_trampa: boolean
  alertas: string[]
}

export function analyzeGasBill(billData: BillData, turData: TurResult | null): AnalysisResult {
  // Implemented in issue #3
  void billData
  void turData
  return {
    elegible_tur: false,
    razon_no_elegible: null,
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
