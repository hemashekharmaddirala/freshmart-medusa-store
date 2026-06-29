"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

export const listRegions = async () => {
  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      cache: "no-store",
    })
    .then(({ regions }) => regions)
    .catch((error) => {
      console.error("Failed to fetch regions:", error)
      return []
    })
}

export const retrieveRegion = async (id: string) => {
  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      cache: "no-store",
    })
    .then(({ region }) => region)
    .catch((error) => {
      console.error(`Failed to fetch region ${id}:`, error)
      return null
    })
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  const normalizedCountryCode = countryCode?.trim().toLowerCase()

  if (regionMap.has(normalizedCountryCode)) {
    return regionMap.get(normalizedCountryCode)
  }

  const regions = await listRegions()

  if (!regions.length) {
    return null
  }

  regionMap.clear()

  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      const iso2 = c?.iso_2?.trim().toLowerCase()

      if (iso2) {
        regionMap.set(iso2, region)
      }
    })
  })

  const region = normalizedCountryCode
    ? regionMap.get(normalizedCountryCode)
    : regionMap.get("us")

  return region
}
