import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "dk"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: 0,
}

/**
 * In-flight promise deduplication.
 * On Windows, the Next.js Edge sandbox can open dozens of simultaneous TCP
 * connections to localhost:9000, exhausting the TIME_WAIT port pool and
 * triggering EADDRINUSE errors. By sharing a single in-flight promise, only
 * ONE fetch fires no matter how many concurrent requests arrive.
 *
 * The fetch itself goes to /api/regions — a Node.js route in the same process
 * that uses undici's keep-alive Agent, so TCP connections to port 9000 are
 * reused rather than opened fresh on every request.
 */
let regionFetchPromise: Promise<Map<string, HttpTypes.StoreRegion>> | null =
  null

async function fetchAndPopulateRegionMap(
  selfOrigin: string
): Promise<Map<string, HttpTypes.StoreRegion>> {
  try {
    const response = await fetch(`${selfOrigin}/api/regions`, {
      method: "GET",
      // 60-second Next.js cache so repeated cold-starts don't hammer the backend
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      console.error(
        `Middleware.ts: /api/regions returned ${response.status}`
      )
      return regionMapCache.regionMap
    }

    const json = await response.json().catch((error: unknown) => {
      console.error("Middleware.ts: Error parsing regions response.", error)
      return null
    })

    if (!json?.regions?.length) {
      return regionMapCache.regionMap
    }

    json.regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
    return regionMapCache.regionMap
  } catch (error) {
    console.error("Middleware.ts: Error fetching regions.", error)
    return regionMapCache.regionMap
  } finally {
    // Always clear the in-flight promise so the next stale check can retry
    regionFetchPromise = null
  }
}

async function getRegionMap(
  selfOrigin: string
): Promise<Map<string, HttpTypes.StoreRegion>> {
  const isCacheStale =
    !regionMapCache.regionMap.size ||
    regionMapCache.regionMapUpdated < Date.now() - 3600 * 1000

  if (!isCacheStale) {
    return regionMapCache.regionMap
  }

  // Deduplicate: if a fetch is already in flight, reuse it
  if (!regionFetchPromise) {
    regionFetchPromise = fetchAndPopulateRegionMap(selfOrigin)
  }

  return regionFetchPromise
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  let countryCode

  const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

  // Cloudflare Workers provides country via request.cf.country
  const cloudflareCountryCode = (
    request as { cf?: { country?: string } }
  ).cf?.country?.toLowerCase()

  // Vercel provides x-vercel-ip-country header
  const vercelCountryCode = request.headers
    .get("x-vercel-ip-country")
    ?.toLowerCase()

  if (urlCountryCode && regionMap.has(urlCountryCode)) {
    countryCode = urlCountryCode
  } else if (cloudflareCountryCode && regionMap.has(cloudflareCountryCode)) {
    countryCode = cloudflareCountryCode
  } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
    countryCode = vercelCountryCode
  } else if (regionMap.has(DEFAULT_REGION)) {
    countryCode = DEFAULT_REGION
  } else if (regionMap.keys().next().value) {
    countryCode = regionMap.keys().next().value
  }

  return countryCode
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  try {
    if (request.nextUrl.pathname.includes(".")) {
      return NextResponse.next()
    }

    // Derive the storefront's own origin so we can call /api/regions on ourselves
    const selfOrigin = request.nextUrl.origin

    const cacheIdCookie = request.cookies.get("_medusa_cache_id")
    const cacheId = cacheIdCookie?.value || crypto.randomUUID()

    const regionMap = await getRegionMap(selfOrigin)
    const countryCode = await getCountryCode(request, regionMap)

    // if the country code is available, use it, otherwise use the default region
    const country = countryCode || DEFAULT_REGION
    const firstPathSegment = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
    const urlHasCountry = firstPathSegment === country.toLowerCase()

    if (urlHasCountry) {
      if (!cacheIdCookie) {
        const response = NextResponse.next()
        response.cookies.set("_medusa_cache_id", cacheId, {
          maxAge: 60 * 60 * 24,
        })
        return response
      }
      return NextResponse.next()
    }

    // if the url doesn't have the country, redirect to it
    const redirectPath =
      request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
    const queryString = request.nextUrl.search || ""
    const redirectUrl = `${request.nextUrl.origin}/${country}${redirectPath}${queryString}`

    return NextResponse.redirect(redirectUrl, 307)
  } catch (error) {
    console.error("Middleware.ts: Continuing without region redirect.", error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
