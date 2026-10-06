import {
    render,
    screen,
  } from "@testing-library/react"
  
  import {
    describe,
    expect,
    it,
  } from "vitest"
  
  import ShortUrlResult from "./ShortUrlResult"
  
  
  describe("ShortUrlResult", () => {
    it("displays the shortened URL", () => {
      render(
        <ShortUrlResult
          url={{
            short_code: "abc",
            short_url:
              "http://localhost:8000/abc",
            original_url:
              "https://example.com",
            created_at:
              "2026-10-06T10:00:00Z",
          }}
        />
      )
  
      expect(
        screen.getByRole(
          "link",
          {
            name:
              "http://localhost:8000/abc",
          },
        )
      ).toBeInTheDocument()
    })
  })