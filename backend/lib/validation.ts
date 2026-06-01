import { z } from 'zod'

export const partnerRegistrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(80, 'First name is too long'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(80, 'Last name is too long'),
  phone: z
    .string()
    .trim()
    .min(10, 'Phone number is required')
    .max(20, 'Phone number is too long'),
  email: z.string().trim().email('Enter a valid email address'),
})

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
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'ONBOARDED', 'REJECTED']).optional(),
  notes: z.string().max(5000).optional().nullable(),
})
