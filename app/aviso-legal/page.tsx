import Link from "next/link"
import Nav from "../components/Nav"
import Footer from "../components/Footer"

export const metadata = {
  title: "Aviso legal — FairEnergy",
}

export default function AvisoLegalPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 text-gray-700">
        <h1 className="text-2xl font-semibold text-gray-900">Aviso legal</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">1. Titular del sitio web</h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad
            de la Información y de Comercio Electrónico (LSSI-CE), se informa de los siguientes datos
            identificativos del titular de este sitio web:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Titular:</strong> Raul Cotrina Secas</li>
            <li><strong>NIF / CIF:</strong> 09012736W</li>
            <li><strong>Domicilio:</strong> Avenida de la Coruña 37, San Sebastián de los Reyes, Madrid, España</li>
            <li><strong>Correo electrónico de contacto:</strong> hola@fairenergy.es</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">2. Objeto y carácter informativo</h2>
          <p>
            FairEnergy es una herramienta informativa que compara los precios de las facturas de gas y
            electricidad con las tarifas reguladas oficiales publicadas por el Gobierno español
            (TUR para gas, PVPC para electricidad).
          </p>
          <p>
            El resultado del análisis tiene carácter meramente orientativo y no constituye asesoramiento
            financiero, energético ni de ningún otro tipo. Las decisiones sobre cambio de comercializadora
            o contrato son responsabilidad exclusiva del usuario.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">3. Propiedad intelectual</h2>
          <p>
            Los contenidos, diseño y código fuente de este sitio web son propiedad de sus respectivos
            autores. Queda prohibida su reproducción total o parcial sin autorización expresa.
          </p>
          <p>
            Los datos de precios de las tarifas reguladas proceden de fuentes oficiales: Ministerio para la
            Transición Ecológica y el Reto Demográfico (MITERD) y Red Eléctrica de España (REE/ESIOS).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">4. Limitación de responsabilidad</h2>
          <p>
            FairEnergy no garantiza la exactitud absoluta de los cálculos, ya que estos dependen de la
            información extraída de la factura del usuario. El titular no se hace responsable de los
            daños o perjuicios derivados del uso de la información proporcionada por esta herramienta.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">5. Legislación aplicable</h2>
          <p>
            Este aviso legal se rige por la legislación española. Para cualquier controversia derivada
            del uso de este sitio web, las partes se someten a los Juzgados y Tribunales del domicilio
            del titular, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.
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
