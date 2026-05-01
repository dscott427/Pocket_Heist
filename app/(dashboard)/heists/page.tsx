'use client'

import { useHeists } from '@/lib/useHeists'
import HeistCard, { HeistCardSkeleton } from '@/components/HeistCard'

function HeistGrid({ children }: { children: React.ReactNode }) {
  return <div className="heist-grid">{children}</div>
}

export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading } = useHeists('active')
  const { heists: assignedHeists, loading: assignedLoading } = useHeists('assigned')

  return (
    <div className="page-content">
      <section>
        <h2>Your Active Heists</h2>
        {activeLoading ? (
          <HeistGrid>
            <HeistCardSkeleton />
            <HeistCardSkeleton />
            <HeistCardSkeleton />
          </HeistGrid>
        ) : activeHeists.length === 0 ? (
          <p>No active heists</p>
        ) : (
          <HeistGrid>
            {activeHeists.map((h) => (
              <HeistCard key={h.id} heist={h} status="Active" />
            ))}
          </HeistGrid>
        )}
      </section>

      <section>
        <h2>Heists You&apos;ve Assigned</h2>
        {assignedLoading ? (
          <HeistGrid>
            <HeistCardSkeleton />
            <HeistCardSkeleton />
            <HeistCardSkeleton />
          </HeistGrid>
        ) : assignedHeists.length === 0 ? (
          <p>No assigned heists</p>
        ) : (
          <HeistGrid>
            {assignedHeists.map((h) => (
              <HeistCard key={h.id} heist={h} status="Assigned" />
            ))}
          </HeistGrid>
        )}
      </section>
    </div>
  )
}
