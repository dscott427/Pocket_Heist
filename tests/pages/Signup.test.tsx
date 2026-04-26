import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SignupForm from '@/components/SignupForm'

const mockSignUp = vi.fn()
const mockPush = vi.fn()

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({ signUp: mockSignUp }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}))

vi.mock('firebase/app', () => {
  class FirebaseError extends Error {
    code: string
    constructor(code: string, message: string) {
      super(message)
      this.code = code
      this.name = 'FirebaseError'
    }
  }
  return { FirebaseError }
})

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email field, password field, and submit button', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('password field is hidden by default', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('clicking the show/hide toggle reveals and hides the password', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('redirects to /heists on successful signup', async () => {
    mockSignUp.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Email'), 'newuser@example.com')
    await user.type(screen.getByLabelText('Password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: /sign up/i }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/heists'))
  })

  it('shows an error when the email is already in use', async () => {
    const { FirebaseError } = await import('firebase/app')
    mockSignUp.mockRejectedValueOnce(new FirebaseError('auth/email-already-in-use', 'Email in use'))
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Email'), 'existing@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))
    await waitFor(() =>
      expect(screen.getByText('An account with this email already exists.')).toBeInTheDocument()
    )
  })

  it('shows an error for a weak password', async () => {
    const { FirebaseError } = await import('firebase/app')
    mockSignUp.mockRejectedValueOnce(new FirebaseError('auth/weak-password', 'Weak password'))
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), '123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))
    await waitFor(() =>
      expect(screen.getByText('Password must be at least 6 characters.')).toBeInTheDocument()
    )
  })

  it('disables the submit button while signup is in progress', async () => {
    mockSignUp.mockReturnValueOnce(new Promise(() => {}))
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Email'), 'user@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
  })

  it('contains a link to the login page', () => {
    render(<SignupForm />)
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login')
  })
})
