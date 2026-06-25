import { model } from "@medusajs/framework/utils"

const Review = model.define(
  {
    name: "review",
    tableName: "freshmart_review",
  },
  {
    id: model.id({ prefix: "rev" }).primaryKey(),
    product_id: model.text().index("IDX_REVIEW_PRODUCT_ID"),
    customer_id: model.text().index("IDX_REVIEW_CUSTOMER_ID"),
    customer_name: model.text(),
    rating: model.number(),
    title: model.text(),
    comment: model.text(),
    verified_purchase: model.boolean().default(false),
    helpful_count: model.number().default(0),
    status: model.enum(["pending", "approved", "rejected"]).default("pending"),
  }
)

export default Review
