# Despliegue — FairEnergy

Última actualización: 2026-05-17

## Variables de entorno requeridas

| Variable | Descripción | Requerida ahora |
|---|---|---|
| `ANTHROPIC_API_KEY` | API key de Anthropic para OCR con Claude | Sí |
| `ESIOS_API_KEY` | Token ESIOS de REE (electricidad, futuro) | No |

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
