import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import HeistCard from '@/components/HeistCard'
import { Heist } from '@/types/firestore/heist'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function makeHeist(overrides: Partial<Heist> = {}): Heist {
  return {
    id: 'heist-1',
    title: 'Bank Job',
    description: 'Steal the stapler',
    createdBy: 'user-1',
    createdByCodename: 'Fox',
    assignedTo: 'user-2',
    assignedToCodename: 'Wolf',
    createdAt: new Date('2025-01-01'),
    deadline: new Date(Date.now() + 86400000), // tomorrow
    finalStatus: null,
    ...overrides,
  }
}

describe('HeistCard', () => {
  it('renders the heist title', () => {
    render(<HeistCard heist={makeHeist()} status="Active" />)
    expect(screen.getByText('Bank Job')).toBeInTheDocument()
  })

  it('renders a link to /heists/:id', () => {
    render(<HeistCard heist={makeHeist()} status="Active" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/heists/heist-1')
  })

  it('wraps the entire card in the heist link', () => {
    render(<HeistCard heist={makeHeist()} status="Active" />)
    expect(screen.getByRole('link')).toHaveTextContent('Bank Job')
  })

  it('renders @assignedToCodename', () => {
    render(<HeistCard heist={makeHeist()} status="Active" />)
    expect(screen.getByText(/@Wolf/)).toBeInTheDocument()
  })

  it('renders @createdByCodename', () => {
    render(<HeistCard heist={makeHeist()} status="Active" />)
    expect(screen.getByText(/@Fox/)).toBeInTheDocument()
  })

  it('renders the formatted deadline', () => {
    render(<HeistCard heist={makeHeist()} status="Active" />)
    expect(screen.getByText(/AM|PM/)).toBeInTheDocument()
  })

  it('shows Overdue when deadline is in the past', () => {
    const heist = makeHeist({ deadline: new Date('2020-01-01') })
    render(<HeistCard heist={heist} status="Active" />)
    expect(screen.getByText(/Overdue/)).toBeInTheDocument()
  })

  it('does not show Overdue when deadline is in the future', () => {
    render(<HeistCard heist={makeHeist()} status="Active" />)
    expect(screen.queryByText(/Overdue/)).toBeNull()
  })
})
