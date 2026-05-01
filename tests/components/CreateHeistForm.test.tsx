import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import CreateHeistForm from '@/components/CreateHeistForm'

const mockPush = vi.fn()
const mockUseAuth = vi.fn()
const mockGetDocs = vi.fn()
const mockAddDoc = vi.fn()

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}))

vi.mock('@/lib/firebase', () => ({
  db: {},
}))

const mockCollectionRef = { withConverter: vi.fn(() => mockCollectionRef) }

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => mockCollectionRef),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  serverTimestamp: vi.fn(() => ({ type: 'serverTimestamp' })),
  Timestamp: {
    fromDate: vi.fn((date: Date) => ({ type: 'timestamp', date })),
  },
}))

const makeSnapshot = (users: { uid: string; codename: string }[]) => ({
  docs: users.map((u) => ({ data: () => u })),
})

const defaultUsers = [
  { uid: 'user-1', codename: 'ShadowFox' },
  { uid: 'user-2', codename: 'IronGhost' },
]

beforeEach(() => {
  vi.clearAllMocks()
  mockUseAuth.mockReturnValue({ user: { uid: 'user-1' }, loading: false })
  mockGetDocs.mockResolvedValue(makeSnapshot(defaultUsers))
  mockAddDoc.mockResolvedValue({ id: 'new-heist-id' })
})

describe('CreateHeistForm', () => {
  it('renders title, description, and assign-to fields after users load', async () => {
    render(<CreateHeistForm />)
    await waitFor(() => expect(screen.queryByText('Loading agents…')).not.toBeInTheDocument())
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Assign To')).toBeInTheDocument()
  })

  it('renders Cancel and Create Heist buttons', async () => {
    render(<CreateHeistForm />)
    await waitFor(() => expect(screen.queryByText('Loading agents…')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Heist' })).toBeInTheDocument()
  })

  it('shows "Loading agents…" while users are being fetched', () => {
    mockGetDocs.mockReturnValue(new Promise(() => {}))
    render(<CreateHeistForm />)
    expect(screen.getByText('Loading agents…')).toBeInTheDocument()
  })

  it('shows "No users available" when all users are the current user', async () => {
    mockGetDocs.mockResolvedValue(makeSnapshot([{ uid: 'user-1', codename: 'ShadowFox' }]))
    render(<CreateHeistForm />)
    await waitFor(() => expect(screen.getByText('No users available')).toBeInTheDocument())
  })

  it('populates the dropdown with users excluding the current user', async () => {
    render(<CreateHeistForm />)
    await waitFor(() => expect(screen.queryByText('Loading agents…')).not.toBeInTheDocument())
    expect(screen.getByText('IronGhost')).toBeInTheDocument()
    expect(screen.queryByText('ShadowFox')).not.toBeInTheDocument()
  })

  it('pre-selects the first filtered user in the dropdown', async () => {
    render(<CreateHeistForm />)
    await waitFor(() => expect(screen.queryByText('Loading agents…')).not.toBeInTheDocument())
    expect(screen.getByRole('combobox')).toHaveValue('user-2')
  })

  it('calls addDoc with the correct payload on submit', async () => {
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => expect(screen.queryByText('Loading agents…')).not.toBeInTheDocument())
    await user.type(screen.getByLabelText('Title'), 'Bank Job')
    await user.type(screen.getByLabelText('Description'), 'Steal the donuts')
    await user.click(screen.getByRole('button', { name: 'Create Heist' }))
    await waitFor(() => expect(mockAddDoc).toHaveBeenCalledTimes(1))
    const payload = mockAddDoc.mock.calls[0][1]
    expect(payload).toMatchObject({
      title: 'Bank Job',
      description: 'Steal the donuts',
      createdBy: 'user-1',
      createdByCodename: 'ShadowFox',
      assignedTo: 'user-2',
      assignedToCodename: 'IronGhost',
      finalStatus: null,
    })
    expect(payload.createdAt).toBeDefined()
    expect(payload.deadline).toBeDefined()
  })

  it('redirects to /heists on successful submit', async () => {
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => expect(screen.queryByText('Loading agents…')).not.toBeInTheDocument())
    await user.type(screen.getByLabelText('Title'), 'Bank Job')
    await user.type(screen.getByLabelText('Description'), 'Steal the donuts')
    await user.click(screen.getByRole('button', { name: 'Create Heist' }))
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/heists'))
  })

  it('disables submit button and shows "Creating…" during submission', async () => {
    mockAddDoc.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => expect(screen.queryByText('Loading agents…')).not.toBeInTheDocument())
    await user.type(screen.getByLabelText('Title'), 'Bank Job')
    await user.type(screen.getByLabelText('Description'), 'Steal the donuts')
    await user.click(screen.getByRole('button', { name: 'Create Heist' }))
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled()
  })

  it('shows an inline error when addDoc rejects', async () => {
    mockAddDoc.mockRejectedValue(new Error('Firestore error'))
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => expect(screen.queryByText('Loading agents…')).not.toBeInTheDocument())
    await user.type(screen.getByLabelText('Title'), 'Bank Job')
    await user.type(screen.getByLabelText('Description'), 'Steal the donuts')
    await user.click(screen.getByRole('button', { name: 'Create Heist' }))
    await waitFor(() =>
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    )
  })

  it('preserves form field values after a write failure', async () => {
    mockAddDoc.mockRejectedValue(new Error('Firestore error'))
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => expect(screen.queryByText('Loading agents…')).not.toBeInTheDocument())
    await user.type(screen.getByLabelText('Title'), 'Bank Job')
    await user.type(screen.getByLabelText('Description'), 'Steal the donuts')
    await user.click(screen.getByRole('button', { name: 'Create Heist' }))
    await waitFor(() =>
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    )
    expect(screen.getByLabelText('Title')).toHaveValue('Bank Job')
    expect(screen.getByLabelText('Description')).toHaveValue('Steal the donuts')
  })

  it('clicking Cancel navigates to /heists without calling addDoc', async () => {
    const user = userEvent.setup()
    render(<CreateHeistForm />)
    await waitFor(() => expect(screen.queryByText('Loading agents…')).not.toBeInTheDocument())
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockPush).toHaveBeenCalledWith('/heists')
    expect(mockAddDoc).not.toHaveBeenCalled()
  })

  it('submit button is disabled while users are loading', () => {
    mockGetDocs.mockReturnValue(new Promise(() => {}))
    render(<CreateHeistForm />)
    expect(screen.getByRole('button', { name: 'Create Heist' })).toBeDisabled()
  })
})
