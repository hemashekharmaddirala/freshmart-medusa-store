import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { REVIEW_MODULE } from "../../../modules/review"
import ReviewModuleService from "../../../modules/review/service"
import {
  hasVerifiedPurchase,
  requireCustomerId,
  resolveCustomerName,
  validateReviewInput,
} from "../../reviews/utils"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const body = req.body as { product_id?: unknown }
  const productId =
    typeof body.product_id === "string" ? body.product_id.trim() : ""

  if (!productId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Product ID is required."
    )
  }

  const customerId = requireCustomerId(req)
  const reviewInput = validateReviewInput(req.body)
  const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

  const review = await reviewService.createCustomerReview({
    product_id: productId,
    customer_id: customerId,
    customer_name: await resolveCustomerName(req, customerId),
    verified_purchase: await hasVerifiedPurchase(req, productId, customerId),
    ...reviewInput,
  })

  res.status(201).json({
    review,
  })
}
