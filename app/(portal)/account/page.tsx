'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '', company: '', country: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordMsg, setPasswordMsg] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
      if (data) setProfile({
        full_name: data.full_name || '',
        email: data.email || user?.email || '',
        phone: data.phone || '',
        company: data.company || '',
        country: data.country || '',
      })
    }
    load()
  }, [])

  function set(field: string, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('profiles').upsert({ id: user!.id, ...profile })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMsg('Passwords do not match.')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: passwordForm.next })
    if (error) {
      setPasswordMsg(error.message)
    } else {
      setPasswordMsg('Password updated successfully.')
      setPasswordForm({ current: '', next: '', confirm: '' })
    }
  }

  const initials = profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Account</h1>

      {/* Profile */}
      <div className="card mb-4">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-11 h-11 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 font-medium text-sm shrink-0">
            {initials || '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
            <p className="text-xs text-gray-400">{profile.email}</p>
          </div>
        </div>

        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Profile details</h2>
        <form onSubmit={saveProfile} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={profile.full_name} onChange={(e) => set('full_name', e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={profile.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={profile.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+61 4XX XXX XXX" />
          </div>
          <div>
            <label className="label">Company (optional)</label>
            <input className="input" value={profile.company} onChange={(e) => set('company', e.target.value)} />
          </div>
          <div>
            <label className="label">Country</label>
            <input className="input" value={profile.country} onChange={(e) => set('country', e.target.value)} placeholder="Australia" />
          </div>
          <div className="col-span-2 flex items-center gap-3 pt-1">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
            {saved && <span className="text-xs text-green-600">Saved!</span>}
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="card">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Change password</h2>
        <form onSubmit={changePassword} className="max-w-sm space-y-3">
          <div>
            <label className="label">New password</label>
            <input className="input" type="password" minLength={8} placeholder="Minimum 8 characters"
              value={passwordForm.next} onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))} />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input className="input" type="password" placeholder="Repeat new password"
              value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} />
          </div>
          {passwordMsg && (
            <p className={`text-xs ${passwordMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {passwordMsg}
            </p>
          )}
          <button type="submit" className="btn-primary">Update password</button>
        </form>
      </div>
    </div>
  )
}
