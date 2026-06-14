# Despliegue — FairEnergy

Última actualización: 2026-05-17

## Variables de entorno requeridas

| Variable | Descripción | Requerida ahora |
|---|---|---|
| `ANTHROPIC_API_KEY` | API key de Anthropic para OCR con Claude | Sí |
| `ESIOS_API_KEY` | Token ESIOS de REE para precios PVPC (electricidad) | Sí (electricidad) |
| `SUPABASE_URL` | URL del proyecto Supabase (analytics anónimos) | Sí (analytics) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave secreta de servidor de Supabase (no la pública) | Sí (analytics) |
| `UPSTASH_REDIS_REST_URL` | URL REST de Upstash Redis (rate limiting) | Recomendada |
| `UPSTASH_REDIS_REST_TOKEN` | Token REST de Upstash Redis (rate limiting) | Recomendada |

> Si las variables de Upstash no están definidas, el rate limiting se desactiva
> de forma segura (no bloquea peticiones). Conviene configurarlas antes de abrir
> el acceso a usuarios externos.

## Vercel

1. Conectar repositorio GitHub en vercel.com
2. Framework: Next.js (detectado automáticamente)
3. Añadir las variables de entorno en Settings → Environment Variables
4. Deploy automático desde `main`

## Local

```bash
cp .env.example .env.local
# Editar .env.local con las credenciales reales
npm install
npm run dev
```
