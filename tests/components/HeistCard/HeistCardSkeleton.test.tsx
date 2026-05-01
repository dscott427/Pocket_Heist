import { render, screen } from '@testing-library/react'
import { HeistCardSkeleton } from '@/components/HeistCard'

describe('HeistCardSkeleton', () => {
  it('renders without throwing', () => {
    expect(() => render(<HeistCardSkeleton />)).not.toThrow()
  })

  it('does not render any link', () => {
    render(<HeistCardSkeleton />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('does not render any heist text content', () => {
    const { container } = render(<HeistCardSkeleton />)
    expect(container.textContent).toBe('')
  })

  it('renders shimmer bars', () => {
    const { container } = render(<HeistCardSkeleton />)
    const bars = container.querySelectorAll('[class*="skeletonBar"]')
    expect(bars.length).toBeGreaterThanOrEqual(4)
  })
})
