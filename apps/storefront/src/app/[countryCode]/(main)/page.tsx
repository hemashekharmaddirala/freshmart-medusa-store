import { Metadata } from "next"

import FreshMartHome from "@modules/home/components/freshmart-home"
import Hero from "@modules/home/components/hero"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "FreshMart | Premium Grocery Delivery",
  description:
    "Shop fresh produce, pantry staples, organic groceries, and weekly offers from FreshMart.",
}

export const dynamic = "force-dynamic"

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })
  const categories = await listCategories()

  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: {
      limit: 100,
    },
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero
        categories={categories}
        collections={collections}
        products={products}
      />
      <FreshMartHome
        categories={categories}
        collections={collections}
        products={products}
        region={region}
      />
    </>
  )
}
