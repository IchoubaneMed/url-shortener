import { apiClient } from "./client"

import type {
  Analytics,
  CreateUrlRequest,
  PaginatedUrls,
  UrlMapping,
} from "../types/url"


export async function createShortUrl(
  payload: CreateUrlRequest,
): Promise<UrlMapping> {
  const { data } =
    await apiClient.post<UrlMapping>(
      "/api/v1/urls/",
      payload,
    )

  return data
}


export async function getUrls(
  page = 1,
): Promise<PaginatedUrls> {
  const { data } =
    await apiClient.get<PaginatedUrls>(
      "/api/v1/urls/",
      {
        params: {
          page,
        },
      },
    )

  return data
}


export async function getAnalytics(
  shortCode: string,
): Promise<Analytics> {
  const { data } =
    await apiClient.get<Analytics>(
      `/api/v1/urls/${shortCode}/analytics/`,
    )

  return data
}