import { Text } from "@modules/common/components/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import WishlistButton from "@modules/wishlist/components/wishlist-button"

export default async function ProductPreview({
  product,
  isFeatured,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })
  const productContext =
    product.categories?.[0]?.name || product.collection?.title || ""

  return (
    <div
      className="group h-full rounded-rounded border border-[#dce8d5] bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#9ec479] hover:shadow-md"
      data-testid="product-wrapper"
    >
      <div className="relative">
        {isFeatured && (
          <span className="absolute left-3 top-3 z-10 rounded-circle bg-[#d7ff8f] px-3 py-1 text-small-semi text-[#18310f]">
            Fresh pick
          </span>
        )}
        <WishlistButton productId={product.id} productTitle={product.title} />
      </div>
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          productTitle={product.title}
          size="full"
          isFeatured={isFeatured}
        />
      </LocalizedClientLink>
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <div className="mt-4 flex min-h-[88px] flex-col justify-between gap-4">
          <div>
            <Text
              className="line-clamp-2 text-base-semi text-[#18310f]"
              data-testid="product-title"
            >
              {product.title}
            </Text>
            {productContext && (
              <Text className="mt-1 text-small-regular text-[#65715f]">
                {productContext}
              </Text>
            )}
          </div>
          <div className="flex items-center justify-between gap-x-2">
            <div className="flex items-center gap-x-2 text-[#2f6b1f]">
              {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
            </div>
            <span className="rounded-rounded bg-[#2f6b1f] px-3 py-2 text-small-semi text-white">
              Add
            </span>
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  )
}
