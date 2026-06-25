'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="border-b border-p1-border px-6 py-4 flex items-center">
        <img src="https://p1engineering.io/cdn/shop/files/P1_Final_logo.png?height=40&v=1771632821" alt="P1 Protocol One Engineering" className="h-8 invert" />
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-p1-sub mb-2">Customer Portal</p>
            <h1 className="text-4xl font-black uppercase tracking-tight text-p1-black">Sign In</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="your@email.com" required />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="••••••••" required />
            </div>
            {error && <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-p1-border">
            <p className="text-sm text-p1-sub">
              New customer?{' '}
              <Link href="/register" className="font-bold text-p1-black underline underline-offset-2">Create account</Link>
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-p1-border px-6 py-4 text-xs text-p1-dim text-center">
        © 2025 Protocol One Engineering. All rights reserved.
      </div>
    </div>
  )
}
