import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../../../modules/review"
import ReviewModuleService from "../../../../../modules/review/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const limit = Math.min(Number(req.query.limit || 10), 50)
  const offset = Math.max(Number(req.query.offset || 0), 0)

  const result = await reviewService.listProductReviews({
    productId: req.params.product_id,
    limit,
    offset,
  })

  res.json({
    reviews: result.reviews,
    count: result.count,
    limit,
    offset,
    summary: result.summary,
  })
}
