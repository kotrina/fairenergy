"use client"

import { useState, useRef, FormEvent } from "react"
import { useRouter } from "next/navigation"
import Nav from "./components/Nav"
import Footer from "./components/Footer"

type Tab = "factura" | "manual"
type TipoEnergia = "gas" | "electricidad"

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("factura")
  const [tipoEnergia, setTipoEnergia] = useState<TipoEnergia>("gas")
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
      form.append("tipo_energia", tipoEnergia)
      const res = await fetch("/api/analizar", { method: "POST", body: form })
      const data = await res.json() as { success: boolean; tipo_energia?: string; data?: unknown; factura?: unknown; error?: string }
      if (!data.success) throw new Error(data.error ?? "Error desconocido")
      sessionStorage.setItem("fairenergy_tipo_energia", data.tipo_energia ?? tipoEnergia)
      sessionStorage.setItem("fairenergy_resultado", JSON.stringify(data.data))
      sessionStorage.setItem("fairenergy_factura", JSON.stringify(data.factura))
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
    const body = tipoEnergia === "gas" ? buildGasBody(fd) : buildElectricBody(fd)
    try {
      const res = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { success: boolean; tipo_energia?: string; data?: unknown; factura?: unknown; error?: string }
      if (!data.success) throw new Error(data.error ?? "Error desconocido")
      sessionStorage.setItem("fairenergy_tipo_energia", data.tipo_energia ?? tipoEnergia)
      sessionStorage.setItem("fairenergy_resultado", JSON.stringify(data.data))
      sessionStorage.setItem("fairenergy_factura", JSON.stringify(data.factura))
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

  function handleTipoEnergia(tipo: TipoEnergia) {
    setTipoEnergia(tipo)
    setFile(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      <Nav />

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-6 pt-12 pb-8 text-center">
        <h1 className="text-4xl font-bold leading-tight text-gray-900 mb-4">
          ¿Te están cobrando de más<br className="hidden sm:block" /> en tu factura de energía?
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
          Sube tu factura y en segundos sabrás cuánto puedes ahorrar,
          en euros y sin tecnicismos.
        </p>
      </section>

      <section className="max-w-xl mx-auto px-6 pb-16">

        {/* Selector gas / electricidad */}
        <div
          className="flex p-1 rounded-xl mb-8"
          style={{ background: "#E6F1FB" }}
        >
          <EnergyButton
            active={tipoEnergia === "gas"}
            onClick={() => handleTipoEnergia("gas")}
            icon={<FlameIcon active={tipoEnergia === "gas"} />}
            label="Gas natural"
          />
          <EnergyButton
            active={tipoEnergia === "electricidad"}
            onClick={() => handleTipoEnergia("electricidad")}
            icon={<BoltIcon active={tipoEnergia === "electricidad"} />}
            label="Electricidad"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <TabButton active={tab === "factura"} onClick={() => setTab("factura")}>
            Subir mi factura
          </TabButton>
          <TabButton active={tab === "manual"} onClick={() => setTab("manual")}>
            Datos manuales
          </TabButton>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-base">
            {error}
          </div>
        )}

        {/* Tab A: subir factura */}
        {tab === "factura" && (
          <form onSubmit={handleFileSubmit}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="rounded-xl p-10 text-center cursor-pointer transition-all"
              style={{
                background: dragging ? "#E6F1FB" : "#F5FAFF",
                border: `1.5px dashed ${dragging ? "#378ADD" : "#85B7EB"}`,
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <p className="text-lg font-medium text-gray-900">{file.name}</p>
              ) : (
                <>
                  <UploadIcon />
                  <p className="text-base font-medium mt-3 mb-1" style={{ color: "#185FA5" }}>
                    Arrastra tu factura aquí
                  </p>
                  <p className="text-sm" style={{ color: "#378ADD" }}>
                    PDF, JPEG o PNG · o haz clic para seleccionar
                  </p>
                </>
              )}
            </div>

            <p className="mt-3 text-sm text-gray-500 text-center flex items-center justify-center gap-1.5">
              <LockIcon />
              Tu factura se analiza y se descarta. No la guardamos.
            </p>

            <button
              type="submit"
              disabled={!file || loading}
              className="mt-5 w-full py-4 text-base font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: loading || !file ? "#378ADD" : "#185FA5" }}
            >
              <SearchIcon />
              {loading ? "Analizando…" : "Analizar mi factura"}
            </button>
          </form>
        )}

        {/* Tab B: manual */}
        {tab === "manual" && (
          tipoEnergia === "gas"
            ? <GasManualForm onSubmit={handleManualSubmit} loading={loading} />
            : <ElectricManualForm onSubmit={handleManualSubmit} loading={loading} />
        )}
      </section>

      <Footer />
    </main>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function EnergyButton({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all"
      style={active
        ? { background: "white", color: "#185FA5", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }
        : { color: "#378ADD" }
      }
    >
      {icon}
      {label}
    </button>
  )
}

function TabButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-3 text-base font-medium border-b-2 transition-colors"
      style={active
        ? { borderColor: "#378ADD", color: "#185FA5" }
        : { borderColor: "transparent", color: "#6b7280" }
      }
    >
      {children}
    </button>
  )
}

function GasManualForm({ onSubmit, loading }: { onSubmit: (e: FormEvent<HTMLFormElement>) => void; loading: boolean }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="tipo_energia" value="gas" />
      <Field label="¿Cuál es tu compañía de gas?" name="comercializadora" type="text" placeholder="Ej: Naturgy, Endesa, Iberdrola…" />
      <Field label="Nombre de tu tarifa o producto" name="producto" type="text" placeholder="Ej: Gas Plano, Tarifa Estable…" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          ¿Estás en mercado libre o en tarifa regulada?
        </label>
        <select name="es_mercado_libre" required className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2" >
          <option value="">Selecciona una opción</option>
          <option value="mercado_libre">Mercado libre</option>
          <option value="regulada">Tarifa regulada (TUR)</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha de inicio" name="fecha_inicio" type="date" required />
        <Field label="Fecha de fin" name="fecha_fin" type="date" required />
      </div>
      <Field label="kWh consumidos en el período" name="consumo_kwh" type="number" placeholder="Ej: 320" step="0.01" required />
      <Field label="Término fijo (€/día)" name="termino_fijo_eur_dia" type="number" placeholder="Ej: 0.15" step="0.000001" required />
      <Field label="Término variable (€/kWh)" name="termino_variable_eur_kwh" type="number" placeholder="Ej: 0.075" step="0.000001" required />
      <Field label="Descuento (%) — opcional" name="descuento_pct" type="number" placeholder="Ej: 5" step="0.1" />
      <Field label="Presión en bar — opcional" name="presion_bar" type="number" placeholder="Ej: 0.05" step="0.01" />
      <SubmitButton loading={loading} label="Analizar mis datos" />
    </form>
  )
}

function ElectricManualForm({ onSubmit, loading }: { onSubmit: (e: FormEvent<HTMLFormElement>) => void; loading: boolean }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="tipo_energia" value="electricidad" />
      <Field label="¿Cuál es tu compañía eléctrica?" name="comercializadora" type="text" placeholder="Ej: Endesa, Iberdrola, Naturgy…" />
      <Field label="Nombre de tu tarifa o producto" name="producto" type="text" placeholder="Ej: Tarifa Nocturna, Tempo Libre…" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          ¿Estás en mercado libre o en PVPC?
        </label>
        <select name="es_mercado_libre" required className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2">
          <option value="">Selecciona una opción</option>
          <option value="mercado_libre">Mercado libre</option>
          <option value="regulada">PVPC (tarifa regulada)</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Fecha de inicio" name="fecha_inicio" type="date" required />
        <Field label="Fecha de fin" name="fecha_fin" type="date" required />
      </div>
      <Field label="kWh consumidos en el período" name="consumo_kwh" type="number" placeholder="Ej: 180" step="0.01" required />
      <Field label="Potencia contratada (kW)" name="potencia_contratada_kw" type="number" placeholder="Ej: 3.45" step="0.01" />
      <Field label="Término de potencia (€/kW/día)" name="termino_potencia_eur_kw_dia" type="number" placeholder="Ej: 0.104" step="0.000001" />
      <Field label="Precio de la energía (€/kWh)" name="termino_energia_eur_kwh" type="number" placeholder="Ej: 0.18" step="0.000001" required />
      <Field label="Descuento (%) — opcional" name="descuento_pct" type="number" placeholder="Ej: 5" step="0.1" />
      <SubmitButton loading={loading} label="Analizar mis datos" />
    </form>
  )
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-4 text-base font-semibold text-white rounded-xl flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: "#185FA5" }}
    >
      <SearchIcon />
      {loading ? "Analizando…" : label}
    </button>
  )
}

function Field({ label, name, type, placeholder, step, required }: {
  label: string; name: string; type: string; placeholder?: string; step?: string; required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        step={step}
        required={required}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent"
      />
    </div>
  )
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function FlameIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={active ? "#378ADD" : "#378ADD"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z"/>
    </svg>
  )
}

function BoltIcon({ active }: { active?: boolean }) {
  const color = active !== undefined ? (active ? "#378ADD" : "#378ADD") : "white"
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#378ADD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mx-auto">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

// ─── Form data helpers ──────────────────────────────────────────────────────────

function buildGasBody(fd: FormData) {
  const descuentoPct = fd.get("descuento_pct")
  return {
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
}

function buildElectricBody(fd: FormData) {
  const descuentoPct = fd.get("descuento_pct")
  return {
    tipo_energia: "electricidad",
    comercializadora: fd.get("comercializadora") as string || null,
    producto: fd.get("producto") as string || null,
    es_mercado_libre: fd.get("es_mercado_libre") === "mercado_libre",
    fecha_inicio: fd.get("fecha_inicio") as string || null,
    fecha_fin: fd.get("fecha_fin") as string || null,
    dias_facturados: calcularDias(fd.get("fecha_inicio") as string, fd.get("fecha_fin") as string),
    consumo_kwh: parseNum(fd.get("consumo_kwh")),
    potencia_contratada_kw: parseNum(fd.get("potencia_contratada_kw")),
    termino_potencia_eur_kw_dia: parseNum(fd.get("termino_potencia_eur_kw_dia")),
    termino_energia_eur_kwh: parseNum(fd.get("termino_energia_eur_kwh")),
    descuentos: descuentoPct ? [{ descripcion: "Descuento comercial", porcentaje: Number(descuentoPct) }] : [],
    importe_total: null,
  }
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
