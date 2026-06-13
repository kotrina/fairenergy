# Manual de usuario — FairEnergy

Última actualización: 2026-06-13

## ¿Qué es FairEnergy?

FairEnergy es una herramienta gratuita e independiente que te ayuda a saber si tu
compañía de energía te está cobrando de más, comparando tu factura con la tarifa oficial
del Gobierno español.

- **Gas natural** → se compara con la Tarifa de Último Recurso (TUR)
- **Electricidad** → se compara con el PVPC (Precio Voluntario al Pequeño Consumidor)

## Cómo usar FairEnergy

### Paso 1: Elige el tipo de energía

En la parte superior de la página encontrarás dos botones:

| Botón | Para qué sirve |
|---|---|
| **Gas natural** | Analizar una factura de gas |
| **Electricidad** | Analizar una factura de luz |

### Paso 2: Elige cómo introducir los datos

#### Opción A: Sube tu factura

1. Selecciona la pestaña **"Subir mi factura"** (activa por defecto).
2. Arrastra tu factura (PDF o foto) a la zona indicada, o haz clic para seleccionarla.
3. Pulsa **"Analizar mi factura"**.
4. En unos segundos verás el resultado.

> Tu factura se usa solo para extraer los datos necesarios y se descarta inmediatamente.
> No la guardamos ni la compartimos con nadie.

#### Opción B: Introduce los datos manualmente

Selecciona la pestaña **"Introducir datos manualmente"** y rellena los campos:

**Si analizas gas natural:**

| Campo | Dónde encontrarlo |
|---|---|
| Compañía de gas | Cabecera de la factura |
| Nombre de la tarifa | Detalle de la factura o contrato |
| ¿Mercado libre o regulado? | Tipo de contrato en la factura |
| Fechas del período | Cabecera o detalle de consumo |
| kWh consumidos | Detalle de consumo |
| Término fijo (€/día) | Desglose de cargos |
| Término variable (€/kWh) | Desglose de cargos |
| Descuento (%) | Si aparece algún descuento en la factura |
| Presión (bar) | Solo si aparece en la factura; déjalo vacío si no |

**Si analizas electricidad:**

| Campo | Dónde encontrarlo |
|---|---|
| Compañía eléctrica | Cabecera de la factura |
| Nombre de la tarifa | Detalle de la factura o contrato |
| ¿Mercado libre o PVPC? | Tipo de contrato en la factura |
| Fechas del período | Cabecera o detalle de consumo |
| kWh consumidos | Detalle de consumo |
| Potencia contratada (kW) | Detalle del contrato |
| Término de potencia (€/kW/día) | Desglose de cargos |
| Precio de la energía (€/kWh) | Desglose de cargos |
| Descuento (%) | Si aparece algún descuento en la factura |

## Entendiendo el resultado

El resultado muestra un indicador de color y una explicación en lenguaje claro:

| Color | Significado |
|---|---|
| Verde | Tu tarifa es razonable o ya estás en la tarifa oficial |
| Amarillo | Podrías mejorar tu tarifa |
| Rojo | Te están cobrando significativamente de más |

También verás:
- Cuánto más pagas respecto a la tarifa oficial, en porcentaje y en euros
- El ahorro mensual y anual estimado si cambiaras a la tarifa regulada
- Alertas sobre descuentos que en realidad no te benefician
- Instrucciones para cambiar de tarifa si fuera necesario

### Resultado de gas: comparativa con la TUR

La tabla muestra tu precio frente a la **Tarifa de Último Recurso (TUR)**, que publica
el Gobierno cada trimestre. La TUR tiene tres tramos según tu consumo anual:

| Tramo | Consumo anual |
|---|---|
| TUR1 | Hasta 5.000 kWh/año |
| TUR2 | Entre 5.001 y 15.000 kWh/año |
| TUR3 | Entre 15.001 y 50.000 kWh/año |

> Si tu consumo supera 50.000 kWh al año, no tienes derecho a la TUR y FairEnergy
> te lo informará.

### Resultado de electricidad: comparativa con el PVPC

La tabla muestra tu precio frente al **PVPC medio real del período facturado**,
calculado a partir de los datos oficiales de Red Eléctrica (REE). También verás el
precio mínimo y máximo del PVPC durante ese mismo período.

> El cambio a la tarifa regulada (TUR o PVPC) es **gratuito** y puedes solicitarlo
> por teléfono a tu comercializadora de referencia.
