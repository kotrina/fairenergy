# Arquitectura — FairEnergy

Última actualización: 2026-05-17

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| IA / OCR | Anthropic API (claude-opus-4-5) |
| Despliegue | Vercel |

## Estructura de carpetas

```
/app
  /page.tsx                    — Landing: subida de factura + formulario manual
  /resultado/page.tsx          — Pantalla de veredicto
  /api/analizar/route.ts       — Endpoint POST principal
/data
  /tur-gas.json                — Tabla TUR histórica (actualización manual trimestral)
  /cache/                      — Reservado para caché PVPC/ESIOS (electricidad, futuro)
/lib
  /ocr.ts                      — Extracción de datos de facturas con Claude
  /analyzer.ts                 — Lógica analyzeGasBill
  /tur.ts                      — Búsqueda TUR vigente por fecha
  /pvpc.ts                     — Stub reservado para integración ESIOS (electricidad)
/config
  /ai.ts                       — Constantes del modelo de IA (AI_MODEL, AI_MAX_TOKENS)
/eval/docs                     — Documentación técnica interna
```

## Flujo principal

1. Usuario sube factura PDF/imagen → `/api/analizar`
2. `lib/ocr.ts` llama a Anthropic API → extrae BillData en JSON
3. `lib/tur.ts` busca la TUR vigente en la fecha de la factura
4. `lib/analyzer.ts` compara factura vs TUR → AnalysisResult
5. Frontend muestra veredicto en `/resultado`

## Energía futura: electricidad

El módulo `lib/pvpc.ts` y la carpeta `data/cache/` están reservados para la futura
integración con ESIOS (api.esios.ree.es). Los términos de uso de ESIOS exigen
cachear los datos en servidor propio antes de servirlos al cliente.
