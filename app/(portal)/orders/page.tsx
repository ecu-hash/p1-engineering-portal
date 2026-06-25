import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/StatusBadge'
import { Order } from '@/lib/types'

export default async function OrdersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const orders: Order[] = data || []

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">My orders</h1>

      <div className="card">
        {orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-gray-400 mb-3">No orders yet.</p>
            <Link href="/submit" className="btn-primary text-sm">Submit your first ECU</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="text-left pb-2 font-medium">Order</th>
                <th className="text-left pb-2 font-medium">ECU type</th>
                <th className="text-left pb-2 font-medium">Vehicle</th>
                <th className="text-left pb-2 font-medium">Status</th>
                <th className="text-left pb-2 font-medium">Total</th>
                <th className="text-left pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <Link href={`/orders/${order.id}`} className="text-primary-500 font-medium hover:underline">
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="py-3 text-gray-600">{order.ecu_type}</td>
                  <td className="py-3 text-gray-600">{order.year} {order.make} {order.model}</td>
                  <td className="py-3"><StatusBadge status={order.status} /></td>
                  <td className="py-3 text-gray-600">${(order.price_cents / 100).toFixed(0)}</td>
                  <td className="py-3 text-gray-400 text-xs">
                    {new Date(order.created_at).toLocaleDateString('en-AU', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
