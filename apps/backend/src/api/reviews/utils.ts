import { MedusaRequest } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { getOrdersListWorkflow } from "@medusajs/core-flows"

type ReviewInput = {
  rating: number
  title: string
  comment: string
}

type CustomerNameInput = {
  first_name?: string
  last_name?: string
  email?: string
}

type RequestWithAuthContext = MedusaRequest & {
  auth_context?: {
    actor_id?: string
    actor_type?: string
    user_metadata?: Record<string, unknown>
  }
}

export const validateReviewInput = (body: unknown): ReviewInput => {
  const data = body as Partial<ReviewInput>
  const rating = Number(data.rating)
  const title = typeof data.title === "string" ? data.title.trim() : ""
  const comment = typeof data.comment === "string" ? data.comment.trim() : ""

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Rating must be between 1 and 5."
    )
  }

  if (!title) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Title is required.")
  }

  if (!comment) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Comment is required."
    )
  }

  if (comment.length > 1000) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Comment must be 1000 characters or fewer."
    )
  }

  return {
    rating,
    title,
    comment,
  }
}

export const requireCustomerId = (req: MedusaRequest) => {
  const authContext = (req as RequestWithAuthContext).auth_context
  const customerId = authContext?.actor_id

  if (!customerId || authContext?.actor_type !== "customer") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Please login to write a review."
    )
  }

  return customerId
}

export const resolveCustomerName = async (
  req: MedusaRequest,
  customerId: string
) => {
  const authContext = (req as RequestWithAuthContext).auth_context
  const metadata = authContext?.user_metadata as CustomerNameInput
  const metadataName = formatCustomerName(metadata)

  if (metadataName) {
    return metadataName
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    data: [customer],
  } = await query.graph({
    entity: "customer",
    fields: ["first_name", "last_name", "email"],
    filters: {
      id: customerId,
    },
  })

  return formatCustomerName(customer as CustomerNameInput) || "FreshMart customer"
}

export const hasVerifiedPurchase = async (
  req: MedusaRequest,
  productId: string,
  customerId: string
) => {
  const workflow = getOrdersListWorkflow(req.scope)

  const { result } = await workflow.run({
    input: {
      fields: ["id", "items.product_id", "items.product.id"],
      variables: {
        filters: {
          customer_id: customerId,
          is_draft_order: false,
        },
        take: 100,
        skip: 0,
      },
    },
  })

  const orders = Array.isArray(result) ? result : (result as any).rows

  return orders.some((order) =>
    order.items?.some(
      (item) => item.product_id === productId || item.product?.id === productId
    )
  )
}

const formatCustomerName = (customer?: CustomerNameInput | null) => {
  if (!customer) {
    return ""
  }

  const fullName = [customer.first_name, customer.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()

  return fullName || customer.email || ""
}
