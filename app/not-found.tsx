import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
          <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-zinc-900 mb-3">404</h1>
        <p className="text-xl font-semibold text-zinc-700 mb-2">Page Not Found</p>
        <p className="text-zinc-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex justify-center gap-3">
          <Link href="/" className="btn-secondary px-6 py-3 text-sm">Go Home</Link>
          <Link href="/products" className="btn-primary px-6 py-3 text-sm">Browse Products</Link>
        </div>
      </div>
    </div>
  )
}

