import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { REVIEW_MODULE } from "../../../../modules/review"
import ReviewModuleService, {
  ReviewStatus,
} from "../../../../modules/review/service"

export async function PUT(req: MedusaRequest, res: MedusaResponse) {
  const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const status = normalizeStatus((req.body as { status?: unknown }).status)

  if (!status) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Status must be pending, approved, or rejected."
    )
  }

  const review = await reviewService.updateReviews({
    id: req.params.id,
    status,
  })

  res.json({
    review,
  })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)

  await reviewService.deleteReviews(req.params.id)

  res.status(200).json({
    id: req.params.id,
    deleted: true,
  })
}

const normalizeStatus = (status: unknown): ReviewStatus | undefined => {
  if (status === "pending" || status === "approved" || status === "rejected") {
    return status
  }

  return undefined
}
