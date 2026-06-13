"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Nav from "../components/Nav"

type GasAnalysisResult = {
  elegible_tur: boolean
  razon_no_elegible: string | null
  esta_en_tur: boolean
  tramo_tur: "TUR1" | "TUR2" | "TUR3" | null
  tur_referencia: {
    tramo: string
    fijo_eur_dia: number
    variable_eur_kwh: number
    entrada: { vigente_desde: string; vigente_hasta: string; fuente: string }
  } | null
  desviacion_variable_pct: number
  desviacion_fijo_pct: number
  ahorro_mensual_estimado_eur: number
  ahorro_anual_estimado_eur: number
  tiene_descuento_trampa: boolean
  alertas: string[]
}

type GasBillData = {
  termino_fijo_eur_dia: number | null
  termino_variable_eur_kwh: number | null
  consumo_kwh: number | null
  consumo_anual_estimado_kwh: number | null
  comercializadora: string | null
  producto: string | null
  descuentos: { descripcion: string; porcentaje: number }[]
}

type ElectricAnalysisResult = {
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

type ElectricBillData = {
  termino_energia_eur_kwh: number | null
  termino_potencia_eur_kw_dia: number | null
  potencia_contratada_kw: number | null
  consumo_kwh: number | null
  comercializadora: string | null
  producto: string | null
  descuentos: { descripcion: string; porcentaje: number }[]
}

type Verdict = "verde" | "amarillo" | "rojo"

const VERDICT_STYLES = {
  verde: {
    bg: "#F0FDF4", border: "#86EFAC", badgeBg: "#16A34A",
    titleColor: "#14532D", textColor: "#166534",
  },
  amarillo: {
    bg: "#FFFBEB", border: "#FCD34D", badgeBg: "#D97706",
    titleColor: "#78350F", textColor: "#92400E",
  },
  rojo: {
    bg: "#FEF2F2", border: "#FCA5A5", badgeBg: "#DC2626",
    titleColor: "#7F1D1D", textColor: "#991B1B",
  },
}

const COMERCIALIZADORAS_GAS = [
  { nombre: "Curenergía (Iberdrola)", telefono: "900 200 422" },
  { nombre: "Endesa Energía XXI", telefono: "800 760 333" },
  { nombre: "Naturgy Iberia", telefono: "900 100 251" },
  { nombre: "Repsol Electricidad y Gas", telefono: "900 100 100" },
  { nombre: "TotalEnergies Marketing España", telefono: "900 373 753" },
]

const COMERCIALIZADORAS_ELECTRIC = [
  { nombre: "Iberdrola (PVPC)", telefono: "900 225 235" },
  { nombre: "Endesa (PVPC)", telefono: "800 760 333" },
  { nombre: "Naturgy (PVPC)", telefono: "900 100 251" },
  { nombre: "EDP Energía (PVPC)", telefono: "900 907 190" },
  { nombre: "Repsol Electricidad (PVPC)", telefono: "900 100 100" },
]

export default function ResultadoPage() {
  const [tipo, setTipo] = useState<"gas" | "electricidad" | null>(null)
  const [gasResult, setGasResult] = useState<GasAnalysisResult | null>(null)
  const [electricResult, setElectricResult] = useState<ElectricAnalysisResult | null>(null)
  const [gasFact, setGasFact] = useState<GasBillData | null>(null)
  const [electricFact, setElectricFact] = useState<ElectricBillData | null>(null)
  const router = useRouter()

  useEffect(() => {
    const raw = sessionStorage.getItem("fairenergy_resultado")
    const rawFactura = sessionStorage.getItem("fairenergy_factura")
    const rawTipo = sessionStorage.getItem("fairenergy_tipo_energia") ?? "gas"
    if (!raw) { router.push("/"); return }
    try {
      const tipoEnergia = rawTipo as "gas" | "electricidad"
      setTimeout(() => {
        setTipo(tipoEnergia)
        if (tipoEnergia === "electricidad") {
          setElectricResult(JSON.parse(raw) as ElectricAnalysisResult)
          if (rawFactura) setElectricFact(JSON.parse(rawFactura) as ElectricBillData)
        } else {
          setGasResult(JSON.parse(raw) as GasAnalysisResult)
          if (rawFactura) setGasFact(JSON.parse(rawFactura) as GasBillData)
        }
      }, 0)
    } catch {
      router.push("/")
    }
  }, [router])

  if (!tipo) {
    return (
      <main className="min-h-screen bg-white">
        <Nav back />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Cargando resultado…</p>
        </div>
      </main>
    )
  }

  if (tipo === "electricidad" && electricResult) {
    return <ElectricResultado resultado={electricResult} factura={electricFact} />
  }

  if (gasResult) {
    return <GasResultado resultado={gasResult} factura={gasFact} />
  }

  return null
}

// ─── Gas ───────────────────────────────────────────────────────────────────────

function GasResultado({ resultado, factura }: { resultado: GasAnalysisResult; factura: GasBillData | null }) {
  if (!resultado.elegible_tur) return <NoElegible razon={resultado.razon_no_elegible} />

  const desv = resultado.desviacion_variable_pct
  const verdict: Verdict = resultado.esta_en_tur || desv <= 20 ? "verde" : desv <= 60 ? "amarillo" : "rojo"
  const tur = resultado.tur_referencia

  const titulo = verdict === "verde" ? "Estás bien" : verdict === "amarillo" ? "Podrías mejorar" : "Te están cobrando de más"
  const frase = verdict === "verde"
    ? (resultado.esta_en_tur ? "Estás en la tarifa oficial del Gobierno. Bien hecho." : "Tu tarifa está dentro de los límites razonables respecto a la tarifa oficial.")
    : verdict === "amarillo"
      ? `Tu compañía te cobra un ${Math.round(desv)}% más que la tarifa oficial. Podrías ahorrar ${resultado.ahorro_mensual_estimado_eur.toFixed(0)}€ al mes.`
      : `Tu compañía te cobra ${(1 + desv / 100).toFixed(1)}x la tarifa oficial. Podrías ahorrar ${resultado.ahorro_mensual_estimado_eur.toFixed(0)}€ al mes.`

  return (
    <ResultadoLayout
      verdict={verdict} titulo={titulo} frase={frase}
      alertas={resultado.alertas}
      ahorroMensual={resultado.ahorro_mensual_estimado_eur}
      ahorroAnual={resultado.ahorro_anual_estimado_eur}
    >
      {tur && resultado.esta_en_tur && (
        <TurContextCard tur={tur} tramo={resultado.tramo_tur} />
      )}
      {tur && !resultado.esta_en_tur && (
        <CompTable titulo={`Comparativa con la TUR (${resultado.tramo_tur})`} rows={[
          {
            concepto: "Variable (€/kWh)",
            tuFactura: factura?.termino_variable_eur_kwh?.toFixed(6) ?? "—",
            referencia: tur.variable_eur_kwh.toFixed(6),
            diferencia: resultado.desviacion_variable_pct,
          },
          {
            concepto: "Fijo (€/día)",
            tuFactura: factura?.termino_fijo_eur_dia?.toFixed(6) ?? "—",
            referencia: tur.fijo_eur_dia.toFixed(6),
            diferencia: resultado.desviacion_fijo_pct,
          },
        ]} />
      )}
      {!resultado.esta_en_tur && <QuePuedoHacer comercializadoras={COMERCIALIZADORAS_GAS} tarifa="TUR" />}
    </ResultadoLayout>
  )
}

// ─── Electricidad ──────────────────────────────────────────────────────────────

function ElectricResultado({ resultado, factura }: { resultado: ElectricAnalysisResult; factura: ElectricBillData | null }) {
  if (!resultado.elegible_pvpc) return <NoElegible razon={resultado.razon_no_elegible} />

  const desv = resultado.desviacion_energia_pct
  const verdict: Verdict = resultado.esta_en_pvpc || desv <= 20 ? "verde" : desv <= 60 ? "amarillo" : "rojo"
  const pvpc = resultado.pvpc_referencia

  const titulo = verdict === "verde" ? "Estás bien" : verdict === "amarillo" ? "Podrías mejorar" : "Te están cobrando de más"
  const frase = verdict === "verde"
    ? (resultado.esta_en_pvpc ? "Estás en el PVPC, la tarifa regulada. Bien hecho." : "Tu precio de energía está dentro de los límites razonables respecto al PVPC.")
    : verdict === "amarillo"
      ? `Tu compañía te cobra un ${Math.round(desv)}% más que el PVPC del mismo período. Podrías ahorrar ${resultado.ahorro_mensual_estimado_eur.toFixed(0)}€ al mes.`
      : `Tu compañía te cobra ${(1 + desv / 100).toFixed(1)}x el PVPC. Podrías ahorrar ${resultado.ahorro_mensual_estimado_eur.toFixed(0)}€ al mes.`

  return (
    <ResultadoLayout
      verdict={verdict} titulo={titulo} frase={frase}
      alertas={resultado.alertas}
      ahorroMensual={resultado.ahorro_mensual_estimado_eur}
      ahorroAnual={resultado.ahorro_anual_estimado_eur}
    >
      {pvpc && resultado.esta_en_pvpc && (
        <PvpcContextCard pvpc={pvpc} tuPrecio={factura?.termino_energia_eur_kwh ?? null} />
      )}
      {pvpc && !resultado.esta_en_pvpc && (
        <CompTable
          titulo="Comparativa con el PVPC"
          subtitulo={`Precio medio real · ${pvpc.fecha_inicio} → ${pvpc.fecha_fin} · ${pvpc.zona}`}
          rows={[{
            concepto: "Energía (€/kWh)",
            tuFactura: factura?.termino_energia_eur_kwh?.toFixed(5) ?? "—",
            referencia: pvpc.media_eur_kwh.toFixed(5),
            diferencia: desv,
          }]}
        />
      )}
      {!resultado.esta_en_pvpc && <QuePuedoHacer comercializadoras={COMERCIALIZADORAS_ELECTRIC} tarifa="PVPC" />}
    </ResultadoLayout>
  )
}

// ─── Shared layout ─────────────────────────────────────────────────────────────

function ResultadoLayout({ verdict, titulo, frase, alertas, ahorroMensual, ahorroAnual, children }: {
  verdict: Verdict
  titulo: string
  frase: string
  alertas: string[]
  ahorroMensual: number
  ahorroAnual: number
  children?: React.ReactNode
}) {
  const s = VERDICT_STYLES[verdict]
  const icon = verdict === "verde" ? "✓" : verdict === "amarillo" ? "!" : "✕"

  return (
    <main className="min-h-screen bg-white">
      <Nav back />
      <div className="max-w-xl mx-auto px-6 py-8 space-y-5">

        {/* Veredicto */}
        <div className="rounded-2xl p-6 flex gap-4 items-start" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ background: s.badgeBg }}
          >
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-semibold mb-1" style={{ color: s.titleColor }}>{titulo}</h1>
            <p className="text-base leading-relaxed" style={{ color: s.textColor }}>{frase}</p>
          </div>
        </div>

        {/* Ahorro */}
        {ahorroMensual > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <SavingCard label="Ahorro mensual" value={`${ahorroMensual.toFixed(0)}€`} />
            <SavingCard label="Ahorro anual" value={`${ahorroAnual.toFixed(0)}€`} />
          </div>
        )}

        {children}

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="rounded-xl p-5 border border-amber-200 bg-amber-50">
            <h2 className="text-base font-semibold text-amber-900 mb-3">Alertas detectadas</h2>
            <ul className="space-y-2">
              {alertas.map((a, i) => (
                <li key={i} className="flex gap-2 text-sm text-amber-800 leading-relaxed">
                  <span className="flex-shrink-0 mt-0.5">⚠</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-block px-8 py-3 text-base font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
            style={{ background: "#185FA5" }}
          >
            Analizar otra factura
          </Link>
        </div>
      </div>
    </main>
  )
}

function SavingCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: "#E6F1FB" }}>
      <p className="text-xs font-medium mb-1" style={{ color: "#185FA5" }}>{label}</p>
      <p className="text-3xl font-semibold" style={{ color: "#0C447C" }}>{value}</p>
    </div>
  )
}

function CompTable({ titulo, subtitulo, rows }: {
  titulo: string
  subtitulo?: string
  rows: { concepto: string; tuFactura: string; referencia: string; diferencia: number | null }[]
}) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100" style={{ background: "#F5FAFF" }}>
        <h2 className="text-base font-semibold text-gray-900">{titulo}</h2>
        {subtitulo && <p className="text-xs text-gray-500 mt-0.5">{subtitulo}</p>}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500">Concepto</th>
            <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500">Tu factura</th>
            <th className="text-right px-3 py-2.5 text-xs font-medium text-gray-500">Referencia</th>
            <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500">Dif.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i < rows.length - 1 ? "border-b border-gray-50" : ""}>
              <td className="px-5 py-3 text-gray-700">{row.concepto}</td>
              <td className="px-3 py-3 text-right font-medium text-gray-900">{row.tuFactura}</td>
              <td className="px-3 py-3 text-right font-medium" style={{ color: "#3B6D11" }}>{row.referencia}</td>
              <td className="px-5 py-3 text-right font-semibold" style={{ color: row.diferencia === null ? "#9ca3af" : row.diferencia > 0 ? "#DC2626" : "#16A34A" }}>
                {row.diferencia === null ? "—" : `${row.diferencia > 0 ? "+" : ""}${row.diferencia.toFixed(1)}%`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QuePuedoHacer({ comercializadoras, tarifa }: {
  comercializadoras: { nombre: string; telefono: string }[]
  tarifa: "TUR" | "PVPC"
}) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100" style={{ background: "#F5FAFF" }}>
        <h2 className="text-base font-semibold text-gray-900">¿Qué puedo hacer?</h2>
        <p className="text-sm text-gray-600 mt-1">
          El cambio a la {tarifa} es <strong>gratuito</strong>. Llama a tu comercializadora de referencia:
        </p>
      </div>
      <ul>
        {comercializadoras.map((c) => (
          <li key={c.nombre} className="flex justify-between items-center px-5 py-3 border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-700">{c.nombre}</span>
            <span className="text-sm font-semibold" style={{ color: "#185FA5" }}>{c.telefono}</span>
          </li>
        ))}
      </ul>
      <div className="px-5 py-4 border-t border-gray-100">
        <a
          href="https://comparador.cnmc.gob.es"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline"
          style={{ color: "#378ADD" }}
        >
          Ver comparador oficial de la CNMC →
        </a>
      </div>
    </div>
  )
}

function TurContextCard({ tur, tramo }: {
  tur: { fijo_eur_dia: number; variable_eur_kwh: number; entrada: { vigente_desde: string; vigente_hasta: string; fuente: string } }
  tramo: string | null
}) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100" style={{ background: "#F5FAFF" }}>
        <h2 className="text-base font-semibold text-gray-900">Tu tarifa regulada ({tramo})</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Vigente desde {tur.entrada.vigente_desde} · {tur.entrada.fuente}
        </p>
      </div>
      <div className="divide-y divide-gray-50">
        <div className="flex justify-between items-center px-5 py-3">
          <span className="text-sm text-gray-600">Término variable</span>
          <span className="text-sm font-semibold text-gray-900">{tur.variable_eur_kwh.toFixed(6)} €/kWh</span>
        </div>
        <div className="flex justify-between items-center px-5 py-3">
          <span className="text-sm text-gray-600">Término fijo</span>
          <span className="text-sm font-semibold text-gray-900">{tur.fijo_eur_dia.toFixed(6)} €/día</span>
        </div>
      </div>
    </div>
  )
}

function PvpcContextCard({ pvpc, tuPrecio }: {
  pvpc: { fecha_inicio: string; fecha_fin: string; zona: string; media_eur_kwh: number; min_eur_kwh: number; max_eur_kwh: number }
  tuPrecio: number | null
}) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100" style={{ background: "#F5FAFF" }}>
        <h2 className="text-base font-semibold text-gray-900">Precios PVPC de tu período</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {pvpc.fecha_inicio} → {pvpc.fecha_fin} · {pvpc.zona}
        </p>
      </div>
      <div className="divide-y divide-gray-50">
        {tuPrecio !== null && (
          <div className="flex justify-between items-center px-5 py-3">
            <span className="text-sm text-gray-600">Tu precio en factura</span>
            <span className="text-sm font-semibold text-gray-900">{tuPrecio.toFixed(5)} €/kWh</span>
          </div>
        )}
        <div className="flex justify-between items-center px-5 py-3">
          <span className="text-sm text-gray-600">Precio medio del período</span>
          <span className="text-sm font-semibold text-gray-900">{pvpc.media_eur_kwh.toFixed(5)} €/kWh</span>
        </div>
        <div className="flex justify-between items-center px-5 py-3">
          <span className="text-sm text-gray-500 text-xs">Precio más bajo del período</span>
          <span className="text-xs text-gray-500">{pvpc.min_eur_kwh.toFixed(5)} €/kWh</span>
        </div>
        <div className="flex justify-between items-center px-5 py-3">
          <span className="text-sm text-gray-500 text-xs">Precio más alto del período</span>
          <span className="text-xs text-gray-500">{pvpc.max_eur_kwh.toFixed(5)} €/kWh</span>
        </div>
      </div>
    </div>
  )
}

function NoElegible({ razon }: { razon: string | null }) {
  return (
    <main className="min-h-screen bg-white">
      <Nav back />
      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-3">Resultado del análisis</h1>
          <p className="text-base text-gray-700 leading-relaxed">{razon}</p>
        </div>
      </div>
    </main>
  )
}
