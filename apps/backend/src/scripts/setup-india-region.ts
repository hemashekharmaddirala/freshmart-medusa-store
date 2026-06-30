import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createRegionsWorkflow } from "@medusajs/medusa/core-flows"

import { linkCheckoutPaymentProvidersToRegions } from "./link-razorpay-to-regions"

/**
 * Ensures an India region (INR) exists with COD + Razorpay payment providers.
 * Run on existing databases: npx medusa exec ./src/scripts/setup-india-region.ts
 */
export default async function setupIndiaRegion({
  container,
}: {
  container: MedusaContainer
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code", "countries.iso_2"],
  })

  const indiaRegion = existingRegions.find((region) =>
    region.countries?.some(
      (country) => country?.iso_2?.toLowerCase() === "in"
    )
  )

  if (indiaRegion?.currency_code?.toLowerCase() === "inr") {
    logger.info(
      `India region already configured with INR (region: ${indiaRegion.name}). Linking payment providers...`
    )
    await linkCheckoutPaymentProvidersToRegions(container)
    return
  }

  if (indiaRegion) {
    logger.warn(
      `India is in region "${indiaRegion.name}" with currency ${indiaRegion.currency_code}. ` +
        `For Razorpay UPI, create a dedicated India region with INR in Medusa Admin ` +
        `(Settings → Regions) and move India into it.`
    )
    return
  }

  const { result } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "India",
          currency_code: "inr",
          countries: ["in"],
          payment_providers: ["pp_system_default", "pp_razorpay_razorpay"],
        },
      ],
    },
  })

  logger.info(`Created India region (${result[0].id}) with INR currency.`)
  logger.info(
    "Link this region to your stock location and shipping options in Medusa Admin."
  )
}
