import { createClient } from '@/lib/supabase/server'
import { Order } from '@/lib/types'
import Link from 'next/link'
import DownloadButton from '../orders/[id]/DownloadButton'
import { FileDown } from 'lucide-react'

export default async function DownloadsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user!.id)
    .eq('status', 'complete')
    .not('output_file_path', 'is', null)
    .order('updated_at', { ascending: false })

  const complete: Order[] = orders || []

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Downloads</h1>

      {complete.length === 0 ? (
        <div className="card text-center py-12">
          <FileDown size={28} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No completed orders yet.</p>
          <Link href="/submit" className="text-xs text-primary-500 hover:underline mt-1 inline-block">
            Submit an ECU →
          </Link>
        </div>
      ) : (
        <div className="card divide-y divide-gray-50">
          {complete.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <FileDown size={16} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {order.ecu_type} · {order.year} {order.make} {order.model}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Order #{order.order_number} ·{' '}
                    {new Date(order.updated_at).toLocaleDateString('en-AU', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <DownloadButton orderId={order.id} filePath={order.output_file_path!} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
