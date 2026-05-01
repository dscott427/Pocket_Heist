import styles from './HeistCard.module.css'

export default function HeistCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.skeletonTop}>
        <div className={`${styles.skeletonBar} w-3/4 h-5`} />
        <div className={`${styles.skeletonBar} w-4 h-4 rounded-full shrink-0`} />
      </div>
      <div className={styles.skeletonMeta}>
        <div className={styles.skeletonMetaRow}>
          <div className={`${styles.skeletonBar} w-4 h-4 shrink-0`} />
          <div className={`${styles.skeletonBar} w-2/5 h-3.5`} />
        </div>
        <div className={styles.skeletonMetaRow}>
          <div className={`${styles.skeletonBar} w-4 h-4 shrink-0`} />
          <div className={`${styles.skeletonBar} w-1/3 h-3.5`} />
        </div>
        <div className={styles.skeletonMetaRow}>
          <div className={`${styles.skeletonBar} w-4 h-4 shrink-0`} />
          <div className={`${styles.skeletonBar} w-1/2 h-3.5`} />
        </div>
      </div>
    </div>
  )
}
