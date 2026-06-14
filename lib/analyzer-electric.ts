import type { ElectricBillData } from "./ocr-electric"
import type { PvpcResult } from "./pvpc"

export type ElectricAnalysisResult = {
  tipo_energia: "electricidad"
  elegible_pvpc: boolean
  razon_no_elegible: string | null
  esta_en_pvpc: boolean
  precio_usuario_eur_kwh: number | null
  pvpc_referencia: {
    fecha_inicio: string
    fecha_fin: string
    zona: string
    media_eur_kwh: number
    min_eur_kwh: number
    max_eur_kwh: number
  } | null
  desviacion_energia_pct: number
  ahorro_mensual_estimado_eur: number
  ahorro_anual_estimado_eur: number
  tiene_descuento_trampa: boolean
  alertas: string[]
}

/**
 * Calcula el precio efectivo de energía (€/kWh) que paga el usuario.
 *
 * En tarifas con discriminación horaria (2.0TD: punta/llano/valle) la factura
 * tiene varios precios; el precio real es la media ponderada por el consumo de
 * cada período. Lo calculamos aquí en código (no en el OCR) para que sea
 * determinista y fiable.
 *
 * Orden de preferencia:
 *   1. Media ponderada por consumo de los períodos con precio y consumo.
 *   2. Media simple de los precios por período (si no hay consumos).
 *   3. termino_energia_eur_kwh (factura de precio único).
 */
export function precioEnergiaPonderado(billData: ElectricBillData): number | null {
  const conPrecio = (billData.energia_periodos ?? []).filter(
    (p): p is { periodo: "punta" | "llano" | "valle"; precio_eur_kwh: number; consumo_kwh: number | null } =>
      p.precio_eur_kwh !== null
  )

  const conConsumo = conPrecio.filter((p) => p.consumo_kwh !== null && p.consumo_kwh > 0)
  const totalConsumo = conConsumo.reduce((acc, p) => acc + (p.consumo_kwh ?? 0), 0)

  if (conConsumo.length > 0 && totalConsumo > 0) {
    const suma = conConsumo.reduce((acc, p) => acc + p.precio_eur_kwh * (p.consumo_kwh ?? 0), 0)
    return suma / totalConsumo
  }

  if (conPrecio.length > 0) {
    return conPrecio.reduce((acc, p) => acc + p.precio_eur_kwh, 0) / conPrecio.length
  }

  return billData.termino_energia_eur_kwh
}

const DIAS_MES = 365 / 12
const DESCUENTO_TRAMPA_UMBRAL_PCT = 20

export function analyzeElectricBill(
  billData: ElectricBillData,
  pvpcData: PvpcResult | null
): ElectricAnalysisResult {
  const alertas: string[] = []
  const estaEnPvpc = billData.es_mercado_libre === false

  const precioUsuario = precioEnergiaPonderado(billData)

  if (!pvpcData) {
    return {
      tipo_energia: "electricidad",
      elegible_pvpc: true,
      razon_no_elegible: null,
      esta_en_pvpc: estaEnPvpc,
      precio_usuario_eur_kwh: precioUsuario !== null ? round5(precioUsuario) : null,
      pvpc_referencia: null,
      desviacion_energia_pct: 0,
      ahorro_mensual_estimado_eur: 0,
      ahorro_anual_estimado_eur: 0,
      tiene_descuento_trampa: false,
      alertas,
    }
  }

  const pvpcMedio = pvpcData.media_eur_kwh
  const facturaEnergia = precioUsuario ?? pvpcMedio

  const desviacionPct = pct(facturaEnergia - pvpcMedio, pvpcMedio)

  // Descuento trampa
  let tieneTrampa = false
  const totalDescuentoPct = (billData.descuentos ?? []).reduce((acc, d) => acc + d.porcentaje, 0)
  if (totalDescuentoPct > 0 && desviacionPct > DESCUENTO_TRAMPA_UMBRAL_PCT) {
    const facturaConDescuento = facturaEnergia * (1 - totalDescuentoPct / 100)
    const desviacionTrasDescuento = pct(facturaConDescuento - pvpcMedio, pvpcMedio)
    if (desviacionTrasDescuento > DESCUENTO_TRAMPA_UMBRAL_PCT) {
      tieneTrampa = true
      alertas.push(
        `Tu compañía te ofrece un ${totalDescuentoPct.toFixed(0)}% de descuento, pero aun así pagas ` +
          `un ${Math.round(desviacionTrasDescuento)}% más que el PVPC del mismo período.`
      )
    }
  }

  // Ahorro estimado
  const diasFacturados = billData.dias_facturados ?? DIAS_MES
  const consumoMensualKwh = billData.consumo_kwh !== null
    ? (billData.consumo_kwh / diasFacturados) * DIAS_MES
    : 0
  const ahorroMensual = Math.max(0, (facturaEnergia - pvpcMedio) * consumoMensualKwh)
  const ahorroAnual = ahorroMensual * 12

  if (!estaEnPvpc && billData.fecha_inicio) {
    alertas.push(
      `Llevas en mercado libre desde al menos ${formatFecha(billData.fecha_inicio)}. ` +
        `Puedes pedir el cambio al PVPC gratis.`
    )
  }

  return {
    tipo_energia: "electricidad",
    elegible_pvpc: true,
    razon_no_elegible: null,
    esta_en_pvpc: estaEnPvpc,
    precio_usuario_eur_kwh: round5(facturaEnergia),
    pvpc_referencia: {
      fecha_inicio: pvpcData.fecha_inicio,
      fecha_fin: pvpcData.fecha_fin,
      zona: pvpcData.zona,
      media_eur_kwh: pvpcData.media_eur_kwh,
      min_eur_kwh: pvpcData.min_eur_kwh,
      max_eur_kwh: pvpcData.max_eur_kwh,
    },
    desviacion_energia_pct: desviacionPct,
    ahorro_mensual_estimado_eur: round2(ahorroMensual),
    ahorro_anual_estimado_eur: round2(ahorroAnual),
    tiene_descuento_trampa: tieneTrampa,
    alertas,
  }
}

function pct(diferencia: number, base: number): number {
  if (base === 0) return 0
  return round2((diferencia / base) * 100)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function round5(n: number): number {
  return Math.round(n * 100000) / 100000
}

function formatFecha(iso: string): string {
  const [year, month] = iso.split("-")
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
  return `${meses[parseInt(month) - 1]} de ${year}`
}
