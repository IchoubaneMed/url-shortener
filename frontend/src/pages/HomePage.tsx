import { useState } from "react"

import ShortUrlResult from "../components/ShortUrlResult"
import UrlForm from "../components/UrlForm"
import UrlList from "../components/UrlList"

import type { UrlMapping } from "../types/url"


export default function HomePage() {
  const [createdUrl, setCreatedUrl] =
    useState<UrlMapping | null>(null)

  return (
    <main className="app-container">
      <header className="hero">
        <h1>URL Shortener</h1>

        <p>
          Create short links and track
          their usage.
        </p>
      </header>

      <section className="card">
        <UrlForm
          onCreated={setCreatedUrl}
        />
      </section>

      {createdUrl && (
        <section className="card">
          <ShortUrlResult
            url={createdUrl}
          />
        </section>
      )}

      <section className="card">
        <UrlList />
      </section>
    </main>
  )
}