import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginForm from '@/components/LoginForm'

const mockSignIn = vi.fn()
const mockPush = vi.fn()

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({ signIn: mockSignIn }),
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

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders email field, password field, and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('password field is hidden by default', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('clicking the show/hide toggle reveals and hides the password', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.click(screen.getByRole('button', { name: /show password/i }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('redirects to /heists on successful login', async () => {
    mockSignIn.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/heists'))
  })

  it('shows an error message on invalid credentials', async () => {
    const { FirebaseError } = await import('firebase/app')
    mockSignIn.mockRejectedValueOnce(new FirebaseError('auth/invalid-credential', 'Invalid credential'))
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /login/i }))
    await waitFor(() => expect(screen.getByText('Invalid email or password.')).toBeInTheDocument())
  })

  it('disables the submit button while login is in progress', async () => {
    mockSignIn.mockReturnValueOnce(new Promise(() => {}))
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /login/i }))
    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
  })

  it('contains a link to the signup page', () => {
    render(<LoginForm />)
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/signup')
  })
})
