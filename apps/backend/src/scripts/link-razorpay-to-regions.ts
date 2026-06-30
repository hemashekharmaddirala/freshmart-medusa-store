import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"
import { IPaymentModuleService } from "@medusajs/framework/types"

export const CHECKOUT_PAYMENT_PROVIDERS = [
  "pp_system_default",
  "pp_razorpay_razorpay",
] as const

export async function linkCheckoutPaymentProvidersToRegions(
  container: MedusaContainer
) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const paymentModule = container.resolve<IPaymentModuleService>(
    Modules.PAYMENT
  )

  const registeredProviders = await paymentModule.listPaymentProviders({})
  const registeredIds = registeredProviders.map((provider) => provider.id)

  const missingProviders = CHECKOUT_PAYMENT_PROVIDERS.filter(
    (id) => !registeredIds.includes(id)
  )

  if (missingProviders.length) {
    throw new Error(
      `Missing payment providers: ${missingProviders.join(", ")}. ` +
        `Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in apps/backend/.env, then restart the backend.`
    )
  }

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  })

  for (const region of regions) {
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          payment_providers: [...CHECKOUT_PAYMENT_PROVIDERS],
        },
      },
    })

    logger.info(
      `Linked ${CHECKOUT_PAYMENT_PROVIDERS.join(", ")} to region "${region.name}".`
    )
  }
}

/**
 * Links COD + Razorpay to every region.
 * Run: npx medusa exec ./src/scripts/link-razorpay-to-regions.ts
 */
export default async function linkRazorpayToRegions({
  container,
}: {
  container: MedusaContainer
}) {
  await linkCheckoutPaymentProvidersToRegions(container)
}
