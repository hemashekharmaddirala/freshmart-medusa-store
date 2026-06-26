import { MedusaContainer } from "@medusajs/framework"
import type { Knex } from "@medusajs/framework/mikro-orm/knex"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type ImageRow = {
  id: string
  url: string
}

type ProductRow = {
  id: string
  thumbnail: string | null
}

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "")

const normalizeUrl = (
  url: string | null | undefined,
  {
    backendUrl,
    storefrontUrl,
  }: {
    backendUrl: string
    storefrontUrl: string
  }
) => {
  if (!url) {
    return url
  }

  const trimmedUrl = url.trim()

  if (trimmedUrl.startsWith("/images/")) {
    return `${storefrontUrl}${trimmedUrl}`
  }

  const staticMatch = trimmedUrl.match(/^https?:\/\/localhost(?::\d+)?(\/static\/.+)$/)

  if (staticMatch) {
    return `${backendUrl}${staticMatch[1]}`
  }

  return trimmedUrl
}

export default async function repairProductImageUrls({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const db = container.resolve<Knex>(ContainerRegistrationKeys.PG_CONNECTION)

  const backendUrl = trimTrailingSlash(
    process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  )
  const storefrontUrl = trimTrailingSlash(
    process.env.FRESHMART_IMAGE_BASE_URL ||
      process.env.STOREFRONT_URL ||
      "http://localhost:8000"
  )

  const images = await db<ImageRow>("image")
    .select("id", "url")
    .whereNull("deleted_at")

  const products = await db<ProductRow>("product")
    .select("id", "thumbnail")
    .whereNull("deleted_at")
    .whereNotNull("thumbnail")

  let updatedImages = 0
  let updatedThumbnails = 0

  await db.transaction(async (trx) => {
    for (const image of images) {
      const normalizedUrl = normalizeUrl(image.url, { backendUrl, storefrontUrl })

      if (normalizedUrl && normalizedUrl !== image.url) {
        await trx("image")
          .where({ id: image.id })
          .update({ url: normalizedUrl, updated_at: trx.fn.now() })
        updatedImages += 1
      }
    }

    for (const product of products) {
      const normalizedThumbnail = normalizeUrl(product.thumbnail, {
        backendUrl,
        storefrontUrl,
      })

      if (normalizedThumbnail && normalizedThumbnail !== product.thumbnail) {
        await trx("product")
          .where({ id: product.id })
          .update({ thumbnail: normalizedThumbnail, updated_at: trx.fn.now() })
        updatedThumbnails += 1
      }
    }
  })

  logger.info(
    `Product media URL repair complete: ${updatedImages} image URLs and ${updatedThumbnails} thumbnails updated.`
  )
}
