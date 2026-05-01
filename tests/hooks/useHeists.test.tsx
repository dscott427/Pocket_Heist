import { renderHook, act } from '@testing-library/react'
import { vi, beforeEach, describe, it, expect } from 'vitest'
import { useHeists } from '@/lib/useHeists'

const mockUseAuth = vi.fn()
const mockOnSnapshot = vi.fn()
const mockQuery = vi.fn()
const mockWhere = vi.fn()

let mockWithConverter: ReturnType<typeof vi.fn>
let mockCollectionRef: { withConverter: ReturnType<typeof vi.fn> }

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('@/lib/firebase', () => ({
  db: {},
}))

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => mockCollectionRef),
  query: (...args: unknown[]) => mockQuery(...args),
  where: (...args: unknown[]) => mockWhere(...args),
  onSnapshot: (...args: unknown[]) => mockOnSnapshot(...args),
}))

const defaultUser = { uid: 'user-1' }

function makeHeist(overrides = {}) {
  return {
    id: 'heist-1',
    title: 'Bank Job',
    description: 'desc',
    createdBy: 'user-1',
    createdByCodename: 'Fox',
    assignedTo: 'user-2',
    assignedToCodename: 'Wolf',
    createdAt: new Date(),
    deadline: new Date(),
    finalStatus: null,
    ...overrides,
  }
}

function makeSnapshot(docs: object[]) {
  return {
    docs: docs.map((d) => ({ data: () => d })),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockWithConverter = vi.fn()
  mockCollectionRef = { withConverter: mockWithConverter }
  mockWithConverter.mockReturnValue(mockCollectionRef)
  mockUseAuth.mockReturnValue({ user: defaultUser })
  mockQuery.mockImplementation((...args) => ({ _query: args }))
  mockWhere.mockImplementation((...args) => ({ _where: args }))
  mockOnSnapshot.mockImplementation((_q, onNext, _onError) => {
    return vi.fn()
  })
})

describe('useHeists', () => {
  it('returns empty array and loading false without calling onSnapshot when user is null', () => {
    mockUseAuth.mockReturnValue({ user: null })
    const { result } = renderHook(() => useHeists('active'))
    expect(result.current.heists).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(mockOnSnapshot).not.toHaveBeenCalled()
  })

  it('calls onSnapshot with assignedTo == uid and deadline > Date for active mode', () => {
    renderHook(() => useHeists('active'))
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)
    expect(mockWhere).toHaveBeenCalledWith('assignedTo', '==', 'user-1')
    expect(mockWhere).toHaveBeenCalledWith('deadline', '>', expect.any(Date))
  })

  it('calls onSnapshot with createdBy == uid and deadline > Date for assigned mode', () => {
    renderHook(() => useHeists('assigned'))
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)
    expect(mockWhere).toHaveBeenCalledWith('createdBy', '==', 'user-1')
    expect(mockWhere).toHaveBeenCalledWith('deadline', '>', expect.any(Date))
  })

  it('calls onSnapshot with finalStatus in success/failure for expired mode', () => {
    renderHook(() => useHeists('expired'))
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)
    expect(mockWhere).toHaveBeenCalledWith('finalStatus', 'in', ['success', 'failure'])
    expect(mockWhere).not.toHaveBeenCalledWith('assignedTo', expect.anything(), expect.anything())
    expect(mockWhere).not.toHaveBeenCalledWith('createdBy', expect.anything(), expect.anything())
  })

  it('returns mapped Heist array from snapshot data', () => {
    const heist = makeHeist()
    mockOnSnapshot.mockImplementation((_q, onNext) => {
      onNext(makeSnapshot([heist]))
      return vi.fn()
    })
    const { result } = renderHook(() => useHeists('active'))
    expect(result.current.heists).toEqual([heist])
  })

  it('loading is true before first snapshot and false after', () => {
    let capturedOnNext: ((snap: object) => void) | null = null
    mockOnSnapshot.mockImplementation((_q, onNext) => {
      capturedOnNext = onNext
      return vi.fn()
    })
    const { result } = renderHook(() => useHeists('active'))
    expect(result.current.loading).toBe(true)
    act(() => {
      capturedOnNext!(makeSnapshot([]))
    })
    expect(result.current.loading).toBe(false)
  })

  it('calls unsubscribe on unmount', () => {
    const mockUnsub = vi.fn()
    mockOnSnapshot.mockReturnValue(mockUnsub)
    const { unmount } = renderHook(() => useHeists('active'))
    unmount()
    expect(mockUnsub).toHaveBeenCalledTimes(1)
  })

  it('calls old unsubscribe and new onSnapshot when mode changes', () => {
    const mockUnsub1 = vi.fn()
    const mockUnsub2 = vi.fn()
    mockOnSnapshot
      .mockReturnValueOnce(mockUnsub1)
      .mockReturnValueOnce(mockUnsub2)
    const { rerender } = renderHook((mode: 'active' | 'assigned' | 'expired') => useHeists(mode), {
      initialProps: 'active' as const,
    })
    expect(mockOnSnapshot).toHaveBeenCalledTimes(1)
    rerender('assigned')
    expect(mockUnsub1).toHaveBeenCalledTimes(1)
    expect(mockOnSnapshot).toHaveBeenCalledTimes(2)
  })

  it('returns all resolved heists from snapshot for expired mode', () => {
    const success = makeHeist({ finalStatus: 'success' })
    const failure = makeHeist({ id: 'heist-2', finalStatus: 'failure' })
    mockOnSnapshot.mockImplementation((_q, onNext) => {
      onNext(makeSnapshot([success, failure]))
      return vi.fn()
    })
    const { result } = renderHook(() => useHeists('expired'))
    expect(result.current.heists).toHaveLength(2)
  })
})
