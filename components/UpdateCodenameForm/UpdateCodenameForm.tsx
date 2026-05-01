'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/lib/AuthContext'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firestore'

export default function UpdateCodenameForm() {
  const [codename, setCodename] = useState('')
  const [loadingCurrent, setLoadingCurrent] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { user } = useAuth()

  useEffect(() => {
    async function fetchCodename() {
      try {
        const snap = await getDoc(doc(db, COLLECTIONS.USERS, user!.uid))
        if (snap.exists()) setCodename(snap.data().codename ?? '')
      } catch (err) {
        console.error('[UpdateCodenameForm] failed to fetch codename:', err)
      } finally {
        setLoadingCurrent(false)
      }
    }
    fetchCodename()
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await updateDoc(doc(db, COLLECTIONS.USERS, user!.uid), { codename })
      setSuccess(true)
    } catch {
      setError('Failed to update codename. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="center-content">
      <div className="page-content">
        <h1 className="form-title">Your Codename</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="codename" className="form-label">Codename</label>
            <input
              id="codename"
              type="text"
              className="form-input"
              value={codename}
              onChange={(e) => { setCodename(e.target.value); setSuccess(false) }}
              disabled={loadingCurrent}
              required
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">Codename updated!</p>}
          <button
            type="submit"
            className="form-submit"
            disabled={saving || loadingCurrent}
          >
            {saving ? 'Saving…' : 'Save Codename'}
          </button>
        </form>
      </div>
    </div>
  )
}
