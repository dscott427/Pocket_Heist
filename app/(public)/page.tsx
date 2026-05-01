import Link from "next/link";
import { Clock8 } from "lucide-react";
import styles from "./splash.module.css";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.grid} />
      <div className={styles.glow} />
      <div className={styles.cornerTl} />
      <div className={styles.cornerBr} />

      <div className={styles.content}>
        <span className={styles.badge}>
          <span className={styles.badgeDot} />
          Mission Control
        </span>

        <h1 className={styles.title}>
          <span className={styles.titleText}>P</span>
          <Clock8
            className={`logo ${styles.titleIcon}`}
            strokeWidth={2.75}
            size="1em"
          />
          <span className={styles.titleText}>cket Heist</span>
        </h1>

        <p className={styles.tagline}>
          Plan the job. Run the crew. Take what&apos;s yours.
        </p>

        <div className={styles.divider} />

        <p className={styles.description}>
          Your command center for pulling off the perfect office heist.
          Organize missions, assign your crew, and track every move — all in one
          place.
        </p>

        <div className={styles.actions}>
          <Link href="/signup" className={styles.registerBtn}>
            Register
          </Link>
          <p className={styles.loginHint}>
            Already have an account?{" "}
            <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
