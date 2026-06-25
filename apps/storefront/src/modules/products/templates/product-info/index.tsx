import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  return (
    <div id="product-info">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {product.collection && (
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="text-small-semi uppercase text-[#5d7f2f] hover:text-[#18310f]"
          >
            {product.collection.title}
          </LocalizedClientLink>
        )}
        <Heading
          level="h2"
          className="text-3xl-semi text-[#18310f]"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        <Text
          className="text-base-regular text-[#65715f] whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description ||
            "A FreshMart grocery essential selected for everyday quality and convenience."}
        </Text>
        <div className="grid grid-cols-2 gap-3 text-small-regular text-[#35452d]">
          <span className="rounded-rounded bg-[#f3f8ed] px-3 py-2">
            Quality checked
          </span>
          <span className="rounded-rounded bg-[#f3f8ed] px-3 py-2">
            Fresh delivery
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProductInfo
