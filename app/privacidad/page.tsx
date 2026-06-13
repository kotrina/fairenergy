import Link from "next/link"
import Nav from "../components/Nav"
import Footer from "../components/Footer"

export const metadata = {
  title: "Política de privacidad — FairEnergy",
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 text-gray-700">
        <h1 className="text-2xl font-semibold text-gray-900">Política de privacidad</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">1. Responsable del tratamiento</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Responsable:</strong> Raul Cotrina Secas</li>
            <li><strong>NIF / CIF:</strong> 09012736W</li>
            <li><strong>Domicilio:</strong> Avenida de la Coruña 37, San Sebastián de los Reyes, Madrid, España</li>
            <li><strong>Contacto:</strong> hola@fairenergy.es</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">2. Qué datos tratamos y por qué</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Factura subida para análisis</h3>
              <p className="text-sm">
                Cuando subes una factura en formato PDF o imagen, esta se envía de forma cifrada
                (HTTPS) a un modelo de inteligencia artificial para extraer los datos numéricos
                necesarios para el análisis (precios, consumo, fechas). <strong>La factura no se almacena
                en ningún servidor de FairEnergy</strong> una vez finalizado el proceso.
              </p>
              <p className="text-sm mt-1">
                Base jurídica: ejecución del servicio solicitado por el usuario (art. 6.1.b RGPD).
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-1">Estadísticas anónimas del análisis</h3>
              <p className="text-sm">
                Al finalizar cada análisis guardamos datos agregados y completamente anónimos: tipo
                de energía, si el usuario está en mercado libre o tarifa regulada, precio por kWh y
                ahorro estimado. Esta información <strong>no permite identificar a ninguna persona</strong> y se
                usa exclusivamente para conocer el estado del mercado energético en España.
              </p>
              <p className="text-sm mt-1">
                No guardamos: nombre, dirección, CUPS, NIF, IP ni ningún otro dato personal.
              </p>
              <p className="text-sm mt-1">
                Base jurídica: interés legítimo en la mejora del servicio (art. 6.1.f RGPD).
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">3. Cesión de datos a terceros</h2>
          <p className="text-sm">
            Los datos de la factura son procesados por <strong>Anthropic</strong> (proveedor del modelo de
            inteligencia artificial) conforme a sus condiciones de uso y política de privacidad.
            Anthropic actúa como encargado del tratamiento bajo contrato. No cedemos datos a ningún
            otro tercero con fines comerciales.
          </p>
          <p className="text-sm mt-1">
            Las estadísticas anónimas se almacenan en <strong>Supabase</strong> (infraestructura en la UE).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">4. Transferencias internacionales</h2>
          <p className="text-sm">
            Anthropic está ubicado en Estados Unidos. El tratamiento de la factura implica una
            transferencia internacional cubierta por las garantías adecuadas que Anthropic tiene
            implementadas (cláusulas contractuales tipo de la Comisión Europea).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">5. Conservación de los datos</h2>
          <p className="text-sm">
            La factura subida se elimina automáticamente una vez procesada (no se guarda).
            Las estadísticas anónimas no tienen plazo de supresión al no contener datos personales.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">6. Tus derechos</h2>
          <p className="text-sm">
            En relación con tus datos personales tienes los siguientes derechos reconocidos por el RGPD:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Acceso:</strong> saber qué datos tenemos sobre ti.</li>
            <li><strong>Rectificación:</strong> corregir datos incorrectos.</li>
            <li><strong>Supresión:</strong> solicitar que eliminemos tus datos.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
            <li><strong>Oposición y limitación:</strong> restringir ciertos usos de tus datos.</li>
          </ul>
          <p className="text-sm mt-2">
            Dado que no almacenamos ningún dato personal identificable, el ejercicio de estos derechos
            no aplica en la práctica. Si aun así quieres contactarnos, escríbenos a{" "}
            <a href="mailto:hola@fairenergy.es" className="underline hover:text-gray-900">hola@fairenergy.es</a>.
          </p>
          <p className="text-sm mt-1">
            También puedes presentar una reclamación ante la{" "}
            <a
              href="https://www.aepd.es"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-900"
            >
              Agencia Española de Protección de Datos (AEPD)
            </a>.
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
