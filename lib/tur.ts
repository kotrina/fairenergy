// Búsqueda de la TUR vigente por fecha y cálculo del tramo
export type TurEntry = {
  vigente_desde: string
  vigente_hasta: string
  tur1_fijo_eur_dia: number
  tur1_variable_eur_kwh: number
  tur2_fijo_eur_dia: number
  tur2_variable_eur_kwh: number
}

export type TurTramo = "TUR1" | "TUR2"

export type TurResult = TurEntry & {
  tramo: TurTramo
  fijo_eur_dia: number
  variable_eur_kwh: number
}

export function getTurForDate(date: string, consumoAnualKwh: number): TurResult | null {
  // Implemented in issue #3
  void date
  void consumoAnualKwh
  return null
}
