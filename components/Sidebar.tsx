'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/submit',    label: 'New Order' },
  { href: '/orders',    label: 'My Orders' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-p1-border flex flex-col min-h-screen">
      <div className="px-6 py-5 border-b border-p1-border">
        <img src="https://p1engineering.io/cdn/shop/files/P1_Final_logo.png?height=40&v=1771632821" alt="P1 Protocol One Engineering" className="h-7 invert" />
      </div>
      <div className="px-6 pt-6 pb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-p1-dim">Customer Portal</p>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href} className={`flex items-center px-3 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors ${active ? 'bg-p1-black text-white' : 'text-p1-sub hover:text-p1-black hover:bg-p1-bg-alt'}`}>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-5 border-t border-p1-border">
        <button onClick={handleSignOut} className="w-full text-left px-3 py-2.5 text-sm font-bold uppercase tracking-wider text-p1-sub hover:text-p1-black hover:bg-p1-bg-alt transition-colors">
          Sign Out
        </button>
      </div>
      <div className="px-6 py-4 border-t border-p1-border">
        <p className="text-xs text-p1-dim">© 2025 Protocol One Engineering</p>
      </div>
    </aside>
  )
}
