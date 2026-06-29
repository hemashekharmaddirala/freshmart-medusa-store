"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

export const retrieveCollection = async (id: string) => {
  return await sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        cache: "no-store",
      }
    )
    .then(({ collection }) => collection)
    .catch((error) => {
      console.error(`Failed to fetch collection ${id}:`, error)
      return null
    })
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return await sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: queryParams,
        cache: "no-store",
      }
    )
    .then(({ collections }) => ({ collections, count: collections.length }))
    .catch((error) => {
      console.error("Failed to fetch collections:", error)
      return { collections: [], count: 0 }
    })
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection | null> => {
  return await sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "*products" },
      cache: "no-store",
    })
    .then(({ collections }) => collections[0] || null)
    .catch((error) => {
      console.error(`Failed to fetch collection ${handle}:`, error)
      return null
    })
}
