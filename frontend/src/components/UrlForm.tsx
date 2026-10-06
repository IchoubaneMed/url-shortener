import { useState } from "react"
import type { ComponentProps } from "react"

import { createShortUrl } from "../api/urls"
import type { UrlMapping } from "../types/url"


interface Props {
  onCreated: (url: UrlMapping) => void
}

type FormSubmitHandler = NonNullable<
  ComponentProps<"form">["onSubmit"]
>


export default function UrlForm({
  onCreated,
}: Props) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault()

    const trimmedUrl = url.trim()

    if (!trimmedUrl) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await createShortUrl({
        original_url: trimmedUrl,
      })

      onCreated(result)

      setUrl("")
    } catch {
      setError("Unable to shorten this URL.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="url">
          URL
        </label>

        <input
          id="url"
          name="url"
          type="url"
          value={url}
          placeholder="https://example.com"
          onChange={(event) => {
            setUrl(event.target.value)
          }}
          disabled={loading}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Shortening..."
          : "Shorten URL"}
      </button>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}
    </form>
  )
}