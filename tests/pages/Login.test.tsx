import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginForm from '@/components/LoginForm'

describe('LoginForm', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
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
    const toggle = screen.getByRole('button', { name: /show password/i })
    await user.click(toggle)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('submitting the form logs email and password to the console', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: /login/i }))
    expect(console.log).toHaveBeenCalledWith({ email: 'test@example.com', password: 'secret123' })
  })

  it('contains a link to the signup page', () => {
    render(<LoginForm />)
    const link = screen.getByRole('link', { name: /sign up/i })
    expect(link).toHaveAttribute('href', '/signup')
  })
})
