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

export interface AdminUser {
  id: string
  full_name: string
  email: string
  phone?: string | null
  role: AdminRole
  created_at: string
}

export interface LeadsListQuery {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
  otpVerified?: string
}

export interface LeadsListResponse {
  data: PartnerLead[]
  total: number
  page: number
  pageSize: number
}
