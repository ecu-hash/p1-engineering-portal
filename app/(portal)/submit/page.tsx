'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ServiceType, SERVICE_LABELS, SERVICE_PRICES } from '@/lib/types'
import { Upload, ChevronRight, CheckCircle2 } from 'lucide-react'

type Step = 1 | 2 | 3

const services: { value: ServiceType; label: string; price: number }[] = [
  { value: 'full_unlock', label: 'Full unlock (read + write)', price: 180 },
  { value: 'read_only',   label: 'Read only',                  price: 120 },
  { value: 'clone',       label: 'Clone / virgin write',        price: 200 },
  { value: 'checksum',    label: 'Checksum correction',         price: 80  },
]

export default function SubmitPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedPath, setUploadedPath] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState('')

  const [form, setForm] = useState({
    make: '', model: '', year: '', engine: '',
    ecu_type: '', service_type: 'full_unlock' as ServiceType, notes: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const selectedService = services.find((s) => s.value === form.service_type)!

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['bin', 'ori'].includes(ext || '')) {
      setError('Please upload a .bin or .ori file only.')
      return
    }
    if (file.size > 32 * 1024 * 1024) {
      setError('File must be under 32 MB.')
      return
    }

    setError('')
    setUploadProgress(10)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const path = `${user!.id}/${Date.now()}_${file.name}`

    setUploadProgress(40)
    const { error: uploadError } = await supabase.storage
      .from('ecu-inputs')
      .upload(path, file)

    if (uploadError) {
      setError(uploadError.message)
      setUploadProgress(0)
      return
    }

    setUploadProgress(100)
    setUploadedPath(path)
    setUploadedFileName(file.name)
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user!.id,
        status: 'pending_payment',
        make: form.make,
        model: form.model,
        year: parseInt(form.year),
        engine: form.engine,
        ecu_type: form.ecu_type,
        service_type: form.service_type,
        notes: form.notes || null,
        input_file_path: uploadedPath || null,
        price_cents: SERVICE_PRICES[form.service_type],
        stripe_payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      setError(orderError?.message || 'Failed to create order.')
      setLoading(false)
      return
    }

    // Create Stripe checkout
    const res = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, serviceType: form.service_type }),
    })

    const { url, error: checkoutError } = await res.json()

    if (checkoutError || !url) {
      setError(checkoutError || 'Failed to create payment session.')
      setLoading(false)
      return
    }

    window.location.href = url
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Submit ECU for unlocking</h1>
      <p className="text-sm text-gray-500 mb-6">Complete all steps then pay securely via Stripe.</p>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-7">
        {([1, 2, 3] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
              s < step ? 'bg-green-100 text-green-700' :
              s === step ? 'bg-primary-500 text-white' :
              'bg-gray-100 text-gray-400'
            }`}>
              {s < step ? <CheckCircle2 size={14} /> : s}
            </div>
            <span className={`text-xs font-medium ${s === step ? 'text-gray-900' : 'text-gray-400'}`}>
              {['Vehicle & ECU', 'Upload file', 'Review & pay'][i]}
            </span>
            {i < 2 && <ChevronRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Step 1: Vehicle & ECU details */}
      {step === 1 && (
        <div className="card">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Vehicle & ECU details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Make</label>
              <input className="input" placeholder="e.g. Volkswagen" value={form.make} onChange={(e) => set('make', e.target.value)} />
            </div>
            <div>
              <label className="label">Model</label>
              <input className="input" placeholder="e.g. Golf R" value={form.model} onChange={(e) => set('model', e.target.value)} />
            </div>
            <div>
              <label className="label">Year</label>
              <input className="input" type="number" placeholder="e.g. 2021" value={form.year} onChange={(e) => set('year', e.target.value)} />
            </div>
            <div>
              <label className="label">Engine</label>
              <input className="input" placeholder="e.g. 2.0 TSI EA888" value={form.engine} onChange={(e) => set('engine', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">ECU type / part number</label>
              <input className="input" placeholder="e.g. Bosch MED17.5.25" value={form.ecu_type} onChange={(e) => set('ecu_type', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="label">Service required</label>
              <select className="input" value={form.service_type} onChange={(e) => set('service_type', e.target.value)}>
                {services.map((s) => (
                  <option key={s.value} value={s.value}>{s.label} — ${s.price}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Notes (optional)</label>
              <textarea className="input" rows={3}
                placeholder="Any additional info, modifications, or special requirements…"
                value={form.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button
              className="btn-primary"
              onClick={() => {
                if (!form.make || !form.model || !form.year || !form.ecu_type) {
                  setError('Please fill in all required fields.')
                  return
                }
                setError('')
                setStep(2)
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: File upload */}
      {step === 2 && (
        <div className="card">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Upload ECU file</h2>
          <input ref={fileRef} type="file" accept=".bin,.ori" className="hidden" onChange={handleFileUpload} />

          {!uploadedPath ? (
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer hover:border-primary-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Drag and drop your .bin or .ori file here</p>
              <p className="text-xs text-gray-400 mt-1">or click to browse — max 32 MB</p>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
              <CheckCircle2 size={18} className="text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">{uploadedFileName}</p>
                <p className="text-xs text-green-600">Uploaded successfully</p>
              </div>
              <button className="ml-auto text-xs text-gray-400 hover:text-gray-600" onClick={() => { setUploadedPath(''); setUploadedFileName(''); }}>
                Change
              </button>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3">
            Don&apos;t have the file yet? You can still submit and upload later — contact us after placing your order.
          </p>

          <div className="mt-5 flex justify-between">
            <button className="btn-outline" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" onClick={() => { setError(''); setStep(3) }}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 3: Review & pay */}
      {step === 3 && (
        <div className="card">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Review & pay</h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm space-y-1.5">
            <div className="flex justify-between"><span className="text-gray-500">Vehicle</span><span className="font-medium">{form.year} {form.make} {form.model}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Engine</span><span>{form.engine}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">ECU type</span><span>{form.ecu_type}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Service</span><span>{selectedService.label}</span></div>
            {uploadedFileName && <div className="flex justify-between"><span className="text-gray-500">File</span><span className="truncate max-w-[180px]">{uploadedFileName}</span></div>}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500"><span>{selectedService.label}</span><span>${selectedService.price}.00</span></div>
            <div className="flex justify-between text-gray-500"><span>Processing fee</span><span>$0.00</span></div>
            <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>${selectedService.price}.00</span></div>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            You&apos;ll be redirected to Stripe&apos;s secure checkout. We accept all major cards.
          </p>

          <div className="mt-5 flex justify-between">
            <button className="btn-outline" onClick={() => setStep(2)}>Back</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Redirecting to payment…' : `Pay $${selectedService.price}.00 →`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
