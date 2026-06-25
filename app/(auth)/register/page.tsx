'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, phone: form.phone },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Insert into profiles table
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || null,
      })
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">P1 Engineering</h1>
          <p className="text-sm text-gray-500 mt-1">ECU Unlock Portal</p>
        </div>

        <div className="card">
          <h2 className="text-base font-medium text-gray-900 mb-5">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input type="text" className="input" placeholder="James Dalton"
                value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={(e) => update('email', e.target.value)} required />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input type="tel" className="input" placeholder="+61 4XX XXX XXX"
                value={form.phone} onChange={(e) => update('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Minimum 8 characters"
                value={form.password} onChange={(e) => update('password', e.target.value)}
                minLength={8} required />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-500 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
