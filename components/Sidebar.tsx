'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Upload, ListChecks, Download, User, HelpCircle, LogOut
} from 'lucide-react'

const nav = [
  { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/submit',    label: 'Submit ECU', icon: Upload },
  { href: '/orders',    label: 'My orders',  icon: ListChecks },
  { href: '/downloads', label: 'Downloads',  icon: Download },
  { href: '/account',   label: 'Account',    icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-white border-r border-gray-100 min-h-screen">
      <div className="px-5 py-5 border-b border-gray-100">
        <p className="font-semibold text-gray-900 text-sm">P1 Engineering</p>
        <p className="text-xs text-gray-400 mt-0.5">ECU Unlock Portal</p>
      </div>

      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-600 border-l-2 border-primary-500 rounded-l-none -ml-0.5'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-gray-100 space-y-0.5">
        <Link
          href="mailto:support@p1engineering.io"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
        >
          <HelpCircle size={16} />
          Support
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
