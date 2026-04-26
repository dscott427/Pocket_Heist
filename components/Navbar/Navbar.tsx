'use client'

import { Clock8, Plus, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className={styles.siteNav}>
      <nav>
        <header>
          <h1>
            <Link href="/heists">
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
              cket Heist
            </Link>
          </h1>
          <div>Tiny missions. Big office mischief.</div>
        </header>
        <ul className={styles.navActions}>
          <li>
            <Link href="/heists/create" className={styles.createBtn}>
              <Plus size={14} strokeWidth={2.75} />
              Create New Heist
            </Link>
          </li>
          <li>
            <button className={styles.signOutBtn} onClick={handleSignOut}>
              <LogOut size={14} strokeWidth={2.75} />
              Sign Out
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
