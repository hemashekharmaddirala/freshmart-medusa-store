import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import Review from "./models/review"

type ReviewStatus = "pending" | "approved" | "rejected"

type ReviewDTO = {
  id: string
  product_id: string
  customer_id: string
  customer_name: string
  rating: number
  title: string
  comment: string
  verified_purchase: boolean
  helpful_count: number
  status: ReviewStatus
  created_at: Date
  updated_at: Date
}

type ReviewSummary = {
  average_rating: number
  review_count: number
  distribution: Record<1 | 2 | 3 | 4 | 5, { count: number; percentage: number }>
}

class ReviewModuleService extends MedusaService({
  Review,
}) {
  async getProductSummary(productId: string): Promise<ReviewSummary> {
    const reviews = (await this.listReviews({
      product_id: productId,
      status: "approved",
    })) as ReviewDTO[]

    return calculateSummary(reviews)
  }

  async listProductReviews({
    productId,
    limit = 10,
    offset = 0,
    status = "approved",
  }: {
    productId: string
    limit?: number
    offset?: number
    status?: ReviewStatus
  }) {
    const [reviews, count] = (await this.listAndCountReviews(
      {
        product_id: productId,
        status,
      },
      {
        take: limit,
        skip: offset,
        order: {
          created_at: "DESC",
        },
      }
    )) as [ReviewDTO[], number]

    return {
      reviews,
      count,
      summary: calculateSummary(
        (await this.listReviews({
          product_id: productId,
          status: "approved",
        })) as ReviewDTO[]
      ),
    }
  }

  async retrieveCustomerProductReview(productId: string, customerId: string) {
    const reviews = (await this.listReviews({
      product_id: productId,
      customer_id: customerId,
    })) as ReviewDTO[]

    return reviews[0] || null
  }

  async createCustomerReview(input: {
    product_id: string
    customer_id: string
    customer_name: string
    rating: number
    title: string
    comment: string
    verified_purchase: boolean
  }) {
    const existingReview = await this.retrieveCustomerProductReview(
      input.product_id,
      input.customer_id
    )

    if (existingReview) {
      throw new MedusaError(
        MedusaError.Types.DUPLICATE_ERROR,
        "You have already reviewed this product."
      )
    }

    return this.createReviews({
      ...input,
      status: "pending",
      helpful_count: 0,
    }) as Promise<ReviewDTO>
  }

  async updateCustomerReview(input: {
    review_id: string
    customer_id: string
    rating: number
    title: string
    comment: string
  }) {
    const review = (await this.retrieveReview(input.review_id)) as ReviewDTO

    if (review.customer_id !== input.customer_id) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "You can only edit your own review."
      )
    }

    return this.updateReviews({
      id: input.review_id,
      rating: input.rating,
      title: input.title,
      comment: input.comment,
      status: "pending",
    }) as Promise<ReviewDTO>
  }

  async deleteCustomerReview(reviewId: string, customerId: string) {
    const review = (await this.retrieveReview(reviewId)) as ReviewDTO

    if (review.customer_id !== customerId) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "You can only delete your own review."
      )
    }

    await this.deleteReviews(reviewId)
  }

  async markHelpful(reviewId: string) {
    const review = (await this.retrieveReview(reviewId)) as ReviewDTO

    return this.updateReviews({
      id: reviewId,
      helpful_count: review.helpful_count + 1,
    }) as Promise<ReviewDTO>
  }
}

const calculateSummary = (reviews: ReviewDTO[]): ReviewSummary => {
  const reviewCount = reviews.length
  const counts = reviews.reduce(
    (acc, review) => {
      const rating = Math.min(Math.max(Math.round(review.rating), 1), 5) as
        | 1
        | 2
        | 3
        | 4
        | 5

      acc[rating] += 1

      return acc
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<1 | 2 | 3 | 4 | 5, number>
  )

  const averageRating = reviewCount
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0

  return {
    average_rating: Number(averageRating.toFixed(1)),
    review_count: reviewCount,
    distribution: {
      5: buildDistributionItem(counts[5], reviewCount),
      4: buildDistributionItem(counts[4], reviewCount),
      3: buildDistributionItem(counts[3], reviewCount),
      2: buildDistributionItem(counts[2], reviewCount),
      1: buildDistributionItem(counts[1], reviewCount),
    },
  }
}

const buildDistributionItem = (count: number, total: number) => ({
  count,
  percentage: total ? Math.round((count / total) * 100) : 0,
})

export default ReviewModuleService
export type { ReviewDTO, ReviewStatus, ReviewSummary }
