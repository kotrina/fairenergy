import Link from "next/link"

export default function Nav({ back }: { back?: boolean }) {
  return (
    <nav className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: "#378ADD" }}
      >
        <BoltIcon />
      </div>
      <span className="text-lg font-semibold text-gray-900">FairEnergy</span>
      {back && (
        <Link
          href="/"
          className="ml-auto flex items-center gap-1 text-sm font-medium"
          style={{ color: "#378ADD" }}
        >
          <ArrowLeftIcon />
          Analizar otra factura
        </Link>
      )}
    </nav>
  )
}

function BoltIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}
