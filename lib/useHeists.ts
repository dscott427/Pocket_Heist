import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import { Heist, heistConverter, COLLECTIONS } from '@/types/firestore'

export function useHeists(mode: 'active' | 'assigned' | 'expired'): { heists: Heist[]; loading: boolean } {
  const { user } = useAuth()
  const [heists, setHeists] = useState<Heist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setHeists([])
      setLoading(false)
      return
    }

    setLoading(true)

    const colRef = collection(db, COLLECTIONS.HEISTS).withConverter(heistConverter)
    const now = new Date()

    let q
    if (mode === 'active') {
      q = query(colRef, where('assignedTo', '==', user.uid), where('deadline', '>', now))
    } else if (mode === 'assigned') {
      q = query(colRef, where('createdBy', '==', user.uid), where('deadline', '>', now))
    } else {
      q = query(colRef, where('finalStatus', 'in', ['success', 'failure']))
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => doc.data() as Heist)
        setHeists(docs)
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [mode, user])

  return { heists, loading }
}
