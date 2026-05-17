"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type AnalysisResult = {
  elegible_tur: boolean
  razon_no_elegible: string | null
  esta_en_tur: boolean
  tramo_tur: "TUR1" | "TUR2" | "TUR3" | null
  tur_referencia: {
    tramo: string
    fijo_eur_dia: number
    variable_eur_kwh: number
    entrada: {
      vigente_desde: string
      vigente_hasta: string
      fuente: string
    }
  } | null
  desviacion_variable_pct: number
  desviacion_fijo_pct: number
  ahorro_mensual_estimado_eur: number
  ahorro_anual_estimado_eur: number
  tiene_descuento_trampa: boolean
  alertas: string[]
}

type Verdict = "verde" | "amarillo" | "rojo"

function getVerdict(resultado: AnalysisResult): Verdict {
  if (resultado.esta_en_tur || resultado.desviacion_variable_pct <= 20) return "verde"
  if (resultado.desviacion_variable_pct <= 60) return "amarillo"
  return "rojo"
}

const COLORS = {
  verde: {
    bg: "bg-green-50",
    border: "border-green-500",
    text: "text-green-800",
    badge: "bg-green-500",
    icon: "✓",
  },
  amarillo: {
    bg: "bg-yellow-50",
    border: "border-yellow-500",
    text: "text-yellow-800",
    badge: "bg-yellow-500",
    icon: "!",
  },
  rojo: {
    bg: "bg-red-50",
    border: "border-red-500",
    text: "text-red-800",
    badge: "bg-red-500",
    icon: "✕",
  },
}

function getFrase(resultado: AnalysisResult, verdict: Verdict): string {
  if (!resultado.elegible_tur) return resultado.razon_no_elegible ?? ""
  if (verdict === "verde") {
    return resultado.esta_en_tur
      ? "Estás en la tarifa oficial del Gobierno. Bien hecho."
      : "Tu tarifa está dentro de los límites razonables respecto a la tarifa oficial."
  }
  const ahorro = resultado.ahorro_mensual_estimado_eur
  const ahorroAnual = resultado.ahorro_anual_estimado_eur
  if (verdict === "amarillo") {
    return `Tu compañía te cobra un ${Math.round(resultado.desviacion_variable_pct)}% más que la tarifa oficial. Podrías ahorrar unos ${ahorro.toFixed(0)}€ al mes.`
  }
  return `Tu compañía te cobra el ${(1 + resultado.desviacion_variable_pct / 100).toFixed(1)}x que la tarifa oficial. Podrías ahorrar unos ${ahorro.toFixed(0)}€ al mes, más de ${ahorroAnual.toFixed(0)}€ al año.`
}

const COMERCIALIZADORAS_REFERENCIA = [
  { nombre: "Curenergía (Iberdrola)", telefono: "900 200 422" },
  { nombre: "Endesa Energía XXI", telefono: "800 760 333" },
  { nombre: "Naturgy Iberia", telefono: "900 100 251" },
  { nombre: "Repsol Electricidad y Gas", telefono: "900 100 100" },
  { nombre: "TotalEnergies Marketing España", telefono: "900 373 753" },
]

export default function ResultadoPage() {
  const [resultado, setResultado] = useState<AnalysisResult | null>(null)
  const router = useRouter()

  useEffect(() => {
    const raw = sessionStorage.getItem("fairenergy_resultado")
    if (!raw) {
      router.push("/")
      return
    }
    try {
      const parsed = JSON.parse(raw) as AnalysisResult
      // Schedule outside the effect body to avoid synchronous setState warning
      setTimeout(() => setResultado(parsed), 0)
    } catch {
      router.push("/")
    }
  }, [router])

  if (!resultado) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl text-gray-600">Cargando resultado…</p>
      </main>
    )
  }

  if (!resultado.elegible_tur) {
    return (
      <main className="min-h-screen bg-white max-w-2xl mx-auto px-6 py-16">
        <div className="border-2 border-gray-400 rounded-xl p-8 bg-gray-50">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Resultado del análisis</h1>
          <p className="text-xl text-gray-700">{resultado.razon_no_elegible}</p>
        </div>
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-700 text-lg underline hover:text-blue-900">
            Analizar otra factura
          </Link>
        </div>
      </main>
    )
  }

  const verdict = getVerdict(resultado)
  const colors = COLORS[verdict]
  const frase = getFrase(resultado, verdict)
  const tur = resultado.tur_referencia

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">

        {/* Indicador principal */}
        <div className={`border-2 ${colors.border} ${colors.bg} rounded-xl p-8`}>
          <div className="flex items-center gap-4 mb-4">
            <span className={`${colors.badge} text-white text-2xl font-bold w-12 h-12 flex items-center justify-center rounded-full`}>
              {colors.icon}
            </span>
            <h1 className={`text-3xl font-bold ${colors.text}`}>
              {verdict === "verde" ? "Estás bien" : verdict === "amarillo" ? "Podrías mejorar" : "Te están cobrando de más"}
            </h1>
          </div>
          <p className={`text-2xl font-medium ${colors.text} leading-tight`}>{frase}</p>
        </div>

        {/* Desglose comparativo */}
        {tur && (
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Comparativa con la tarifa oficial</h2>
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
                  <td className="py-3 text-right font-medium">—</td>
                  <td className="py-3 text-right text-green-700">{tur.variable_eur_kwh.toFixed(6)}</td>
                  <td className={`py-3 text-right font-bold ${resultado.desviacion_variable_pct > 0 ? "text-red-700" : "text-green-700"}`}>
                    {resultado.desviacion_variable_pct > 0 ? "+" : ""}{resultado.desviacion_variable_pct.toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-gray-800">Término fijo (€/día)</td>
                  <td className="py-3 text-right font-medium">—</td>
                  <td className="py-3 text-right text-green-700">{tur.fijo_eur_dia.toFixed(6)}</td>
                  <td className={`py-3 text-right font-bold ${resultado.desviacion_fijo_pct > 0 ? "text-red-700" : "text-green-700"}`}>
                    {resultado.desviacion_fijo_pct > 0 ? "+" : ""}{resultado.desviacion_fijo_pct.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>

            {(resultado.ahorro_mensual_estimado_eur > 0) && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-base text-blue-700 font-medium">Ahorro mensual estimado</p>
                  <p className="text-3xl font-bold text-blue-900">{resultado.ahorro_mensual_estimado_eur.toFixed(0)}€</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-base text-blue-700 font-medium">Ahorro anual estimado</p>
                  <p className="text-3xl font-bold text-blue-900">{resultado.ahorro_anual_estimado_eur.toFixed(0)}€</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alertas */}
        {resultado.alertas.length > 0 && (
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-orange-900 mb-4">Alertas detectadas</h2>
            <ul className="space-y-3">
              {resultado.alertas.map((alerta, i) => (
                <li key={i} className="flex gap-3 text-lg text-orange-800">
                  <span className="mt-1 shrink-0">⚠</span>
                  <span>{alerta}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ¿Qué puedo hacer? */}
        {!resultado.esta_en_tur && resultado.elegible_tur && (
          <div className="border border-gray-200 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Qué puedo hacer?</h2>
            <p className="text-lg text-gray-700 mb-6">
              Tienes derecho a cambiar a la Tarifa de Último Recurso (TUR), que es la tarifa
              regulada por el Gobierno. El cambio es <strong>gratuito</strong> y puedes
              solicitarlo por teléfono. Llama a la comercializadora de referencia de tu zona:
            </p>
            <ul className="space-y-3 mb-6">
              {COMERCIALIZADORAS_REFERENCIA.map((c) => (
                <li key={c.nombre} className="flex justify-between items-center text-lg border-b border-gray-100 pb-3">
                  <span className="text-gray-800 font-medium">{c.nombre}</span>
                  <span className="text-blue-700 font-bold">{c.telefono}</span>
                </li>
              ))}
            </ul>
            <p className="text-base text-gray-600">
              También puedes comparar todas las opciones en el{" "}
              <a
                href="https://comparador.cnmc.gob.es"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 underline hover:text-blue-900"
              >
                comparador oficial de la CNMC
              </a>.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
              <p className="text-lg text-blue-900 font-medium">
                El cambio a TUR es gratuito. Puedes solicitarlo por teléfono.
              </p>
            </div>
          </div>
        )}

        {/* Botón volver */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-block px-8 py-4 text-xl font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Analizar otra factura
          </Link>
        </div>
      </div>
    </main>
  )
}
