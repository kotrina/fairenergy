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
