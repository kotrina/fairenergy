"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

// --- Gas types ---
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

// --- Electric types ---
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

const COLORS = {
  verde: { bg: "bg-green-50", border: "border-green-500", text: "text-green-800", badge: "bg-green-500", icon: "✓" },
  amarillo: { bg: "bg-yellow-50", border: "border-yellow-500", text: "text-yellow-800", badge: "bg-yellow-500", icon: "!" },
  rojo: { bg: "bg-red-50", border: "border-red-500", text: "text-red-800", badge: "bg-red-500", icon: "✕" },
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
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Cargando resultado…</p>
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

// ─── Gas resultado ─────────────────────────────────────────────────────────────

function GasResultado({ resultado, factura }: { resultado: GasAnalysisResult; factura: GasBillData | null }) {
  if (!resultado.elegible_tur) {
    return <NoElegible razon={resultado.razon_no_elegible} />
  }

  const desv = resultado.desviacion_variable_pct
  const verdict: Verdict = resultado.esta_en_tur || desv <= 20 ? "verde" : desv <= 60 ? "amarillo" : "rojo"
  const colors = COLORS[verdict]
  const tur = resultado.tur_referencia

  const frase = verdict === "verde"
    ? (resultado.esta_en_tur
        ? "Estás en la tarifa oficial del Gobierno. Bien hecho."
        : "Tu tarifa está dentro de los límites razonables respecto a la tarifa oficial.")
    : verdict === "amarillo"
      ? `Tu compañía te cobra un ${Math.round(desv)}% más que la tarifa oficial. Podrías ahorrar unos ${resultado.ahorro_mensual_estimado_eur.toFixed(0)}€ al mes.`
      : `Tu compañía te cobra el ${(1 + desv / 100).toFixed(1)}x que la tarifa oficial. Podrías ahorrar unos ${resultado.ahorro_mensual_estimado_eur.toFixed(0)}€ al mes, más de ${resultado.ahorro_anual_estimado_eur.toFixed(0)}€ al año.`

  return (
    <ResultadoLayout
      verdict={verdict} colors={colors}
      titulo={verdict === "verde" ? "Estás bien" : verdict === "amarillo" ? "Podrías mejorar" : "Te están cobrando de más"}
      frase={frase}
      alertas={resultado.alertas}
      ahorroMensual={resultado.ahorro_mensual_estimado_eur}
      ahorroAnual={resultado.ahorro_anual_estimado_eur}
    >
      {tur && (
        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comparativa con la tarifa oficial (TUR)</h2>
          <table className="w-full text-lg">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="pb-2">Concepto</th>
                <th className="pb-2 text-right">Tu factura</th>
                <th className="pb-2 text-right">TUR ({resultado.tramo_tur})</th>
                <th className="pb-2 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 text-gray-800">Término variable (€/kWh)</td>
                <td className="py-3 text-right font-medium text-gray-900">
                  {factura?.termino_variable_eur_kwh != null ? factura.termino_variable_eur_kwh.toFixed(6) : "—"}
                </td>
                <td className="py-3 text-right text-green-700">{tur.variable_eur_kwh.toFixed(6)}</td>
                <td className={`py-3 text-right font-bold ${resultado.desviacion_variable_pct > 0 ? "text-red-700" : "text-green-700"}`}>
                  {resultado.desviacion_variable_pct > 0 ? "+" : ""}{resultado.desviacion_variable_pct.toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="py-3 text-gray-800">Término fijo (€/día)</td>
                <td className="py-3 text-right font-medium text-gray-900">
                  {factura?.termino_fijo_eur_dia != null ? factura.termino_fijo_eur_dia.toFixed(6) : "—"}
                </td>
                <td className="py-3 text-right text-green-700">{tur.fijo_eur_dia.toFixed(6)}</td>
                <td className={`py-3 text-right font-bold ${resultado.desviacion_fijo_pct > 0 ? "text-red-700" : "text-green-700"}`}>
                  {resultado.desviacion_fijo_pct > 0 ? "+" : ""}{resultado.desviacion_fijo_pct.toFixed(1)}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {!resultado.esta_en_tur && <QuePuedoHacer comercializadoras={COMERCIALIZADORAS_GAS} tarifa="TUR" />}
    </ResultadoLayout>
  )
}

// ─── Electricidad resultado ────────────────────────────────────────────────────

function ElectricResultado({ resultado, factura }: { resultado: ElectricAnalysisResult; factura: ElectricBillData | null }) {
  if (!resultado.elegible_pvpc) {
    return <NoElegible razon={resultado.razon_no_elegible} />
  }

  const desv = resultado.desviacion_energia_pct
  const verdict: Verdict = resultado.esta_en_pvpc || desv <= 20 ? "verde" : desv <= 60 ? "amarillo" : "rojo"
  const colors = COLORS[verdict]
  const pvpc = resultado.pvpc_referencia

  const frase = verdict === "verde"
    ? (resultado.esta_en_pvpc
        ? "Estás en el PVPC, la tarifa regulada del Gobierno. Bien hecho."
        : "Tu precio de la energía está dentro de los límites razonables respecto al PVPC.")
    : verdict === "amarillo"
      ? `Tu compañía te cobra un ${Math.round(desv)}% más que el PVPC del mismo período. Podrías ahorrar unos ${resultado.ahorro_mensual_estimado_eur.toFixed(0)}€ al mes.`
      : `Tu compañía te cobra el ${(1 + desv / 100).toFixed(1)}x que el PVPC. Podrías ahorrar unos ${resultado.ahorro_mensual_estimado_eur.toFixed(0)}€ al mes, más de ${resultado.ahorro_anual_estimado_eur.toFixed(0)}€ al año.`

  return (
    <ResultadoLayout
      verdict={verdict} colors={colors}
      titulo={verdict === "verde" ? "Estás bien" : verdict === "amarillo" ? "Podrías mejorar" : "Te están cobrando de más"}
      frase={frase}
      alertas={resultado.alertas}
      ahorroMensual={resultado.ahorro_mensual_estimado_eur}
      ahorroAnual={resultado.ahorro_anual_estimado_eur}
    >
      {pvpc && (
        <div className="border border-gray-200 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comparativa con el PVPC</h2>
          <p className="text-sm text-gray-500 mb-4">
            Precio medio PVPC del período {pvpc.fecha_inicio} → {pvpc.fecha_fin} · {pvpc.zona}
          </p>
          <table className="w-full text-lg">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="pb-2">Concepto</th>
                <th className="pb-2 text-right">Tu factura</th>
                <th className="pb-2 text-right">PVPC medio</th>
                <th className="pb-2 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="py-3 text-gray-800">Precio energía (€/kWh)</td>
                <td className="py-3 text-right font-medium text-gray-900">
                  {factura?.termino_energia_eur_kwh != null ? factura.termino_energia_eur_kwh.toFixed(5) : "—"}
                </td>
                <td className="py-3 text-right text-green-700">{pvpc.media_eur_kwh.toFixed(5)}</td>
                <td className={`py-3 text-right font-bold ${desv > 0 ? "text-red-700" : "text-green-700"}`}>
                  {desv > 0 ? "+" : ""}{desv.toFixed(1)}%
                </td>
              </tr>
              <tr>
                <td className="py-3 text-gray-500 text-base">Mínimo PVPC del período</td>
                <td className="py-3 text-right text-gray-400">—</td>
                <td className="py-3 text-right text-gray-600 text-base">{pvpc.min_eur_kwh.toFixed(5)}</td>
                <td className="py-3 text-right text-gray-400">—</td>
              </tr>
              <tr>
                <td className="py-3 text-gray-500 text-base">Máximo PVPC del período</td>
                <td className="py-3 text-right text-gray-400">—</td>
                <td className="py-3 text-right text-gray-600 text-base">{pvpc.max_eur_kwh.toFixed(5)}</td>
                <td className="py-3 text-right text-gray-400">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {!resultado.esta_en_pvpc && <QuePuedoHacer comercializadoras={COMERCIALIZADORAS_ELECTRIC} tarifa="PVPC" />}
    </ResultadoLayout>
  )
}

// ─── Shared layout ─────────────────────────────────────────────────────────────

function ResultadoLayout({
  colors, titulo, frase, alertas, ahorroMensual, ahorroAnual, children,
}: {
  verdict?: Verdict
  colors: typeof COLORS["verde"]
  titulo: string
  frase: string
  alertas: string[]
  ahorroMensual: number
  ahorroAnual: number
  children?: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div className={`border-2 ${colors.border} ${colors.bg} rounded-xl p-8`}>
          <div className="flex items-center gap-4 mb-4">
            <span className={`${colors.badge} text-white text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full`}>
              {colors.icon}
            </span>
            <h1 className={`text-3xl font-bold ${colors.text}`}>{titulo}</h1>
          </div>
          <p className={`text-2xl font-medium ${colors.text} leading-tight`}>{frase}</p>
        </div>

        {children}

        {ahorroMensual > 0 && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-base text-blue-700 font-medium">Ahorro mensual estimado</p>
              <p className="text-3xl font-bold text-blue-900">{ahorroMensual.toFixed(0)}€</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-base text-blue-700 font-medium">Ahorro anual estimado</p>
              <p className="text-3xl font-bold text-blue-900">{ahorroAnual.toFixed(0)}€</p>
            </div>
          </div>
        )}

        {alertas.length > 0 && (
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">Alertas detectadas</h2>
            <ul className="space-y-3">
              {alertas.map((alerta, i) => (
                <li key={i} className="flex gap-3 text-lg text-orange-800">
                  <span className="mt-1 shrink-0">⚠</span>
                  <span>{alerta}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/" className="inline-block px-8 py-4 text-xl font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors">
            Analizar otra factura
          </Link>
        </div>
      </div>
    </main>
  )
}

function QuePuedoHacer({
  comercializadoras, tarifa,
}: {
  comercializadoras: { nombre: string; telefono: string }[]
  tarifa: "TUR" | "PVPC"
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Qué puedo hacer?</h2>
      <p className="text-lg text-gray-700 mb-6">
        Tienes derecho a cambiar a la tarifa regulada ({tarifa}). El cambio es{" "}
        <strong>gratuito</strong> y puedes solicitarlo por teléfono:
      </p>
      <ul className="space-y-3 mb-6">
        {comercializadoras.map((c) => (
          <li key={c.nombre} className="flex justify-between items-center text-lg border-b border-gray-100 pb-3">
            <span className="text-gray-800 font-medium">{c.nombre}</span>
            <span className="text-blue-700 font-bold">{c.telefono}</span>
          </li>
        ))}
      </ul>
      <p className="text-base text-gray-600">
        También puedes comparar todas las opciones en el{" "}
        <a href="https://comparador.cnmc.gob.es" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900">
          comparador oficial de la CNMC
        </a>.
      </p>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
        <p className="text-lg text-blue-900 font-medium">
          El cambio a {tarifa} es gratuito. Puedes solicitarlo hoy mismo por teléfono.
        </p>
      </div>
    </div>
  )
}

function NoElegible({ razon }: { razon: string | null }) {
  return (
    <main className="min-h-screen bg-white max-w-2xl mx-auto px-6 py-16">
      <div className="border-2 border-gray-400 rounded-xl p-8 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Resultado del análisis</h1>
        <p className="text-xl text-gray-700">{razon}</p>
      </div>
      <div className="mt-8 text-center">
        <Link href="/" className="text-blue-700 text-lg underline hover:text-blue-900">
          Analizar otra factura
        </Link>
      </div>
    </main>
  )
}
