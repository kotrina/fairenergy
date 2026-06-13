import Link from "next/link"
import Nav from "../components/Nav"
import Footer from "../components/Footer"

export const metadata = {
  title: "Política de cookies — FairEnergy",
}

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 text-gray-700">
        <h1 className="text-2xl font-semibold text-gray-900">Política de cookies</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">¿Usamos cookies?</h2>
          <p>
            <strong>No.</strong> FairEnergy no instala cookies en tu navegador. No usamos cookies de
            seguimiento, publicidad, analítica ni de ningún otro tipo.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">¿Qué sí usamos?</h2>
          <p>
            Para pasar el resultado del análisis de una página a otra usamos{" "}
            <strong>sessionStorage</strong>, un mecanismo de almacenamiento temporal del navegador que:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Solo existe mientras tienes la pestaña abierta.</li>
            <li>Se elimina automáticamente al cerrar la pestaña o el navegador.</li>
            <li>No sale de tu dispositivo ni es accesible por FairEnergy ni por terceros.</li>
          </ul>
          <p className="text-sm mt-2">
            El sessionStorage no es una cookie y no requiere consentimiento bajo la normativa vigente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Contacto</h2>
          <p className="text-sm">
            Si tienes dudas sobre el uso de tecnologías de almacenamiento en FairEnergy, escríbenos a{" "}
            <a href="mailto:hola@fairenergy.es" className="underline hover:text-gray-900">hola@fairenergy.es</a>.
          </p>
        </section>

        <p className="text-sm text-gray-500 pt-4">
          Última actualización: junio de 2025 ·{" "}
          <Link href="/" className="underline hover:text-gray-700">Volver al inicio</Link>
        </p>
      </div>
      <Footer />
    </main>
  )
}
