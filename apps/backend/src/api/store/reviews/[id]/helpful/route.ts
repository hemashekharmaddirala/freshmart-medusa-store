import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../../../modules/review"
import ReviewModuleService from "../../../../../modules/review/service"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const review = await reviewService.markHelpful(req.params.id)

  res.json({
    review,
  })
}
