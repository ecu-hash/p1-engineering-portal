'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Live product data — prices per engine sourced from p1engineering.io
const PRODUCTS = [
  {
    make: 'BMW',
    title: 'BMW SAME DAY ECU Unlock',
    subtitle: '2020+',
    engines: [
      { code: 'B37',  price: 2550, available: true },
      { code: 'B38',  price: 2200, available: true },
      { code: 'B47',  price: 2550, available: true },
      { code: 'B48',  price: 2200, available: true },
      { code: 'B57',  price: 2550, available: true },
      { code: 'B58',  price: 2550, available: true },
      { code: 'S58',  price: 2750, available: true },
      { code: 'N63',  price: 2550, available: true },
      { code: 'S63',  price: 3200, available: true },
      { code: 'S68',  price: 2550, available: false },
    ],
  },
  {
    make: 'MINI',
    title: 'MINI SAME DAY ECU Unlock',
    subtitle: '06/2020+',
    engines: [
      { code: 'B38',  price: 2200, available: true },
      { code: 'B48',  price: 2200, available: true },
    ],
  },
  {
    make: 'Mercedes-Benz',
    title: 'Mercedes-Benz SAME DAY ECU Unlock',
    subtitle: '2020+',
    engines: [
      { code: 'M139', price: 2550, available: true },
      { code: 'M256', price: 2550, available: true },
    ],
  },
]

export default function SubmitPage() {
  const router = useRouter()
  const [step, setStep] = useState<1|2>(1)
  const [selectedMake, setSelectedMake] = useState<string|null>(null)
  const [selectedEngine, setSelectedEngine] = useState<string|null>(null)
  const [vehicleYear, setVehicleYear] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const product = PRODUCTS.find(p => p.make === selectedMake)
  const engineData = product?.engines.find(e => e.code === selectedEngine)
  const selectedPrice = engineData?.price ?? null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMake || !selectedEngine || !selectedPrice) return
    setLoading(true); setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { error } = await supabase.from('ecu_orders').insert({
      user_id: user.id,
      vehicle_make: selectedMake,
      engine_type: selectedEngine,
      vehicle_year: vehicleYear || null,
      vehicle_model: vehicleModel || null,
      notes: notes || null,
      status: 'pending',
      price: selectedPrice,
    })
    if (error) { setError(error.message); setLoading(false) }
    else { setSubmitted(true) }
  }

  if (submitted) return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white border border-p1-border p-10 text-center">
        <div className="w-12 h-12 bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-p1-sub mb-2">Order Received</p>
        <h2 className="text-3xl font-black uppercase mb-4">Submitted</h2>
        <p className="text-p1-sub text-sm mb-8">
          Your {selectedMake} {selectedEngine} ECU unlock order has been received.<br/>
          Our team will be in touch to confirm your booking.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setSubmitted(false); setStep(1); setSelectedMake(null); setSelectedEngine(null) }} className="btn-outline">New Order</button>
          <button onClick={() => router.push('/orders')} className="btn-primary">View Orders</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-10 border-b border-p1-border pb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-p1-sub mb-1">ECU Unlock</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">Submit Order</h1>
      </div>

      {step === 1 && (
        <>
          <p className="text-xs font-bold uppercase tracking-widest text-p1-sub mb-4">Step 1 — Select Vehicle</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PRODUCTS.map(p => {
              const prices = [...new Set(p.engines.filter(e => e.available).map(e => e.price))].sort((a,b) => a-b)
              const priceLabel = prices.length === 1
                ? `$${prices[0].toLocaleString()}`
                : `$${prices[0].toLocaleString()} – $${prices[prices.length-1].toLocaleString()}`
              return (
                <button key={p.make} onClick={() => { setSelectedMake(p.make); setSelectedEngine(null); setStep(2) }}
                  className="bg-white border border-p1-border p-6 text-left hover:border-p1-black hover:shadow-sm transition-all group">
                  <p className="text-xs font-bold uppercase tracking-widest text-p1-sub mb-1 group-hover:text-p1-black">{p.subtitle}</p>
                  <h3 className="text-xl font-black uppercase mb-3">{p.make}</h3>
                  <p className="text-2xl font-black">{priceLabel}<span className="text-sm font-normal text-p1-sub"> AUD</span></p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {p.engines.filter(e => e.available).slice(0,4).map(e => (
                      <span key={e.code} className="text-xs border border-p1-border px-2 py-0.5 font-mono">{e.code}</span>
                    ))}
                    {p.engines.length > 4 && <span className="text-xs text-p1-dim">+{p.engines.length - 4}</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {step === 2 && product && (
        <form onSubmit={handleSubmit}>
          <button type="button" onClick={() => { setStep(1); setSelectedEngine(null) }}
            className="text-xs font-bold uppercase tracking-wider text-p1-sub hover:text-p1-black mb-6">← Back</button>
          <p className="text-xs font-bold uppercase tracking-widest text-p1-sub mb-4">Step 2 — Engine &amp; Details</p>

          {/* Product header */}
          <div className="bg-p1-bg-alt border border-p1-border p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-p1-sub uppercase tracking-widest font-bold">{selectedMake}</p>
              <p className="text-lg font-black uppercase">{product.title}</p>
            </div>
            <div className="text-right">
              {selectedPrice ? (
                <p className="text-xl font-black">${selectedPrice.toLocaleString()} <span className="text-sm font-normal text-p1-sub">AUD</span></p>
              ) : (
                <p className="text-sm text-p1-dim">Select engine for price</p>
              )}
            </div>
          </div>

          {/* Engine selection — shows price per engine */}
          <div className="mb-6">
            <label className="label">Engine Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {product.engines.map(engine => (
                <button key={engine.code} type="button" disabled={!engine.available}
                  onClick={() => setSelectedEngine(engine.available ? engine.code : null)}
                  className={`py-3 px-3 text-left border transition-all ${
                    !engine.available
                      ? 'opacity-40 cursor-not-allowed border-p1-border'
                      : selectedEngine === engine.code
                      ? 'bg-p1-black text-white border-p1-black'
                      : 'bg-white border-p1-border hover:border-p1-black'
                  }`}>
                  <p className={`text-sm font-black uppercase ${selectedEngine === engine.code ? 'text-white' : 'text-p1-text'}`}>
                    {engine.code}{!engine.available ? ' *' : ''}
                  </p>
                  <p className={`text-xs font-bold mt-0.5 ${selectedEngine === engine.code ? 'text-white/70' : 'text-p1-sub'}`}>
                    {engine.available ? `$${engine.price.toLocaleString()} AUD` : 'Coming soon'}
                  </p>
                </button>
              ))}
            </div>
            {product.engines.some(e => !e.available) && (
              <p className="text-xs text-p1-dim mt-2">* Coming soon — reserve your allocation</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="label">Vehicle Year</label>
              <input type="text" value={vehicleYear} onChange={e => setVehicleYear(e.target.value)} className="input" placeholder="e.g. 2022" />
            </div>
            <div>
              <label className="label">Vehicle Model</label>
              <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="input" placeholder="e.g. M340i" />
            </div>
          </div>

          <div className="mb-6">
            <label className="label">Notes <span className="text-p1-dim font-normal normal-case">(optional)</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input resize-none h-24" placeholder="Additional information..." />
          </div>

          <div className="bg-white border border-p1-border p-4 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-p1-sub mb-2">Service Information</p>
            <ul className="space-y-1 text-xs text-p1-sub">
              <li>— Same-day completion (30–60 min on-site)</li>
              <li>— Available in NSW · VIC · QLD · SA</li>
              <li>— No ECU opening, cloning or overseas shipping</li>
              <li>— Bring ECU only or complete vehicle (location dependent)</li>
            </ul>
          </div>

          {error && <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep(1); setSelectedEngine(null) }} className="btn-outline">Back</button>
            <button type="submit" disabled={!selectedEngine || loading} className="btn-primary flex-1">
              {loading ? 'Submitting...' : selectedPrice ? `Submit Order — $${selectedPrice.toLocaleString()} AUD` : 'Select an engine'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
