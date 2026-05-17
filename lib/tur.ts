import turData from "../data/tur-gas.json"

export type TurTramo = "TUR1" | "TUR2" | "TUR3"

export type TurEntry = {
  vigente_desde: string
  vigente_hasta: string
  tur1_fijo_eur_dia: number
  tur1_variable_eur_kwh: number
  tur2_fijo_eur_dia: number
  tur2_variable_eur_kwh: number
  tur3_fijo_eur_dia: number | null
  tur3_variable_eur_kwh: number | null
  fuente: string
}

export type TurResult = {
  tramo: TurTramo
  fijo_eur_dia: number
  variable_eur_kwh: number
  entrada: TurEntry
}

// TUR.1: ≤ 5.000 kWh/año
// TUR.2: 5.001–15.000 kWh/año
// TUR.3: 15.001–50.000 kWh/año
function getTramo(consumoAnualKwh: number): TurTramo {
  if (consumoAnualKwh <= 5000) return "TUR1"
  if (consumoAnualKwh <= 15000) return "TUR2"
  return "TUR3"
}

export function getTurForDate(date: string, consumoAnualKwh: number): TurResult | null {
  const entries = (turData as unknown[]).filter(
    (e): e is TurEntry => typeof e === "object" && e !== null && "vigente_desde" in e
  )
  const entry = entries.find((e) => e.vigente_desde <= date && date <= e.vigente_hasta)
  if (!entry) return null

  const tramo = getTramo(consumoAnualKwh)

  if (tramo === "TUR1") {
    return {
      tramo,
      fijo_eur_dia: entry.tur1_fijo_eur_dia,
      variable_eur_kwh: entry.tur1_variable_eur_kwh,
      entrada: entry,
    }
  }

  if (tramo === "TUR2") {
    return {
      tramo,
      fijo_eur_dia: entry.tur2_fijo_eur_dia,
      variable_eur_kwh: entry.tur2_variable_eur_kwh,
      entrada: entry,
    }
  }

  // TUR3
  if (entry.tur3_fijo_eur_dia === null || entry.tur3_variable_eur_kwh === null) {
    // Fallback a TUR2 si TUR3 no está disponible para ese período
    return {
      tramo,
      fijo_eur_dia: entry.tur2_fijo_eur_dia,
      variable_eur_kwh: entry.tur2_variable_eur_kwh,
      entrada: entry,
    }
  }

  return {
    tramo,
    fijo_eur_dia: entry.tur3_fijo_eur_dia,
    variable_eur_kwh: entry.tur3_variable_eur_kwh,
    entrada: entry,
  }
}
