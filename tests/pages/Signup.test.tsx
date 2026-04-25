import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SignupForm from '@/components/SignupForm'

describe('SignupForm', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
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
    const toggle = screen.getByRole('button', { name: /show password/i })
    await user.click(toggle)
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text')
    await user.click(screen.getByRole('button', { name: /hide password/i }))
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password')
  })

  it('submitting the form logs email and password to the console', async () => {
    const user = userEvent.setup()
    render(<SignupForm />)
    await user.type(screen.getByLabelText('Email'), 'newuser@example.com')
    await user.type(screen.getByLabelText('Password'), 'mypassword')
    await user.click(screen.getByRole('button', { name: /sign up/i }))
    expect(console.log).toHaveBeenCalledWith({ email: 'newuser@example.com', password: 'mypassword' })
  })

  it('contains a link to the login page', () => {
    render(<SignupForm />)
    const link = screen.getByRole('link', { name: /log in/i })
    expect(link).toHaveAttribute('href', '/login')
  })
})
