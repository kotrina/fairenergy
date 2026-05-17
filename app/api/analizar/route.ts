// Endpoint principal de análisis de facturas — implementado en issue #5
import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json({ success: false, error: "Not implemented" }, { status: 501 })
}
