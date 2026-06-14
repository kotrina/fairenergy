// Rate limiting para /api/analizar (Issue #42).
//
// Dos capas:
//   1. Por IP — ventana deslizante (5/hora y 15/día) contra abuso individual.
//   2. Tope global diario (100/día) como seguro de coste de API.
//
// Degradación segura: si Upstash no está configurado (faltan las env vars),
// no se bloquea nada. Las credenciales viven solo en .env.local / Vercel.

import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const LIMITE_GLOBAL_DIARIO = 100

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

const redis = url && token ? new Redis({ url, token }) : null

const porHora = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:hora", analytics: false })
  : null

const porDia = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(15, "1 d"), prefix: "rl:dia", analytics: false })
  : null

export type RateLimitResultado =
  | { permitido: true }
  | { permitido: false; status: 429 | 503; mensaje: string }

const PERMITIDO: RateLimitResultado = { permitido: true }

/**
 * Capa 1 — Límite por IP. Barato; se comprueba al inicio de cada petición.
 * No consume el tope global, así que el spam de peticiones inválidas no
 * agota el cupo diario del servicio.
 */
export async function comprobarLimitePorIP(ip: string): Promise<RateLimitResultado> {
  if (!porHora || !porDia) return PERMITIDO
  try {
    const hora = await porHora.limit(ip)
    if (!hora.success) {
      return {
        permitido: false,
        status: 429,
        mensaje: "Has hecho muchos análisis seguidos. Prueba de nuevo en un rato.",
      }
    }
    const dia = await porDia.limit(ip)
    if (!dia.success) {
      return {
        permitido: false,
        status: 429,
        mensaje: "Has alcanzado el máximo de análisis por hoy. Vuelve mañana.",
      }
    }
    return PERMITIDO
  } catch (error) {
    // Si Redis falla, no bloqueamos al usuario (degradación segura).
    console.error("[ratelimit] fallo al comprobar IP:", error)
    return PERMITIDO
  }
}

/**
 * Capa 2 — Tope global diario. Se llama solo cuando vamos a hacer trabajo real
 * (justo antes del análisis), de modo que peticiones inválidas no agoten el cupo.
 * Incrementa el contador del día y bloquea si se supera el techo.
 */
export async function comprobarYRegistrarGlobal(): Promise<RateLimitResultado> {
  if (!redis) return PERMITIDO
  try {
    const hoy = new Date().toISOString().slice(0, 10) // YYYY-MM-DD (UTC)
    const clave = `rl:global:${hoy}`
    const total = await redis.incr(clave)
    if (total === 1) {
      // Primera petición del día: que la clave caduque sola en 48h.
      await redis.expire(clave, 60 * 60 * 48)
    }
    if (total > LIMITE_GLOBAL_DIARIO) {
      return {
        permitido: false,
        status: 503,
        mensaje: "Hemos alcanzado el máximo de análisis por hoy. Vuelve mañana, ¡gracias por tu paciencia!",
      }
    }
    return PERMITIDO
  } catch (error) {
    console.error("[ratelimit] fallo al comprobar tope global:", error)
    return PERMITIDO
  }
}
