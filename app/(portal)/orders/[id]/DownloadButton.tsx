'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download } from 'lucide-react'

export default function DownloadButton({ orderId, filePath }: { orderId: string; filePath: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDownload() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: urlError } = await supabase.storage
      .from('ecu-outputs')
      .createSignedUrl(filePath, 60 * 60) // 1 hour expiry

    if (urlError || !data) {
      setError('Could not generate download link. Please try again.')
      setLoading(false)
      return
    }

    // Log the download
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('downloads').insert({
      order_id: orderId,
      user_id: user!.id,
      file_path: filePath,
    })

    // Trigger download
    const link = document.createElement('a')
    link.href = data.signedUrl
    link.download = filePath.split('/').pop() || 'ecu-unlocked.bin'
    link.click()

    setLoading(false)
  }

  return (
    <div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <button className="btn-primary flex items-center gap-2" onClick={handleDownload} disabled={loading}>
        <Download size={15} />
        {loading ? 'Preparing download…' : 'Download unlocked file'}
      </button>
    </div>
  )
}
