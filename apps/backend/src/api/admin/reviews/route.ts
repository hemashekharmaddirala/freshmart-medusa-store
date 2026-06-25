import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REVIEW_MODULE } from "../../../modules/review"
import ReviewModuleService, {
  ReviewStatus,
} from "../../../modules/review/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const reviewService: ReviewModuleService = req.scope.resolve(REVIEW_MODULE)
  const limit = Math.min(Number(req.query.limit || 20), 100)
  const offset = Math.max(Number(req.query.offset || 0), 0)
  const search = typeof req.query.q === "string" ? req.query.q.trim() : ""
  const productId =
    typeof req.query.product_id === "string" ? req.query.product_id : undefined
  const status = normalizeStatus(req.query.status)
  const rating = req.query.rating ? Number(req.query.rating) : undefined

  const [allReviews] = await reviewService.listAndCountReviews(
    {
      ...(productId ? { product_id: productId } : {}),
      ...(status ? { status } : {}),
      ...(rating ? { rating } : {}),
    },
    {
      order: {
        created_at: "DESC",
      },
    }
  )

  const searchedReviews = search
    ? allReviews.filter((review) =>
        [
          review.product_id,
          review.customer_name,
          review.title,
          review.comment,
          review.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : allReviews

  res.json({
    reviews: searchedReviews.slice(offset, offset + limit),
    count: searchedReviews.length,
    limit,
    offset,
  })
}

const normalizeStatus = (status: unknown): ReviewStatus | undefined => {
  if (status === "pending" || status === "approved" || status === "rejected") {
    return status
  }

  return undefined
}
