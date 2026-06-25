import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/StatusBadge'
import { Order, SERVICE_LABELS } from '@/lib/types'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user!.id).single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const allOrders: Order[] = orders || []
  const inProgress = allOrders.filter((o) => o.status === 'in_progress' || o.status === 'queued').length
  const ready = allOrders.filter((o) => o.status === 'complete' && o.output_file_path).length
  const totalSpent = allOrders
    .filter((o) => o.stripe_payment_status === 'paid')
    .reduce((sum, o) => sum + o.price_cents, 0)
  const recent = allOrders.slice(0, 4)

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-xl font-semibold text-gray-900">Welcome back, {firstName}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here&apos;s an overview of your ECU orders.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-7">
        {[
          { label: 'Total orders', value: allOrders.length, sub: 'All time' },
          { label: 'In progress', value: inProgress, sub: 'Being processed' },
          { label: 'Ready', value: ready, sub: 'Awaiting download' },
          { label: 'Total spent', value: `$${(totalSpent / 100).toFixed(0)}`, sub: 'This year' },
        ].map((stat) => (
          <div key={stat.label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-900">Recent orders</h2>
          <Link href="/orders" className="text-xs text-primary-500 hover:underline">View all</Link>
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="text-left pb-2 font-medium">Order</th>
                <th className="text-left pb-2 font-medium">ECU</th>
                <th className="text-left pb-2 font-medium">Vehicle</th>
                <th className="text-left pb-2 font-medium">Status</th>
                <th className="text-left pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5">
                    <Link href={`/orders/${order.id}`} className="text-primary-500 font-medium hover:underline">
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="py-2.5 text-gray-600">{order.ecu_type}</td>
                  <td className="py-2.5 text-gray-600">{order.year} {order.make} {order.model}</td>
                  <td className="py-2.5"><StatusBadge status={order.status} /></td>
                  <td className="py-2.5 text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CTA */}
      <Link href="/submit" className="card flex items-center gap-4 hover:border-primary-500 transition-colors cursor-pointer no-underline">
        <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
          <Plus size={20} className="text-primary-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Submit a new ECU</p>
          <p className="text-xs text-gray-500 mt-0.5">Upload your file and pay securely online</p>
        </div>
      </Link>
    </div>
  )
}
