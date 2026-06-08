import { z } from 'zod'

export function zodErrorMessage(error: z.ZodError, fallback = 'Invalid request'): string {
  return error.issues[0]?.message ?? fallback
}

export const partnerRegistrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(80, 'First name is too long')
    .refine((val) => !/\d/.test(val), 'First name cannot contain numbers'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(80, 'Last name is too long')
    .refine((val) => !/\d/.test(val), 'Last name cannot contain numbers'),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  businessName: z
    .string()
    .trim()
    .min(1, 'Business name is required')
    .max(120, 'Business name is too long')
    .refine((val) => /[a-zA-Z]/.test(val), 'Business name must contain at least one letter'),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  whatsappOptIn: z.boolean().optional(),
})

/** Browser hostname for Android/iOS Web OTP SMS suffix (optional, validated server-side). */
export const webOtpHostSchema = z.string().max(253).optional()

export const otpSchema = z.object({
  token: z
    .string()
    .trim()
    .min(4, 'Enter the OTP code')
    .max(8, 'Invalid OTP'),
})

export const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const leadUpdateSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'ONBOARDED', 'REJECTED', 'SUSPENDED']).optional(),
  notes: z.string().max(5000).optional().nullable(),
})
