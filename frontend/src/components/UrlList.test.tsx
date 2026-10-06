import {
    render,
    screen,
    waitFor,
  } from "@testing-library/react"
  
  import {
    MemoryRouter,
  } from "react-router-dom"
  
  import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
  } from "vitest"
  
  import { getUrls } from "../api/urls"
  import UrlList from "./UrlList"
  
  
  vi.mock("../api/urls", () => ({
    getUrls: vi.fn(),
  }))
  
  
  describe("UrlList", () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })
  
    it("displays shortened URLs", async () => {
      vi.mocked(
        getUrls
      ).mockResolvedValue({
        count: 1,
        next: null,
        previous: null,
  
        results: [
          {
            short_code: "abc",
            short_url:
              "http://localhost:8000/abc",
            original_url:
              "https://example.com",
            created_at:
              "2026-10-06T10:00:00Z",
          },
        ],
      })
  
      render(
        <MemoryRouter>
          <UrlList />
        </MemoryRouter>
      )
  
      await waitFor(() => {
        expect(
          screen.getByText(
            "https://example.com"
          )
        ).toBeInTheDocument()
      })
  
      expect(
        screen.getByText(
          "View analytics"
        )
      ).toBeInTheDocument()
    })
  })