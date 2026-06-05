export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'ONBOARDED' | 'REJECTED' | 'SUSPENDED'
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN'

export interface PartnerLead {
  id: string
  auth_user_id: string | null
  first_name: string
  last_name: string
  phone: string
  business_name: string | null
  email: string | null
  otp_verified: boolean
  source_page: string
  status: LeadStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OtpLog {
  id: string
  phone: string
  auth_user_id: string | null
  otp_sent_at: string | null
  verified_at: string | null
  attempts: number
  is_verified: boolean
  created_at: string
}

export interface AdminUser {
  id: string
  full_name: string
  email: string
  role: AdminRole
  created_at: string
}

export interface LeadActivityLog {
  id: string
  lead_id: string
  action: string
  old_value: string | null
  new_value: string | null
  admin_id: string | null
  created_at: string
}

export interface PartnerRegistrationPayload {
  firstName: string
  lastName: string
  phone: string
  businessName: string
  email?: string
}

export interface LeadsListQuery {
  page?: number
  pageSize?: number
  search?: string
  status?: LeadStatus | ''
  sortBy?: 'created_at' | 'updated_at' | 'first_name'
  sortOrder?: 'asc' | 'desc'
}

export interface LeadsListResponse {
  data: PartnerLead[]
  total: number
  page: number
  pageSize: number
}
