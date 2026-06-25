import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../../../../modules/review"
import ReviewModuleService from "../../../../../../modules/review/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const summary = await reviewService.getProductSummary(req.params.product_id)

  res.json({
    summary,
  })
}
