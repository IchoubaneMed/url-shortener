export interface CreateUrlRequest {
    original_url: string
  }
  
  export interface UrlMapping {
    short_code: string
    short_url: string
    original_url: string
    created_at: string
  }
  
  export interface Analytics {
    short_code: string
    click_count: number
    last_accessed: string | null
  }
  
  export interface PaginatedUrls {
    count: number
    next: string | null
    previous: string | null
    results: UrlMapping[]
  }