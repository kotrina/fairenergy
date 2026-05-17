"use client"

import { useState, useRef, FormEvent } from "react"
import { useRouter } from "next/navigation"

type Tab = "factura" | "manual"

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("factura")
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFileSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append("factura", file)
      form.append("tipo_energia", "gas")
      const res = await fetch("/api/analizar", { method: "POST", body: form })
      const data = await res.json() as { success: boolean; data?: unknown; error?: string }
      if (!data.success) throw new Error(data.error ?? "Error desconocido")
      sessionStorage.setItem("fairenergy_resultado", JSON.stringify(data.data))
      router.push("/resultado")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al analizar la factura")
    } finally {
      setLoading(false)
    }
  }

  async function handleManualSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const descuentoPct = fd.get("descuento_pct")
    const body = {
      tipo_energia: "gas",
      comercializadora: fd.get("comercializadora") as string || null,
      producto: fd.get("producto") as string || null,
      es_mercado_libre: fd.get("es_mercado_libre") === "mercado_libre",
      fecha_inicio: fd.get("fecha_inicio") as string || null,
      fecha_fin: fd.get("fecha_fin") as string || null,
      dias_facturados: calcularDias(fd.get("fecha_inicio") as string, fd.get("fecha_fin") as string),
      consumo_kwh: parseNum(fd.get("consumo_kwh")),
      consumo_anual_estimado_kwh: null,
      termino_fijo_eur_dia: parseNum(fd.get("termino_fijo_eur_dia")),
      termino_variable_eur_kwh: parseNum(fd.get("termino_variable_eur_kwh")),
      presion_bar: parseNum(fd.get("presion_bar")),
      descuentos: descuentoPct ? [{ descripcion: "Descuento comercial", porcentaje: Number(descuentoPct) }] : [],
      importe_total: null,
      peaje_acceso: null,
    }
    try {
      const res = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { success: boolean; data?: unknown; error?: string }
      if (!data.success) throw new Error(data.error ?? "Error desconocido")
      sessionStorage.setItem("fairenergy_resultado", JSON.stringify(data.data))
      router.push("/resultado")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al analizar los datos")
    } finally {
      setLoading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-4xl font-bold leading-tight text-gray-900 mb-4">
          ¿Te están cobrando de más en la factura del gas?
        </h1>
        <p className="text-xl text-gray-700 max-w-xl mx-auto">
          Comparamos tu factura con la tarifa oficial del Gobierno español y te decimos
          cuánto puedes ahorrar, en euros y en lenguaje claro.
        </p>
      </section>

      {/* Tabs */}
      <section className="max-w-2xl mx-auto px-6 pb-16">
        <div className="flex border-b border-gray-300 mb-8">
          <button
            onClick={() => setTab("factura")}
            className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
              tab === "factura"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Subir mi factura
          </button>
          <button
            onClick={() => setTab("manual")}
            className={`px-6 py-3 text-lg font-medium border-b-2 transition-colors ${
              tab === "manual"
                ? "border-blue-700 text-blue-700"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Introducir datos manualmente
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-lg text-red-800 text-lg">
            {error}
          </div>
        )}

        {/* Tab A: Subir factura */}
        {tab === "factura" && (
          <form onSubmit={handleFileSubmit}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                dragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <p className="text-xl text-gray-900 font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-xl text-gray-700 mb-2">
                    Arrastra tu factura aquí o haz clic para seleccionarla
                  </p>
                  <p className="text-base text-gray-500">PDF, JPEG o PNG</p>
                </>
              )}
            </div>
            <p className="mt-4 text-base text-gray-600 text-center">
              Tu factura se analiza y se descarta. No la guardamos.
            </p>
            <button
              type="submit"
              disabled={!file || loading}
              className="mt-6 w-full py-4 text-xl font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Analizando…" : "Analizar mi factura"}
            </button>
          </form>
        )}

        {/* Tab B: Formulario manual */}
        {tab === "manual" && (
          <form onSubmit={handleManualSubmit} className="space-y-6">
            <Field label="¿Cuál es tu compañía de gas?" name="comercializadora" type="text" placeholder="Ej: Naturgy, Endesa, Iberdrola…" />
            <Field label="¿Cuál es el nombre de tu tarifa o producto?" name="producto" type="text" placeholder="Ej: Gas Plano, Tarifa Estable…" />

            <div>
              <label className="block text-lg font-medium text-gray-800 mb-2">
                ¿Estás en mercado libre o en tarifa regulada?
              </label>
              <select
                name="es_mercado_libre"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona una opción</option>
                <option value="mercado_libre">Mercado libre</option>
                <option value="regulada">Tarifa regulada (TUR)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Fecha de inicio del período" name="fecha_inicio" type="date" required />
              <Field label="Fecha de fin del período" name="fecha_fin" type="date" required />
            </div>

            <Field label="¿Cuántos kWh consumiste en este período?" name="consumo_kwh" type="number" placeholder="Ej: 320" step="0.01" required />
            <Field label="¿Cuánto pagas de término fijo al día? (€/día)" name="termino_fijo_eur_dia" type="number" placeholder="Ej: 0.15" step="0.000001" required />
            <Field label="¿Cuánto pagas por cada kWh consumido? (€/kWh)" name="termino_variable_eur_kwh" type="number" placeholder="Ej: 0.075" step="0.000001" required />
            <Field label="¿Tienes algún descuento? ¿Qué porcentaje? (opcional)" name="descuento_pct" type="number" placeholder="Ej: 5" step="0.1" />
            <Field label="Presión del suministro en bar (opcional, si aparece en la factura)" name="presion_bar" type="number" placeholder="Ej: 0.05" step="0.01" />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-xl font-semibold bg-blue-700 text-white rounded-xl hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Analizando…" : "Analizar mis datos"}
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-base text-gray-600">
        <p>
          <a
            href="https://comparador.cnmc.gob.es"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline hover:text-blue-900"
          >
            Comparador oficial de la CNMC
          </a>
        </p>
        <p className="mt-2">FairEnergy es una herramienta independiente y sin ánimo de lucro.</p>
      </footer>
    </main>
  )
}

function Field({
  label,
  name,
  type,
  placeholder,
  step,
  required,
}: {
  label: string
  name: string
  type: string
  placeholder?: string
  step?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-lg font-medium text-gray-800 mb-2">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        step={step}
        required={required}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}

function parseNum(val: FormDataEntryValue | null): number | null {
  if (!val || val === "") return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

function calcularDias(inicio: string, fin: string): number | null {
  if (!inicio || !fin) return null
  const ms = new Date(fin).getTime() - new Date(inicio).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}
