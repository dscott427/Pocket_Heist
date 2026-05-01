import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import Navbar from "@/components/Navbar"

const mockSignOut = vi.fn()
const mockPush = vi.fn()

vi.mock("@/lib/AuthContext", () => ({
  useAuth: () => ({ signOut: mockSignOut }),
}))

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
}))

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the main heading", () => {
    render(<Navbar />)
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
  })

  it("renders the Create New Heist link", () => {
    render(<Navbar />)
    const link = screen.getByRole("link", { name: /create new heist/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/heists/create")
  })

  it("renders a Sign Out button", () => {
    render(<Navbar />)
    expect(screen.getByRole("button", { name: /sign out/i })).toBeInTheDocument()
  })

  it("clicking Sign Out calls signOut and navigates to /login", async () => {
    mockSignOut.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()
    render(<Navbar />)
    await user.click(screen.getByRole("button", { name: /sign out/i }))
    expect(mockSignOut).toHaveBeenCalled()
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/login"))
  })
})
