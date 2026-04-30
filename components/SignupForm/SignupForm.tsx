'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { doc, setDoc } from 'firebase/firestore'
import { useAuth } from '@/lib/AuthContext'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/types/firestore'
import { FirebaseError } from 'firebase/app'

const errorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/invalid-email': 'Invalid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
}

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [codename, setCodename] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const credential = await signUp(email, password)
      await setDoc(doc(db, COLLECTIONS.USERS, credential.user.uid), {
        uid: credential.user.uid,
        codename,
      })
      router.push('/heists')
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(errorMessages[err.code] ?? 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="center-content">
      <div className="page-content">
        <h1 className="form-title">Create Your Account</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="codename" className="form-label">Codename</label>
            <input
              id="codename"
              type="text"
              className="form-input"
              value={codename}
              onChange={(e) => setCodename(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>
        <p className="form-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}
