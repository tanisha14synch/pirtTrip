import type { H3Event } from 'h3'
import { getRequestIP } from 'h3'

const WINDOW_MS = 15 * 60 * 1000
const MAX_SENDS_PER_WINDOW = 10

type Bucket = {
  count: number
  windowStart: number
}

const buckets = new Map<string, Bucket>()

function cleanupBuckets(now: number) {
  if (buckets.size < 500) {
    return
  }

  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart > WINDOW_MS) {
      buckets.delete(key)
    }
  }
}

export function assertOtpSendRateLimit(event: H3Event, phone?: string) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const key = `${ip}:${phone?.replace(/\D/g, '').slice(-10) || 'unknown'}`
  const now = Date.now()
  cleanupBuckets(now)

  const bucket = buckets.get(key)
  if (!bucket || now - bucket.windowStart > WINDOW_MS) {
    buckets.set(key, { count: 1, windowStart: now })
    return
  }

  if (bucket.count >= MAX_SENDS_PER_WINDOW) {
    const waitSeconds = Math.ceil((WINDOW_MS - (now - bucket.windowStart)) / 1000)
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many OTP requests. Please try again later.',
      data: { code: 'OTP_RATE_LIMITED', waitSeconds },
    })
  }

  bucket.count += 1
}
