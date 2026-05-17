# Componentes — FairEnergy

Última actualización: 2026-05-17

## Páginas

### `app/page.tsx` — Landing

Entrada principal de la aplicación. Contiene dos vías:
- Tab A: subida de factura (drag & drop, PDF o imagen)
- Tab B: formulario manual con campos en español claro

Props: ninguna (Server Component)

### `app/resultado/page.tsx` — Resultado

Muestra el veredicto del análisis. Recibe el resultado vía query params o state.

Props: ninguna (lee searchParams)

## Componentes pendientes de extraer

A medida que la aplicación crezca, extraer a `/components/`:
- `DropZone` — zona de subida de fichero
- `ManualForm` — formulario de entrada manual
- `VerdictBadge` — indicador visual verde/amarillo/rojo
- `ComparisonTable` — tabla de comparación TUR vs factura
- `AlertList` — lista de alertas detectadas
