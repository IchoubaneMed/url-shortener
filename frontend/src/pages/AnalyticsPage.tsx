import {
    useEffect,
    useState,
  } from "react"
  
  import { useParams } from "react-router-dom"
  
  import { getAnalytics } from "../api/urls"
  import type { Analytics } from "../types/url"
  
  
  export default function AnalyticsPage() {
    const { shortCode } = useParams()
  
    const [analytics, setAnalytics] =
      useState<Analytics | null>(null)
  
    const [loading, setLoading] =
      useState(true)
  
    const [error, setError] =
      useState<string | null>(null)
  
    useEffect(() => {
      if (!shortCode) {
        return
      }
  
      async function loadAnalytics() {
        try {
          const data =
            await getAnalytics(
              shortCode!
            )
  
          setAnalytics(data)
        } catch {
          setError(
            "Unable to load analytics."
          )
        } finally {
          setLoading(false)
        }
      }
  
      loadAnalytics()
    }, [shortCode])
  
    if (loading) {
      return <p>Loading...</p>
    }
  
    if (error) {
      return <p>{error}</p>
    }
  
    if (!analytics) {
      return null
    }
  
    return (
      <main>
        <h1>Link Analytics</h1>
  
        <p>
          Short code:
          {" "}
          {analytics.short_code}
        </p>
  
        <h2>
          {analytics.click_count}
        </h2>
  
        <p>Total clicks</p>
  
        <p>
          Last accessed:
          {" "}
          {analytics.last_accessed
            ? new Date(
                analytics.last_accessed
              ).toLocaleString()
            : "Never"}
        </p>
      </main>
    )
  }