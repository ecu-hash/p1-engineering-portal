import { OrderEvent } from '@/lib/types'
import { CheckCircle2, Circle } from 'lucide-react'

export default function OrderTimeline({ events }: { events: OrderEvent[] }) {
  return (
    <ol className="space-y-0">
      {events.map((event, i) => (
        <li key={event.id} className="flex gap-3 relative">
          {i < events.length - 1 && (
            <div className="absolute left-3 top-6 bottom-0 w-px bg-gray-100" />
          )}
          <div className="mt-0.5 shrink-0">
            <CheckCircle2 size={16} className="text-primary-500" />
          </div>
          <div className="pb-5">
            <p className="text-sm font-medium text-gray-800">{event.description}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(event.created_at).toLocaleString('en-AU', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
