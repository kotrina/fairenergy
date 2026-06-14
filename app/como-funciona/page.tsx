import Link from "next/link"
import Nav from "../components/Nav"
import Footer from "../components/Footer"

export const metadata = {
  title: "Cómo funciona — FairEnergy",
  description:
    "Transparencia total: cómo extraemos los datos de tu factura, con qué tarifa oficial los comparamos y de dónde sacamos la información.",
}

export default function ComoFuncionaPage() {
  return (
    <main className="min-h-screen bg-white">
      <Nav />
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10 text-gray-700">

        {/* Intro */}
        <header className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">Cómo funciona FairEnergy</h1>
          <p className="text-lg leading-relaxed">
            FairEnergy compara el precio de tu factura de gas o electricidad con la{" "}
            <strong>tarifa regulada oficial del Gobierno</strong> y te dice, en euros y sin tecnicismos,
            si estás pagando de más. Aquí te explicamos exactamente cómo lo hacemos, paso a paso.
          </p>
        </header>

        {/* Pasos */}
        <section className="space-y-5">
          <Step
            n={1}
            titulo="Subes tu factura"
            texto="Subes tu factura en PDF o imagen. También puedes introducir los datos a mano si prefieres no subir el documento."
          />
          <Step
            n={2}
            titulo="Extraemos los datos con inteligencia artificial"
            texto="Un modelo de IA (Claude, de Anthropic) lee la factura y extrae únicamente los datos numéricos necesarios para el análisis: precio por kWh, potencia o término fijo, consumo y fechas del periodo. Tu factura se procesa al momento y no se almacena en ningún servidor."
          />
          <Step
            n={3}
            titulo="La comparamos con la tarifa oficial"
            texto="Cogemos la tarifa regulada que te correspondería en el mismo periodo de tu factura y comparamos su precio con el que te cobra tu compañía."
          />
          <Step
            n={4}
            titulo="Te decimos cuánto puedes ahorrar"
            texto="Calculamos la diferencia y la traducimos a un ahorro mensual y anual estimado, con un veredicto claro: estás bien, podrías mejorar o te están cobrando de más."
          />
        </section>

        {/* Con qué comparamos */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">¿Con qué tarifa comparamos?</h2>
          <p>
            Usamos las tarifas reguladas oficiales, las que fija y publica el Estado. Son la referencia
            objetiva del precio justo de la energía:
          </p>

          <div className="rounded-xl p-5" style={{ background: "#F5FAFF", border: "1px solid #D6E8F8" }}>
            <h3 className="font-semibold text-gray-900 mb-1">⚡ Electricidad → PVPC</h3>
            <p className="text-sm leading-relaxed">
              El <strong>Precio Voluntario para el Pequeño Consumidor</strong> es la tarifa regulada de la luz.
              Su precio cambia cada hora y lo publica Red Eléctrica de España (REE) a través del sistema ESIOS.
              Comparamos el precio medio de tu factura con el precio medio del PVPC durante ese mismo periodo.
            </p>
          </div>

          <div className="rounded-xl p-5" style={{ background: "#F5FAFF", border: "1px solid #D6E8F8" }}>
            <h3 className="font-semibold text-gray-900 mb-1">🔥 Gas → TUR</h3>
            <p className="text-sm leading-relaxed">
              La <strong>Tarifa de Último Recurso</strong> es la tarifa regulada del gas natural. La revisa el
              Gobierno cada tres meses y se publica en el Boletín Oficial del Estado (BOE). Comparamos el término
              fijo (€/día) y el término variable (€/kWh) de tu factura con los de la TUR que te corresponde
              según tu consumo.
            </p>
          </div>
        </section>

        {/* Fuentes */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">¿De dónde sacamos la información?</h2>
          <p>Toda nuestra referencia proviene de fuentes públicas y oficiales:</p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              <a href="https://www.esios.ree.es" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900">
                ESIOS — Red Eléctrica de España
              </a>{" "}
              (precios horarios del PVPC).
            </li>
            <li>
              <a href="https://comparador.cnmc.gob.es" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900">
                Comparador de ofertas de la CNMC
              </a>{" "}
              (Comisión Nacional de los Mercados y la Competencia).
            </li>
            <li>
              <a href="https://www.boe.es" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900">
                Boletín Oficial del Estado (BOE)
              </a>{" "}
              (precios trimestrales de la TUR de gas).
            </li>
          </ul>
        </section>

        {/* Privacidad */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">¿Y mi privacidad?</h2>
          <p className="text-sm leading-relaxed">
            Tu factura se analiza al momento y <strong>no se guarda</strong>. No almacenamos tu nombre, dirección,
            CUPS ni ningún dato personal. Solo conservamos estadísticas completamente anónimas (tipo de energía,
            precio por kWh y ahorro estimado) para conocer el estado del mercado energético en España. Puedes leer
            los detalles en nuestra{" "}
            <Link href="/privacidad" className="underline hover:text-gray-900">política de privacidad</Link>.
          </p>
        </section>

        {/* Limitaciones */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">Honestidad sobre las limitaciones</h2>
          <p className="text-sm leading-relaxed">
            FairEnergy da una <strong>estimación orientativa</strong>, no un cálculo contable exacto:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>La precisión depende de que los datos de tu factura se lean correctamente.</li>
            <li>
              En electricidad comparamos tu precio medio con el precio medio del PVPC del periodo; no disponemos
              de tu curva de consumo hora a hora, así que es una aproximación cercana pero no perfecta.
            </li>
            <li>No incluimos impuestos ni alquiler de contador, ya que son iguales en cualquier comercializadora.</li>
          </ul>
          <p className="text-sm leading-relaxed">
            El resultado es informativo y no constituye asesoramiento. La decisión de cambiar de tarifa es siempre tuya.
          </p>
        </section>

        {/* CTA */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-block px-8 py-3 text-base font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
            style={{ background: "#185FA5" }}
          >
            Analizar mi factura
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function Step({ n, titulo, texto }: { n: number; titulo: string; texto: string }) {
  return (
    <div className="flex gap-4">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
        style={{ background: "#185FA5" }}
      >
        {n}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{titulo}</h3>
        <p className="text-sm leading-relaxed">{texto}</p>
      </div>
    </div>
  )
}
