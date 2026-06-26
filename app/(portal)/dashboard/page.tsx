import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('ecu_orders').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(5)

  const name = user.user_metadata?.full_name?.split(' ')[0] || 'Customer'
  const sc: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-10 border-b border-p1-border pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-p1-sub mb-1">Welcome back</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">{name}</h1>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Orders', value: orders?.length ?? 0 },
          { label: 'Completed', value: orders?.filter((o:any) => o.status === 'completed').length ?? 0 },
          { label: 'In Progress', value: orders?.filter((o:any) => ['pending','processing'].includes(o.status)).length ?? 0 },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-p1-border p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-p1-sub mb-2">{stat.label}</p>
            <p className="text-3xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-p1-border">
        <div className="px-6 py-4 border-b border-p1-border flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest">Recent Orders</h2>
          <Link href="/orders" className="text-xs font-bold uppercase tracking-wider text-p1-sub hover:text-p1-black underline underline-offset-2">View all</Link>
        </div>
        {!orders || orders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-p1-sub text-sm mb-6">No orders yet</p>
            <Link href="/submit" className="btn-primary inline-block">Submit your first ECU</Link>
          </div>
        ) : (
          <div className="divide-y divide-p1-border">
            {orders.map((order: any) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-p1-bg-alt transition-colors">
                <div>
                  <p className="text-sm font-bold">{order.vehicle_make} — {order.engine_type}</p>
                  <p className="text-xs text-p1-sub mt-0.5">{new Date(order.created_at).toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})}</p>
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 border ${sc[order.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>{order.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6">
        <Link href="/submit" className="btn-primary inline-block">+ Submit New ECU</Link>
      </div>
    </div>
  )
}
