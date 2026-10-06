import {
    fireEvent,
    render,
    screen,
    waitFor,
  } from "@testing-library/react"
  
  import { beforeEach, describe, expect, it, vi } from "vitest"
  
  import { createShortUrl } from "../api/urls"
  import UrlForm from "./UrlForm"
  
  
  vi.mock("../api/urls", () => ({
    createShortUrl: vi.fn(),
  }))
  
  
  describe("UrlForm", () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })
  
    it("creates a shortened URL", async () => {
      vi.mocked(
        createShortUrl
      ).mockResolvedValue({
        short_code: "abc",
        short_url:
          "http://localhost:8000/abc",
        original_url:
          "https://example.com",
        created_at:
          "2026-10-06T10:00:00Z",
      })
  
      const onCreated = vi.fn()
  
      render(
        <UrlForm
          onCreated={onCreated}
        />
      )
  
      fireEvent.change(
        screen.getByLabelText("URL"),
        {
          target: {
            value:
              "https://example.com",
          },
        },
      )
  
      fireEvent.click(
        screen.getByRole(
          "button",
          {
            name: "Shorten URL",
          },
        )
      )
  
      await waitFor(() => {
        expect(
          createShortUrl
        ).toHaveBeenCalledWith({
          original_url:
            "https://example.com",
        })
      })
  
      expect(
        onCreated
      ).toHaveBeenCalledOnce()
    })
  })