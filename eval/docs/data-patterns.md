# Patrones de datos — FairEnergy

Última actualización: 2026-05-17

## BillData

Datos extraídos de una factura de gas. Todos los campos pueden ser `null` si no
aparecen en la factura.

```typescript
type BillData = {
  comercializadora: string | null
  producto: string | null
  es_mercado_libre: boolean | null
  fecha_inicio: string | null          // "YYYY-MM-DD"
  fecha_fin: string | null             // "YYYY-MM-DD"
  dias_facturados: number | null
  consumo_kwh: number | null
  consumo_anual_estimado_kwh: number | null
  termino_fijo_eur_dia: number | null
  termino_variable_eur_kwh: number | null
  presion_bar: number | null
  descuentos: { descripcion: string; porcentaje: number }[]
  importe_total: number | null
  peaje_acceso: string | null
}
```

## TurEntry

Entrada en `data/tur-gas.json`. Representa un período trimestral de vigencia.

```typescript
type TurEntry = {
  vigente_desde: string              // "YYYY-MM-DD"
  vigente_hasta: string              // "YYYY-MM-DD"
  tur1_fijo_eur_dia: number
  tur1_variable_eur_kwh: number
  tur2_fijo_eur_dia: number
  tur2_variable_eur_kwh: number
}
```

## PvpcMonthCache

Caché mensual de precios PVPC almacenada en `data/cache/pvpc-YYYY-MM.json`.

```typescript
type PvpcMonthCache = {
  indicator: number       // 1001 = PVPC 2.0TD
  zona: PvpcZona          // "Península" | "Canarias" | "Baleares" | "Ceuta" | "Melilla"
  mes: string             // "YYYY-MM"
  descargado: string      // ISO fecha de descarga
  horas: {
    datetime: string      // ISO 8601
    value_eur_kwh: number
  }[]
}
```

## PvpcResult

Resultado de `getPvpcForPeriod()`. Precios medios, mínimos y máximos del PVPC
para un período dado, con desglose diario.

```typescript
type PvpcResult = {
  fecha_inicio: string
  fecha_fin: string
  zona: PvpcZona
  media_eur_kwh: number
  min_eur_kwh: number
  max_eur_kwh: number
  dias: {
    fecha: string
    media_eur_kwh: number
    min_eur_kwh: number
    max_eur_kwh: number
  }[]
}
```

## EnergiaPeriodo (electricidad)

Desglose por período horario de una factura de electricidad con discriminación
horaria (tarifa 2.0TD). El OCR **copia** estos valores de la factura sin calcular
medias; la media ponderada se calcula después en código.

```typescript
type EnergiaPeriodo = {
  periodo: "punta" | "llano" | "valle"
  precio_eur_kwh: number | null
  consumo_kwh: number | null
}
```

`ElectricBillData` incluye `energia_periodos: EnergiaPeriodo[]` (array vacío si la
factura tiene un único precio, en cuyo caso se usa `termino_energia_eur_kwh`).

### Cálculo del precio efectivo — `precioEnergiaPonderado()`

Define el precio €/kWh real que paga el usuario, por orden de preferencia:

1. **Media ponderada por consumo** de los períodos con precio y consumo:
   `Σ(precio_i × consumo_i) / Σ(consumo_i)`.
2. **Media simple** de los precios por período (si hay precios pero no consumos).
3. `termino_energia_eur_kwh` (factura de precio único, p. ej. entrada manual).

Se expone en `ElectricAnalysisResult.precio_usuario_eur_kwh` y es el valor que se
compara con el PVPC, se muestra en la tabla del resultado y se registra en analytics.

## AnalysisResult

Resultado del análisis de `analyzeGasBill()`.

```typescript
type AnalysisResult = {
  elegible_tur: boolean
  razon_no_elegible: string | null
  esta_en_tur: boolean
  tramo_tur: "TUR1" | "TUR2" | null
  tur_referencia: TurResult | null
  desviacion_variable_pct: number    // positivo = paga más que TUR
  desviacion_fijo_pct: number
  ahorro_mensual_estimado_eur: number
  ahorro_anual_estimado_eur: number
  tiene_descuento_trampa: boolean
  alertas: string[]
}
```
