'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
    // router is intentionally omitted from deps — including it causes an infinite
    // redirect loop because router.replace() mutates the router reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])

  if (loading || !user) return null

  return <>{children}</>
}
