import Link from 'next/link'
import ProfileDropdown from '@/components/kokonutui/profile-dropdown'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/admin/quotations" className="text-sm font-bold text-zinc-900">Ecoshift Admin</Link>
              <nav className="hidden sm:flex items-center gap-4">
                <Link href="/admin/quotations" className="text-sm font-medium text-zinc-600 hover:text-brand-600 transition-colors">Quotations</Link>
                <Link href="/admin/contact-submissions" className="text-sm font-medium text-zinc-600 hover:text-brand-600 transition-colors">Contact Submissions</Link>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-700" target="_blank" rel="noopener">View site ↗</Link>
              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="text-xs font-medium text-red-600 hover:text-red-700">Sign out</button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}

