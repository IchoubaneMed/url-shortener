import type { UrlMapping } from "../types/url"


interface Props {
  url: UrlMapping
}


export default function ShortUrlResult({
  url,
}: Props) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      url.short_url
    )
  }

  return (
    <section>
      <h2>Your shortened URL</h2>

      <a
        href={url.short_url}
        target="_blank"
        rel="noreferrer"
      >
        {url.short_url}
      </a>

      <button onClick={handleCopy}>
        Copy
      </button>
    </section>
  )
}