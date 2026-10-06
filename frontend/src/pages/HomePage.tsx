import { useState } from "react"

import UrlForm from "../components/UrlForm"
import ShortUrlResult from "../components/ShortUrlResult"

import type { UrlMapping } from "../types/url"


export default function HomePage() {
  const [createdUrl, setCreatedUrl] =
    useState<UrlMapping | null>(null)

  return (
    <main>
      <h1>URL Shortener</h1>

      <p>
        Turn long URLs into short,
        shareable links.
      </p>

      <UrlForm
        onCreated={setCreatedUrl}
      />

      {createdUrl && (
        <ShortUrlResult
          url={createdUrl}
        />
      )}
    </main>
  )
}