import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

type ProductWithVariantPrices = {
  id: string
  title: string
  variants?: {
    id: string
    prices?: {
      amount: number
      currency_code: string
    }[]
  }[]
}

const INR_MULTIPLIER = 100

export default async function backfillInrPrices({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "variants.id",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
  })

  const productsToUpdate = (products as ProductWithVariantPrices[])
    .map((product) => {
      const variants = product.variants
        ?.map((variant) => {
          const prices = variant.prices ?? []

          if (prices.some((price) => price.currency_code === "inr")) {
            return null
          }

          const basePrice =
            prices.find((price) => price.currency_code === "eur") ??
            prices.find((price) => price.currency_code === "usd")

          if (!basePrice) {
            return null
          }

          return {
            id: variant.id,
            prices: [
              {
                amount: basePrice.amount * INR_MULTIPLIER,
                currency_code: "inr",
              },
            ],
          }
        })
        .filter(
          (variant): variant is { id: string; prices: { amount: number; currency_code: string }[] } =>
            Boolean(variant)
        )

      if (!variants?.length) {
        return null
      }

      return {
        id: product.id,
        variants,
      }
    })
    .filter(
      (product): product is { id: string; variants: { id: string; prices: { amount: number; currency_code: string }[] }[] } =>
        Boolean(product)
    )

  if (!productsToUpdate.length) {
    logger.info("All product variants already have INR prices.")
    return
  }

  await updateProductsWorkflow(container).run({
    input: {
      products: productsToUpdate,
    },
  })

  const variantCount = productsToUpdate.reduce(
    (count, product) => count + product.variants.length,
    0
  )

  logger.info(`Backfilled INR prices for ${variantCount} product variants.`)
}
