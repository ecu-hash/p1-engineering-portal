import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  completed:  'bg-green-50 text-green-700 border-green-200',
  shipped:    'bg-purple-50 text-purple-700 border-purple-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('ecu_orders').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10 border-b border-p1-border pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-p1-sub mb-1">ECU Unlock</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">My Orders</h1>
      </div>

      <div className="bg-white border border-p1-border">
        {!orders || orders.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-p1-sub text-sm mb-6">No orders submitted yet</p>
            <Link href="/submit" className="btn-primary inline-block">Submit your first ECU</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-12 px-6 py-3 border-b border-p1-border bg-p1-bg-alt">
              <div className="col-span-3 text-xs font-black uppercase tracking-widest text-p1-sub">Vehicle</div>
              <div className="col-span-2 text-xs font-black uppercase tracking-widest text-p1-sub">Engine</div>
              <div className="col-span-2 text-xs font-black uppercase tracking-widest text-p1-sub">Year</div>
              <div className="col-span-2 text-xs font-black uppercase tracking-widest text-p1-sub">Price</div>
              <div className="col-span-2 text-xs font-black uppercase tracking-widest text-p1-sub">Status</div>
              <div className="col-span-1 text-xs font-black uppercase tracking-widest text-p1-sub">Date</div>
            </div>
            <div className="divide-y divide-p1-border">
              {orders.map((order: any) => (
                <div key={order.id} className="grid grid-cols-12 px-6 py-4 hover:bg-p1-bg-alt transition-colors items-center">
                  <div className="col-span-3">
                    <p className="text-sm font-bold">{order.vehicle_make}</p>
                    <p className="text-xs text-p1-sub">{order.vehicle_model || '—'}</p>
                  </div>
                  <div className="col-span-2"><span className="text-sm font-mono font-bold">{order.engine_type}</span></div>
                  <div className="col-span-2 text-sm text-p1-sub">{order.vehicle_year || '—'}</div>
                  <div className="col-span-2 text-sm font-bold">{order.price ? `$${order.price.toLocaleString()}` : '—'}</div>
                  <div className="col-span-2">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 border ${STATUS_STYLES[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="col-span-1 text-xs text-p1-dim">
                    {new Date(order.created_at).toLocaleDateString('en-AU',{day:'numeric',month:'short'})}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-6">
        <Link href="/submit" className="btn-primary inline-block">+ New Order</Link>
      </div>
    </div>
  )
}
