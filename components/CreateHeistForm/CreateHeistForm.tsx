'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { collection, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { useAuth } from '@/lib/AuthContext'
import { db } from '@/lib/firebase'
import { CreateHeistInput, FirestoreUser, COLLECTIONS } from '@/types/firestore'

export default function CreateHeistForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [users, setUsers] = useState<FirestoreUser[]>([])
  const [currentUserCodename, setCurrentUserCodename] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.USERS))
        console.log('[CreateHeistForm] users fetched:', snapshot.docs.length)
        const allUsers: FirestoreUser[] = snapshot.docs.map((doc) => doc.data() as FirestoreUser)
        const currentDoc = allUsers.find((u) => u.uid === user?.uid)
        setCurrentUserCodename(currentDoc?.codename ?? user?.uid ?? '')
        const filtered = allUsers.filter((u) => u.uid !== user?.uid)
        setUsers(filtered)
        if (filtered.length > 0) setAssignedTo(filtered[0].uid)
      } catch (err) {
        console.error('[CreateHeistForm] failed to fetch users:', err)
      } finally {
        setLoadingUsers(false)
      }
    }
    fetchUsers()
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const assignedUserDoc = users.find((u) => u.uid === assignedTo)
      const payload: CreateHeistInput = {
        title,
        description,
        createdBy: user!.uid,
        createdByCodename: currentUserCodename,
        assignedTo,
        assignedToCodename: assignedUserDoc?.codename ?? assignedTo,
        createdAt: serverTimestamp(),
        deadline: Timestamp.fromDate(new Date(Date.now() + 48 * 60 * 60 * 1000)),
        finalStatus: null,
      }
      await addDoc(collection(db, COLLECTIONS.HEISTS), payload)
      router.push('/heists')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="center-content">
      <div className="page-content">
        <h1 className="form-title">Create a New Heist</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              id="title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>
          <div className="form-field">
            <label htmlFor="assignedTo" className="form-label">Assign To</label>
            <select
              id="assignedTo"
              className="form-input"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={loadingUsers}
              required
            >
              {loadingUsers && (
                <option value="" disabled>Loading agents…</option>
              )}
              {!loadingUsers && users.length === 0 && (
                <option value="" disabled>No users available</option>
              )}
              {!loadingUsers && users.map((u) => (
                <option key={u.uid} value={u.uid}>{u.codename}</option>
              ))}
            </select>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="form-field">
            <button
              type="button"
              className="form-submit"
              onClick={() => router.push('/heists')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="form-submit"
              disabled={loading || loadingUsers || users.length === 0}
            >
              {loading ? 'Creating…' : 'Create Heist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
