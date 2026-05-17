# FairEnergy

Herramienta independiente y sin ánimo de lucro para ayudar a personas mayores —
y a sus familias — a detectar si su compañía de gas les está cobrando de más.

FairEnergy compara tu factura de gas con la **Tarifa de Último Recurso (TUR)**,
la tarifa oficial regulada por el Gobierno español, y te dice cuánto puedes ahorrar
en euros y en lenguaje claro.

---

## Cómo funciona

1. El usuario sube su factura de gas (PDF o foto) o introduce los datos manualmente.
2. La app extrae los datos de la factura usando IA (Claude de Anthropic).
3. Compara esos datos contra la TUR vigente en el período de la factura.
4. Muestra un veredicto claro con el ahorro potencial en euros al mes y al año.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- Cuenta en [Anthropic](https://www.anthropic.com/) para obtener una API key
- Cuenta en [Vercel](https://vercel.com/) para el despliegue (opcional)

---

## Instalación local

```bash
# 1. Clona el repositorio
git clone https://github.com/kotrina/fairenergy.git
cd fairenergy

# 2. Instala las dependencias
npm install

# 3. Copia las variables de entorno
cp .env.example .env.local

# 4. Edita .env.local y añade tu API key de Anthropic
#    ANTHROPIC_API_KEY=sk-ant-...

# 5. Arranca el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Cómo obtener la API key de Anthropic

1. Entra en [console.anthropic.com](https://console.anthropic.com/)
2. Crea una cuenta o inicia sesión
3. Ve a **Settings → API Keys**
4. Haz clic en **Create Key**
5. Copia la clave y pégala en tu `.env.local` como `ANTHROPIC_API_KEY`

---

## Despliegue en Vercel

```bash
# Opción A: desde el CLI de Vercel
npm install -g vercel
vercel

# Opción B: desde la web
# 1. Conecta tu repositorio en https://vercel.com/new
# 2. Framework: Next.js (se detecta automáticamente)
# 3. Añade las variables de entorno en Settings → Environment Variables:
#    ANTHROPIC_API_KEY = tu-clave-de-anthropic
# 4. Despliega
```

---

## Cómo actualizar la tabla TUR

La TUR se publica cada trimestre (1 enero, 1 abril, 1 julio, 1 octubre) mediante una
resolución de la **Dirección General de Política Energética y Minas** en el BOE.

### 1. Buscar la nueva resolución

Entra en [https://www.boe.es](https://www.boe.es) y busca:

```
"tarifa último recurso gas natural" resolución
```

O accede directamente a la sección de resoluciones energéticas y filtra por fecha.

### 2. Campos a extraer de la resolución

Para cada tramo necesitas:

| Campo | Dónde encontrarlo | Conversión |
|---|---|---|
| `tur1_fijo_eur_dia` | Término fijo TUR.1 (€/cliente/mes) | ÷ 30,4167 |
| `tur1_variable_eur_kwh` | Término variable TUR.1 (€/kWh) | sin conversión |
| `tur2_fijo_eur_dia` | Término fijo TUR.2 (€/cliente/mes) | ÷ 30,4167 |
| `tur2_variable_eur_kwh` | Término variable TUR.2 (€/kWh) | sin conversión |
| `tur3_fijo_eur_dia` | Término fijo TUR.3 (€/cliente/mes) | ÷ 30,4167 |
| `tur3_variable_eur_kwh` | Término variable TUR.3 (€/kWh) | sin conversión |

**Tramos:**
- **TUR.1**: consumo anual ≤ 5.000 kWh
- **TUR.2**: consumo anual 5.001–15.000 kWh
- **TUR.3**: consumo anual 15.001–50.000 kWh

### 3. Añadir la nueva entrada al JSON

Edita `data/tur-gas.json` y añade una entrada al final del array:

```json
{
  "vigente_desde": "2026-07-01",
  "vigente_hasta": "2026-09-30",
  "tur1_fijo_eur_dia": 0.000000,
  "tur1_variable_eur_kwh": 0.000000,
  "tur2_fijo_eur_dia": 0.000000,
  "tur2_variable_eur_kwh": 0.000000,
  "tur3_fijo_eur_dia": 0.000000,
  "tur3_variable_eur_kwh": 0.000000,
  "fuente": "BOE-A-XXXX-XXXXX (Resolución DD mmm YYYY)",
  "termino_fijo_boe_eur_mes": "TUR.1: X,XX | TUR.2: X,XX | TUR.3: XX,XX"
}
```

> Asegúrate de que `vigente_hasta` del período anterior y `vigente_desde` del nuevo
> período sean consecutivos sin gaps.

---

## Hoja de ruta

| Funcionalidad | Estado |
|---|---|
| Comparación con TUR de gas | ✅ Disponible |
| OCR automático de facturas PDF e imagen | ✅ Disponible |
| Formulario manual de introducción de datos | ✅ Disponible |
| Comparación con PVPC para electricidad | 🚧 Próximamente |

**Nota sobre electricidad:** cuando se integre la comparación PVPC, se consumirá la
API de ESIOS ([api.esios.ree.es](https://api.esios.ree.es)). Sus términos de uso exigen
que las aplicaciones de acceso público almacenen los datos en un servidor propio antes
de servirlos al cliente. Por eso ya existe `lib/pvpc.ts` (stub) y `data/cache/`
(reservado para caché PVPC).

---

## Cómo contribuir

1. Haz un fork del repositorio
2. Crea una rama desde `staging`: `git checkout -b feature/tu-mejora staging`
3. Implementa tu cambio con commits atómicos
4. Verifica que lint y build están OK: `npm run lint && npm run build`
5. Abre un Pull Request contra `staging` (no contra `main`)

Si vas a actualizar la tabla TUR, incluye en el PR la URL del BOE de la resolución
que has consultado para verificar los valores.

---

## Estructura del proyecto

```
/app
  /page.tsx                    — Landing: subida de factura + formulario manual
  /resultado/page.tsx          — Pantalla de veredicto
  /api/analizar/route.ts       — Endpoint POST principal
/data
  /tur-gas.json                — Tabla TUR histórica (actualización manual trimestral)
  /cache/                      — Reservado para caché PVPC/ESIOS (electricidad)
/lib
  /ocr.ts                      — Extracción de datos con Claude
  /analyzer.ts                 — Lógica analyzeGasBill
  /tur.ts                      — Búsqueda TUR vigente por fecha
  /pvpc.ts                     — Stub para integración ESIOS futura
/config
  /ai.ts                       — Constantes del modelo de IA
/eval/docs                     — Documentación técnica interna
```

---

FairEnergy es una herramienta independiente y sin ánimo de lucro.
