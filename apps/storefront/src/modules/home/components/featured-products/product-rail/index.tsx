import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*images,*categories,*collection,+metadata,+tags,",
    },
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="content-container py-12">
      <div className="mb-8 flex flex-col gap-3 small:flex-row small:items-end small:justify-between">
        <div>
          <p className="text-small-semi uppercase text-[#5d7f2f]">
            Featured Products
          </p>
          <Text className="mt-2 text-3xl-semi text-[#18310f]">
            {collection.title}
          </Text>
        </div>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          View all
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-4">
        {pricedProducts &&
          pricedProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
