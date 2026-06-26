import http from "node:http"
import https from "node:https"
import { NextResponse } from "next/server"

/**
 * Node.js proxy route for /store/regions.
 *
 * Uses raw http.request with a singleton keep-alive Agent instead of fetch/undici.
 * This guarantees TCP connection reuse to port 9000, preventing Windows
 * TIME_WAIT port exhaustion (which manifests as EADDRINUSE on connect).
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? ""

// Singleton agents — created once per server process lifetime
const httpAgent = new http.Agent({ keepAlive: true, keepAliveMsecs: 30_000, maxSockets: 10 })
const httpsAgent = new https.Agent({ keepAlive: true, keepAliveMsecs: 30_000, maxSockets: 10 })

function rawRequest(url: string, headers: Record<string, string>): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const isHttps = parsed.protocol === "https:"
    const agent = isHttps ? httpsAgent : httpAgent
    const lib = isHttps ? https : http

    const req = lib.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || (isHttps ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: "GET",
        headers,
        agent,
      },
      (res) => {
        let body = ""
        res.on("data", (chunk: Buffer) => { body += chunk.toString() })
        res.on("end", () => resolve({ status: res.statusCode ?? 0, body }))
        res.on("error", reject)
      }
    )

    req.on("error", reject)
    req.end()
  })
}

export async function GET() {
  try {
    const { status, body } = await rawRequest(`${BACKEND_URL}/store/regions`, {
      "x-publishable-api-key": PUBLISHABLE_API_KEY,
      accept: "application/json",
    })

    if (status < 200 || status >= 300) {
      console.error(`[/api/regions] backend returned ${status}`)
      return NextResponse.json({ error: `Backend returned ${status}` }, { status })
    }

    const data = JSON.parse(body)
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch (err) {
    console.error("[/api/regions] request failed:", err)
    return NextResponse.json({ error: "request failed" }, { status: 502 })
  }
}
