import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
      <p>
        Datos oficiales:{" "}
        <a
          href="https://comparador.cnmc.gob.es"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700"
        >
          Comparador CNMC
        </a>
        {" · "}
        <a
          href="https://api.esios.ree.es"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700"
        >
          ESIOS / REE
        </a>
      </p>
      <p className="mt-1">FairEnergy es independiente y sin ánimo de lucro.</p>
      <p className="mt-3 flex justify-center gap-4 flex-wrap">
        <Link href="/aviso-legal" className="underline hover:text-gray-700">
          Aviso legal
        </Link>
        <Link href="/privacidad" className="underline hover:text-gray-700">
          Política de privacidad
        </Link>
        <Link href="/cookies" className="underline hover:text-gray-700">
          Cookies
        </Link>
      </p>
    </footer>
  )
}
