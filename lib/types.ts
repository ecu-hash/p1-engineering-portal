export type OrderStatus =
  | 'pending_payment'
  | 'queued'
  | 'in_progress'
  | 'review'
  | 'complete'
  | 'cancelled'

export type ServiceType =
  | 'full_unlock'
  | 'read_only'
  | 'clone'
  | 'checksum'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone: string | null
  company: string | null
  country: string | null
  created_at: string
}

export interface Order {
  id: string
  order_number: number
  user_id: string
  status: OrderStatus
  make: string
  model: string
  year: number
  engine: string
  ecu_type: string
  service_type: ServiceType
  notes: string | null
  input_file_path: string | null
  output_file_path: string | null
  price_cents: number
  stripe_payment_intent_id: string | null
  stripe_payment_status: string | null
  created_at: string
  updated_at: string
}

export interface OrderEvent {
  id: string
  order_id: string
  event_type: string
  description: string
  created_by: string
  created_at: string
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  full_unlock: 'Full unlock (read + write)',
  read_only: 'Read only',
  clone: 'Clone / virgin write',
  checksum: 'Checksum correction',
}

export const SERVICE_PRICES: Record<ServiceType, number> = {
  full_unlock: 18000,   // $180.00 in cents
  read_only:   12000,   // $120.00
  clone:       20000,   // $200.00
  checksum:     8000,   // $80.00
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Pending payment',
  queued:          'Queued',
  in_progress:     'In progress',
  review:          'Needs review',
  complete:        'Complete',
  cancelled:       'Cancelled',
}
