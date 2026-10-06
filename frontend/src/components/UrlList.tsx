import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { getUrls } from "../api/urls"
import type { UrlMapping } from "../types/url"


export default function UrlList() {
  const [urls, setUrls] = useState<UrlMapping[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadUrls() {
      try {
        const data = await getUrls()

        setUrls(data.results)
      } catch {
        setError("Unable to load URLs.")
      } finally {
        setLoading(false)
      }
    }

    loadUrls()
  }, [])

  if (loading) {
    return <p>Loading URLs...</p>
  }

  if (error) {
    return <p role="alert">{error}</p>
  }

  if (urls.length === 0) {
    return <p>No shortened URLs yet.</p>
  }

  return (
    <section>
      <h2>Recent Links</h2>

      <ul>
        {urls.map((url) => (
          <li key={url.short_code}>
            <div>
              <a
                href={url.short_url}
                target="_blank"
                rel="noreferrer"
              >
                {url.short_url}
              </a>
            </div>

            <div>
              {url.original_url}
            </div>

            <div>
              <Link
                to={`/analytics/${url.short_code}`}
              >
                View analytics
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}