import Link from 'next/link'
import { Clock, User, Calendar } from 'lucide-react'
import { Heist } from '@/types/firestore/heist'
import styles from './HeistCard.module.css'

interface HeistCardProps {
  heist: Heist
  status: 'Active' | 'Assigned'
}

function formatDeadline(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function HeistCard({ heist, status }: HeistCardProps) {
  const isOverdue = heist.deadline < new Date()

  return (
    <Link href={`/heists/${heist.id}`} className={styles.cardLink} aria-label={`${status} heist: ${heist.title}`}>
      <article className={styles.card}>
        <div className={styles.top}>
          <h3 className={styles.title}>{heist.title}</h3>
          <Clock size={16} className={styles.clockIcon} />
        </div>
        <div className={styles.meta}>
          <div className={styles.metaRow}>
            <User size={14} className={styles.metaIcon} />
            <span>To: <span className={styles.codename}>@{heist.assignedToCodename}</span></span>
          </div>
          <div className={styles.metaRow}>
            <User size={14} className={styles.metaIcon} />
            <span>By: <span className={styles.codename}>@{heist.createdByCodename}</span></span>
          </div>
          <div className={styles.metaRow}>
            <Calendar size={14} className={styles.metaIcon} />
            <span>
              {formatDeadline(heist.deadline)}
              {isOverdue && <span className={styles.overdue}> • Overdue</span>}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
