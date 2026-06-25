import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/StatusBadge'
import OrderTimeline from '@/components/OrderTimeline'
import { Order, OrderEvent, SERVICE_LABELS } from '@/lib/types'
import DownloadButton from './DownloadButton'
import { ArrowLeft } from 'lucide-react'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!order) notFound()

  const { data: events } = await supabase
    .from('order_events')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: true })

  const o: Order = order
  const timeline: OrderEvent[] = events || []

  return (
    <div>
      <Link href="/orders" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-5">
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Order #{o.order_number}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {o.ecu_type} · {o.year} {o.make} {o.model}
          </p>
        </div>
        <StatusBadge status={o.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Order details */}
        <div className="card">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Order details</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Vehicle', `${o.year} ${o.make} ${o.model}`],
              ['Engine', o.engine],
              ['ECU type', o.ecu_type],
              ['Service', SERVICE_LABELS[o.service_type]],
              ['Submitted', new Date(o.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })],
              ['Total paid', `$${(o.price_cents / 100).toFixed(0)}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-400">{label}</dt>
                <dd className="text-gray-800 font-medium text-right max-w-[200px]">{value}</dd>
              </div>
            ))}
          </dl>
          {o.notes && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <p className="text-xs text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-600">{o.notes}</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card">
          <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Timeline</h2>
          {timeline.length === 0 ? (
            <p className="text-sm text-gray-400">No updates yet.</p>
          ) : (
            <OrderTimeline events={timeline} />
          )}
        </div>
      </div>

      {/* Download section */}
      {o.status === 'complete' && o.output_file_path && (
        <div className="card border-green-100 bg-green-50">
          <h2 className="text-sm font-medium text-green-800 mb-1">Your file is ready</h2>
          <p className="text-xs text-green-600 mb-3">Your unlocked ECU file is available to download.</p>
          <DownloadButton orderId={o.id} filePath={o.output_file_path} />
        </div>
      )}

      {/* Pending payment notice */}
      {o.status === 'pending_payment' && (
        <div className="card border-amber-100 bg-amber-50">
          <p className="text-sm text-amber-800">
            This order is awaiting payment.{' '}
            <Link href="/submit" className="underline font-medium">Resubmit to pay →</Link>
          </p>
        </div>
      )}
    </div>
  )
}
