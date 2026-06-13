// Integración con ESIOS (api.esios.ree.es) para precios PVPC 2.0TD
//
// Términos de uso ESIOS: los datos deben cachearse en servidor propio.
// Caché en data/cache/pvpc-YYYY-MM.json — un fichero por mes.
// Cabecera de autenticación: x-api-key (ESIOS_API_KEY en .env)

import fs from "fs"
import path from "path"

const ESIOS_BASE = "https://api.esios.ree.es"
const INDICATOR_PVPC = 1001
const CACHE_DIR = path.join(process.cwd(), "data", "cache")

export type PvpcZona = "Península" | "Canarias" | "Baleares" | "Ceuta" | "Melilla"

export type PvpcHourEntry = {
  datetime: string   // ISO 8601
  value_eur_kwh: number
}

export type PvpcMonthCache = {
  indicator: number
  zona: PvpcZona
  mes: string        // "YYYY-MM"
  descargado: string // ISO fecha de descarga
  horas: PvpcHourEntry[]
}

export type PvpcDayData = {
  fecha: string      // "YYYY-MM-DD"
  media_eur_kwh: number
  min_eur_kwh: number
  max_eur_kwh: number
}

export type PvpcResult = {
  fecha_inicio: string
  fecha_fin: string
  zona: PvpcZona
  media_eur_kwh: number
  min_eur_kwh: number
  max_eur_kwh: number
  dias: PvpcDayData[]
}

function getCachePath(mes: string): string {
  return path.join(CACHE_DIR, `pvpc-${mes}.json`)
}

function readCache(mes: string): PvpcMonthCache | null {
  const p = getCachePath(mes)
  if (!fs.existsSync(p)) return null
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as PvpcMonthCache
  } catch {
    return null
  }
}

function writeCache(data: PvpcMonthCache): void {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
  fs.writeFileSync(getCachePath(data.mes), JSON.stringify(data, null, 2))
}

async function fetchMonthFromEsios(mes: string, zona: PvpcZona): Promise<PvpcMonthCache> {
  const apiKey = process.env.ESIOS_API_KEY
  if (!apiKey) throw new Error("ESIOS_API_KEY no está configurada en las variables de entorno")

  const [year, month] = mes.split("-").map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  const start = `${mes}-01T00:00:00`
  const end = `${mes}-${String(lastDay).padStart(2, "0")}T23:59:59`

  const url = `${ESIOS_BASE}/indicators/${INDICATOR_PVPC}?start_date=${start}&end_date=${end}`
  const res = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
      "Accept": "application/json",
    },
  })

  if (!res.ok) throw new Error(`ESIOS API error ${res.status}: ${await res.text()}`)

  const json = await res.json() as {
    indicator: { values: { datetime: string; value: number; geo_name: string }[] }
  }

  const horas: PvpcHourEntry[] = json.indicator.values
    .filter((v) => v.geo_name === zona)
    .map((v) => ({
      datetime: v.datetime,
      value_eur_kwh: v.value / 1000, // €/MWh → €/kWh
    }))

  const cache: PvpcMonthCache = {
    indicator: INDICATOR_PVPC,
    zona,
    mes,
    descargado: new Date().toISOString(),
    horas,
  }

  writeCache(cache)
  return cache
}

async function getMonthData(mes: string, zona: PvpcZona): Promise<PvpcMonthCache> {
  const cached = readCache(mes)
  if (cached && cached.zona === zona) return cached
  return fetchMonthFromEsios(mes, zona)
}

function getMonthsInRange(inicio: string, fin: string): string[] {
  const meses: string[] = []
  const [y1, m1] = inicio.split("-").map(Number)
  const [y2, m2] = fin.split("-").map(Number)
  let y = y1, m = m1
  while (y < y2 || (y === y2 && m <= m2)) {
    meses.push(`${y}-${String(m).padStart(2, "0")}`)
    m++
    if (m > 12) { m = 1; y++ }
  }
  return meses
}

function isoToDate(iso: string): string {
  // Normaliza "2026-06-12T00:00:00.000+02:00" → "2026-06-12"
  return iso.slice(0, 10)
}

export async function getPvpcForPeriod(
  fechaInicio: string,
  fechaFin: string,
  zona: PvpcZona = "Península"
): Promise<PvpcResult> {
  const meses = getMonthsInRange(fechaInicio, fechaFin)
  const allHours: PvpcHourEntry[] = []

  for (const mes of meses) {
    const data = await getMonthData(mes, zona)
    allHours.push(...data.horas)
  }

  // Filtrar solo las horas del período exacto
  const horasFiltradas = allHours.filter((h) => {
    const fecha = isoToDate(h.datetime)
    return fecha >= fechaInicio && fecha <= fechaFin
  })

  if (horasFiltradas.length === 0) {
    throw new Error(`No hay datos PVPC para el período ${fechaInicio} → ${fechaFin}`)
  }

  // Agrupar por día
  const porDia = new Map<string, number[]>()
  for (const h of horasFiltradas) {
    const fecha = isoToDate(h.datetime)
    if (!porDia.has(fecha)) porDia.set(fecha, [])
    porDia.get(fecha)!.push(h.value_eur_kwh)
  }

  const dias: PvpcDayData[] = Array.from(porDia.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, valores]) => ({
      fecha,
      media_eur_kwh: round5(avg(valores)),
      min_eur_kwh: round5(Math.min(...valores)),
      max_eur_kwh: round5(Math.max(...valores)),
    }))

  const todosLosValores = horasFiltradas.map((h) => h.value_eur_kwh)

  return {
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    zona,
    media_eur_kwh: round5(avg(todosLosValores)),
    min_eur_kwh: round5(Math.min(...todosLosValores)),
    max_eur_kwh: round5(Math.max(...todosLosValores)),
    dias,
  }
}

function avg(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

function round5(n: number): number {
  return Math.round(n * 100000) / 100000
}
