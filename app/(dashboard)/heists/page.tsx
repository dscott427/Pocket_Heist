'use client'

import { useHeists } from '@/lib/useHeists'

function Spinner() {
  return (
    <div
      className="animate-spin rounded-full border-2 border-t-transparent w-5 h-5"
      style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
    />
  )
}

function HeistList({ heists, loading }: { heists: { id: string; title: string }[]; loading: boolean }) {
  if (loading) return <Spinner />
  if (heists.length === 0) return <p>No heists</p>
  return (
    <ul>
      {heists.map((h) => (
        <li key={h.id}>{h.title}</li>
      ))}
    </ul>
  )
}

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading } = useHeists('active')
  const { heists: assignedHeists, loading: assignedLoading } = useHeists('assigned')
  const { heists: expiredHeists, loading: expiredLoading } = useHeists('expired')

  return (
    <div className="page-content">
      <div className="active-heists">
        <h2>Your Active Heists</h2>
        <HeistList heists={activeHeists} loading={activeLoading} />
      </div>
      <div className="assigned-heists">
        <h2>Heists You&apos;ve Assigned</h2>
        <HeistList heists={assignedHeists} loading={assignedLoading} />
      </div>
      <div className="expired-heists">
        <h2>All Expired Heists</h2>
        <HeistList heists={expiredHeists} loading={expiredLoading} />
      </div>
    </div>
  )
}
