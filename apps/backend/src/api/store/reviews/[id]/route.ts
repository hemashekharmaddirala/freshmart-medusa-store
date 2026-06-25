import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../../modules/review"
import ReviewModuleService from "../../../../modules/review/service"
import { requireCustomerId, validateReviewInput } from "../../../reviews/utils"

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const customerId = requireCustomerId(req)
  const reviewInput = validateReviewInput(req.body)
  const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

  const review = await reviewService.updateCustomerReview({
    review_id: req.params.id,
    customer_id: customerId,
    ...reviewInput,
  })

  res.json({
    review,
  })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const customerId = requireCustomerId(req)
  const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

  await reviewService.deleteCustomerReview(req.params.id, customerId)

  res.status(200).json({
    id: req.params.id,
    deleted: true,
  })
}
