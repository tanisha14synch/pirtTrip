type MailPayload = {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendTransactionalEmail(payload: MailPayload): Promise<void> {
  const config = useRuntimeConfig()
  const resendKey = config.resendApiKey
  const from = config.emailFrom || 'PirtTrip <onboarding@resend.dev>'
  const isProd = process.env.NODE_ENV === 'production'

  if (resendKey) {
    await sendViaResend(resendKey, from, payload)
    return
  }

  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    await sendViaSmtp(config, from, payload)
    return
  }

  if (isProd) {
    throw createError({
      statusCode: 500,
      statusMessage: 'No email provider configured',
      data: { code: 'OTP_EMAIL_PROVIDER_MISSING' },
    })
  }

  // Fallback: Supabase Auth OTP email (requires dashboard Email provider + templates)
  await sendViaSupabaseAuth(payload)
}

async function sendViaResend(apiKey: string, from: string, payload: MailPayload) {
  const { Resend } = await import('resend')
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: [payload.to],
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  })

  if (error) {
    throw createError({
      statusCode: 502,
      statusMessage: `Email delivery failed: ${error.message}`,
    })
  }
}

async function sendViaSmtp(
  config: ReturnType<typeof useRuntimeConfig>,
  from: string,
  payload: MailPayload,
) {
  const nodemailer = await import('nodemailer')
  const transport = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort || 587),
    secure: Number(config.smtpPort) === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  })

  await transport.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  })
}

async function sendViaSupabaseAuth(payload: MailPayload) {
  const supabase = getSupabaseAdmin()

  // Extract 6-digit code from plain text if present
  const codeMatch = payload.text.match(/\b(\d{6})\b/)
  if (!codeMatch) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Configure RESEND_API_KEY or SMTP settings to send OTP emails. Supabase fallback requires OTP in email body.',
    })
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: payload.to,
    options: {
      shouldCreateUser: true,
      data: { otp_fallback: true },
    },
  })

  if (error) {
    throw createError({
      statusCode: 502,
      statusMessage: `Supabase email failed: ${error.message}. Enable Email provider and OTP template in Supabase Dashboard.`,
    })
  }
}

export function buildPartnerAdminOtpEmailContent(options: {
  code: string
  firstName: string
  lastName: string
  businessName: string
  phone: string
}) {
  const subject = `Partner registration OTP: ${options.code}`
  const registrant = `${options.firstName} ${options.lastName}`.trim()
  const text = [
    'A new partner registration is awaiting verification.',
    '',
    `Name: ${registrant}`,
    `Business: ${options.businessName}`,
    `Phone: +91-${options.phone}`,
    '',
    `Verification code: ${options.code}`,
    '',
    'Share this code with the registrant so they can complete signup. The code expires in 10 minutes.',
  ].join('\n')

  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#141210;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:40px auto;background:#1e1b18;border-radius:12px;border:1px solid #333;">
    <tr>
      <td style="padding:32px 28px;">
        <p style="margin:0 0 8px;color:#F3A81A;font-size:14px;font-weight:bold;letter-spacing:0.05em;">PirtTrip Business</p>
        <h1 style="margin:0 0 16px;color:#fff;font-size:22px;">Partner registration OTP</h1>
        <p style="margin:0 0 16px;color:#aaa;font-size:15px;line-height:1.5;">A new business registration is awaiting verification.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;color:#ddd;font-size:14px;line-height:1.6;">
          <tr><td><strong style="color:#fff;">Name:</strong> ${registrant}</td></tr>
          <tr><td><strong style="color:#fff;">Business:</strong> ${options.businessName}</td></tr>
          <tr><td><strong style="color:#fff;">Phone:</strong> +91-${options.phone}</td></tr>
        </table>
        <div style="text-align:center;display:inline-block;padding:16px 28px;background:#000;border:2px solid #F3A81A;border-radius:10px;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#F3A81A;">${options.code}</span>
        </div>
        <p style="margin:24px 0 0;color:#666;font-size:13px;line-height:1.5;">Share this code with the registrant so they can complete signup. The code expires in 10 minutes.</p>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()

  return { subject, text, html }
}

export function buildOtpEmailContent(code: string, purposeLabel: string) {
  const subject = `${code} is your PirtTrip verification code`
  const text = `Your PirtTrip verification code for ${purposeLabel} is: ${code}\n\nThis code expires in 10 minutes. If you did not request this, ignore this email.`
  const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#141210;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:40px auto;background:#1e1b18;border-radius:12px;border:1px solid #333;">
    <tr>
      <td style="padding:32px 28px;text-align:center;">
        <p style="margin:0 0 8px;color:#F3A81A;font-size:14px;font-weight:bold;letter-spacing:0.05em;">PirtTrip</p>
        <h1 style="margin:0 0 12px;color:#fff;font-size:22px;">Verify your email</h1>
        <p style="margin:0 0 24px;color:#aaa;font-size:15px;line-height:1.5;">Use this code to complete <strong style="color:#fff;">${purposeLabel}</strong>. It expires in <strong>10 minutes</strong>.</p>
        <div style="display:inline-block;padding:16px 28px;background:#000;border:2px solid #F3A81A;border-radius:10px;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#F3A81A;">${code}</span>
        </div>
        <p style="margin:24px 0 0;color:#666;font-size:13px;">If you didn't request this code, you can safely ignore this email.</p>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()

  return { subject, text, html }
}
