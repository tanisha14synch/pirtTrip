type SmsPayload = {
  to: string
  message: string
}

type AquaSmsConfig = {
  aquasmsApiKey: string
  aquasmsUsername: string
  aquasmsSenderName: string
  aquasmsSmsType: string
  aquasmsBaseUrl: string
}

/** Approved AquaSMS / DLT template (must match provider registration exactly). */
const PARTNER_OTP_SMS_TEMPLATE =
  'Your login verification OTP For PirtTrip is {code}. This code is valid for 10 minutes. MARTYRS SERVICES Website : business.pirttrip.com'

/**
 * DLT-registered SMS body only — do not append extra lines unless a matching
 * template is approved with your SMS provider (AquaSMS will reject mismatches).
 */
export function buildPartnerOtpSmsMessage(code: string): string {
  return PARTNER_OTP_SMS_TEMPLATE.replace('{code}', code)
}

export function buildAdminLoginOtpSmsMessage(code: string): string {
  return PARTNER_OTP_SMS_TEMPLATE.replace('{code}', code)
}

export function buildPartnerRegistrationThankYouMessage(): string {
  return 'Thank you for registering on PirtTrip Business! We are launching soon. For queries: contact@pirttrip.com by MARTYRS SERVICES'
}

export function buildPartnerRegistrationAdminNotificationMessage(options: {
  firstName: string
  lastName: string
  mobileNumber: string
}): string {
  return [
    'A new registration has been successfully completed on your platform Pirttrip.',
    '',
    'Details:',
    `First Name: ${options.firstName}`,
    `Last Name: ${options.lastName}`,
    `Mobile Number: ${options.mobileNumber}`,
    '',
    'Thank you.',
    'MARTYRS SERVICES',
  ].join('\n')
}

/** AquaSMS numbers param: +91XXXXXXXXXX (per provider docs). */
function toAquaSmsNumber(e164: string): string {
  const digits = e164.replace(/\D/g, '')
  const local = digits.length === 12 && digits.startsWith('91')
    ? digits.slice(2)
    : digits.slice(-10)

  if (local.length !== 10) {
    return e164
  }

  return `+91${local}`
}

function readEnv(name: string): string {
  return process.env[name]?.trim() || ''
}

function getAquaSmsConfig(config: ReturnType<typeof useRuntimeConfig>): AquaSmsConfig | null {
  const apiKey = readEnv('AQUASMS_API_KEY') || String(config.aquasmsApiKey || '').trim()
  if (!apiKey) {
    return null
  }

  return {
    aquasmsApiKey: apiKey,
    aquasmsUsername: readEnv('AQUASMS_USERNAME') || config.aquasmsUsername?.trim() || 'pirttrip',
    aquasmsSenderName:
      readEnv('AQUASMS_SENDER_NAME') || config.aquasmsSenderName?.trim() || 'MARSTP',
    aquasmsSmsType: readEnv('AQUASMS_SMSTYPE') || config.aquasmsSmsType?.trim() || 'TRANS',
    aquasmsBaseUrl:
      readEnv('AQUASMS_BASE_URL') || config.aquasmsBaseUrl?.trim() || 'http://login.aquasms.com/sendSMS',
  }
}

const AQUA_SMS_FAILURE_HINTS = [
  'insufficient',
  'error',
  'fail',
  'invalid',
  'denied',
  'rejected',
  'unauthorized',
  'not allowed',
  'no credit',
  'low balance',
]

function parseAquaSmsResponse(body: string): { ok: boolean; detail?: string } {
  const trimmed = body.trim()
  if (!trimmed) {
    return { ok: true }
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown
    const items = Array.isArray(parsed) ? parsed : [parsed]

    for (const item of items) {
      if (!item || typeof item !== 'object') continue

      const record = item as Record<string, unknown>
      const responseCode = String(record.responseCode ?? record.ResponseCode ?? '').trim()
      if (!responseCode) continue

      const lower = responseCode.toLowerCase()
      const isFailure = AQUA_SMS_FAILURE_HINTS.some((hint) => lower.includes(hint))
      if (isFailure) {
        return { ok: false, detail: responseCode }
      }

      if (
        lower.includes('success')
        || lower.includes('submitted')
        || lower.includes('sent')
        || lower === 'ok'
      ) {
        return { ok: true, detail: responseCode }
      }

      // Unknown provider codes are treated as failure (do not open OTP screen).
      return { ok: false, detail: responseCode }
    }
  } catch {
    // Malformed JSON — try to extract responseCode from the raw body.
    const codeMatch = trimmed.match(/"responseCode"\s*:\s*"([^"]+)"/i)
    if (codeMatch?.[1]) {
      const lower = codeMatch[1].toLowerCase()
      const isFailure = AQUA_SMS_FAILURE_HINTS.some((hint) => lower.includes(hint))
      if (isFailure) {
        return { ok: false, detail: codeMatch[1] }
      }
      if (
        lower.includes('success')
        || lower.includes('submitted')
        || lower.includes('sent')
        || lower === 'ok'
      ) {
        return { ok: true, detail: codeMatch[1] }
      }
      return { ok: false, detail: codeMatch[1] }
    }
  }

  const normalized = trimmed.toLowerCase()
  const isFailure = AQUA_SMS_FAILURE_HINTS.some((hint) => normalized.includes(hint))
  return isFailure ? { ok: false, detail: trimmed.slice(0, 200) } : { ok: true }
}

export type SmsSendResult = {
  provider: 'aquasms'
  responseCode: string
  msgId?: string
  numberSent: string
}

function extractAquaSmsSuccess(body: string): { responseCode: string; msgId?: string } | null {
  const parsed = parseAquaSmsResponse(body)
  if (!parsed.ok || !parsed.detail) {
    return parsed.ok ? { responseCode: 'ok' } : null
  }

  let msgId: string | undefined
  try {
    const json = JSON.parse(body.trim()) as unknown
    const items = Array.isArray(json) ? json : [json]
    for (const item of items) {
      if (!item || typeof item !== 'object') continue
      const record = item as Record<string, unknown>
      const id = String(record.msgid ?? record.msgId ?? record.MsgId ?? '').trim()
      if (id) {
        msgId = id
        break
      }
    }
  } catch {
    // msgId is optional
  }

  return { responseCode: parsed.detail, msgId }
}

function isAquaSmsSuccess(status: number, body: string): boolean {
  if (status < 200 || status >= 300) {
    return false
  }
  return parseAquaSmsResponse(body).ok
}

export function partnerOtpDeliveryErrorMessage(): string {
  return 'Unable to send OTP. Please try again later.'
}

function logSmsEvent(event: string, payload: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      scope: 'sms',
      event,
      timestamp: new Date().toISOString(),
      ...payload,
    }),
  )
}

async function sendViaAquaSms(aquaConfig: AquaSmsConfig, payload: SmsPayload): Promise<SmsSendResult> {
  const smsNumber = toAquaSmsNumber(payload.to)
  const url = new URL(aquaConfig.aquasmsBaseUrl)
  url.searchParams.set('username', aquaConfig.aquasmsUsername)
  url.searchParams.set('message', payload.message)
  url.searchParams.set('sendername', aquaConfig.aquasmsSenderName)
  url.searchParams.set('smstype', aquaConfig.aquasmsSmsType)
  url.searchParams.set('numbers', smsNumber)
  url.searchParams.set('apikey', aquaConfig.aquasmsApiKey)

  const startedAt = Date.now()
  const maskedNumber = `******${smsNumber.slice(-4)}`
  const requestUrl = url.toString().replace(aquaConfig.aquasmsApiKey, '***')

  logSmsEvent('aquasms.request', {
    url: requestUrl,
    numberHint: maskedNumber,
    smsNumber,
    messageLength: payload.message.length,
  })

  try {
    const response = await fetch(url.toString(), { method: 'GET' })
    const body = await response.text()

    const parsed = parseAquaSmsResponse(body)
    if (!isAquaSmsSuccess(response.status, body) || !parsed.ok) {
      logSmsEvent('aquasms.failed', {
        status: response.status,
        numberHint: maskedNumber,
        smsNumber,
        response: body.slice(0, 300),
        providerCode: parsed.detail,
        latencyMs: Date.now() - startedAt,
      })
      throw createError({
        statusCode: 502,
        statusMessage: partnerOtpDeliveryErrorMessage(),
        data: {
          code: 'OTP_SMS_DELIVERY_FAILED',
          provider: 'aquasms',
          detail: parsed.detail || body.slice(0, 200),
        },
      })
    }

    const success = extractAquaSmsSuccess(body)
    logSmsEvent('aquasms.success', {
      status: response.status,
      numberHint: maskedNumber,
      smsNumber,
      providerCode: success?.responseCode,
      msgId: success?.msgId,
      latencyMs: Date.now() - startedAt,
    })

    return {
      provider: 'aquasms',
      responseCode: success?.responseCode || parsed.detail || 'ok',
      msgId: success?.msgId,
      numberSent: smsNumber,
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    logSmsEvent('aquasms.request_error', {
      numberHint: maskedNumber,
      smsNumber,
      message: error instanceof Error ? error.message : 'unknown',
      latencyMs: Date.now() - startedAt,
    })

    throw createError({
      statusCode: 502,
      statusMessage: partnerOtpDeliveryErrorMessage(),
      data: { code: 'OTP_SMS_DELIVERY_FAILED', provider: 'aquasms' },
    })
  }
}

export function hasSmsProvider(): boolean {
  const config = useRuntimeConfig()
  return Boolean(getAquaSmsConfig(config))
}

export async function sendTransactionalSms(payload: SmsPayload): Promise<SmsSendResult> {
  const config = useRuntimeConfig()
  const aquaConfig = getAquaSmsConfig(config)

  if (!aquaConfig) {
    throw createError({
      statusCode: 500,
      statusMessage: partnerOtpDeliveryErrorMessage(),
      data: { code: 'OTP_SMS_PROVIDER_MISSING' },
    })
  }

  return sendViaAquaSms(aquaConfig, payload)
}

export function maskPhoneForDisplay(e164: string): string {
  const digits = e164.replace(/\D/g, '')
  const local = digits.slice(-10)
  if (local.length !== 10) {
    return e164
  }
  return `+91 ******${local.slice(-4)}`
}
