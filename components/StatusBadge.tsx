import { OrderStatus, STATUS_LABELS } from '@/lib/types'

const styles: Record<OrderStatus, string> = {
  pending_payment: 'bg-gray-100 text-gray-600',
  queued:          'bg-amber-50 text-amber-700',
  in_progress:     'bg-blue-50 text-blue-700',
  review:          'bg-pink-50 text-pink-700',
  complete:        'bg-green-50 text-green-700',
  cancelled:       'bg-red-50 text-red-600',
}

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
