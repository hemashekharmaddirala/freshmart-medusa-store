import { listProducts } from "@lib/data/products"
import WishlistTemplate from "@modules/wishlist/templates"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wishlist | FreshMart",
  description: "View your saved FreshMart grocery products.",
}

export const dynamic = "force-dynamic"

type WishlistPageProps = {
  params: Promise<{
    countryCode: string
  }>
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { countryCode } = await params

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: 1000,
    },
  })

  return <WishlistTemplate products={products} />
}
