import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProtectedLayout from '@/components/ProtectedLayout'

const mockUseAuth = vi.fn()
const mockReplace = vi.fn()

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
}))

describe('ProtectedLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing while auth state is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true })
    const { container } = render(
      <ProtectedLayout><div>Protected content</div></ProtectedLayout>
    )
    expect(container.firstChild).toBeNull()
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })

  it('renders children when the user is authenticated', () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'abc123' }, loading: false })
    render(<ProtectedLayout><div>Protected content</div></ProtectedLayout>)
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('redirects to /login when the user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false })
    render(<ProtectedLayout><div>Protected content</div></ProtectedLayout>)
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/login'))
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
  })
})
