import Sidebar from '@/components/Sidebar'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 min-h-screen bg-p1-bg-alt">
        {children}
      </main>
    </div>
  )
}
