"use client"

import { addToCart } from "@lib/data/cart"
import { useWishlist } from "@lib/context/wishlist-context"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { Button, Text, clx } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { useParams, useRouter } from "next/navigation"
import { useMemo, useState } from "react"

type WishlistTemplateProps = {
  products: HttpTypes.StoreProduct[]
}

const WishlistTemplate = ({ products }: WishlistTemplateProps) => {
  const { wishlistIds, clearWishlist } = useWishlist()

  const wishlistProducts = useMemo(() => {
    const productById = new Map(products.map((product) => [product.id, product]))

    return wishlistIds
      .map((productId) => productById.get(productId))
      .filter((product): product is HttpTypes.StoreProduct => Boolean(product))
  }, [products, wishlistIds])

  if (!wishlistProducts.length) {
    return <WishlistEmptyState />
  }

  return (
    <div className="content-container py-10 small:py-14">
      <div className="mb-8 flex flex-col gap-4 small:flex-row small:items-end small:justify-between">
        <div>
          <p className="text-small-semi uppercase tracking-[0.12em] text-[#2f6b1f]">
            Saved groceries
          </p>
          <h1 className="mt-2 text-3xl-semi text-[#18310f]">
            Your FreshMart wishlist
          </h1>
          <Text className="mt-2 max-w-2xl text-[#65715f]">
            Keep your favorite grocery picks ready for the next basket.
          </Text>
        </div>
        <button
          type="button"
          className="self-start rounded-rounded border border-[#dce8d5] px-4 py-2 text-small-semi text-[#4f6048] transition hover:border-[#2f6b1f] hover:text-[#18310f]"
          onClick={clearWishlist}
        >
          Clear wishlist
        </button>
      </div>

      <ul className="grid w-full grid-cols-1 gap-5 small:grid-cols-2 medium:grid-cols-3 large:grid-cols-4">
        {wishlistProducts.map((product) => (
          <li key={product.id}>
            <WishlistProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}

const WishlistProductCard = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const { removeFromWishlist } = useWishlist()
  const { cheapestPrice } = getProductPrice({ product })
  const category = product.categories?.[0]?.name || product.collection?.title
  const selectedVariant = getDefaultVariant(product)
  const inStock = isVariantInStock(selectedVariant)
  const countryCode = useParams().countryCode as string
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      return
    }

    setIsAdding(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })
      router.refresh()
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <article className="h-full rounded-rounded border border-[#dce8d5] bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#9ec479] hover:shadow-md">
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          productTitle={product.title}
          size="full"
        />
      </LocalizedClientLink>

      <div className="mt-4 flex min-h-[176px] flex-col justify-between gap-4">
        <div>
          <LocalizedClientLink href={`/products/${product.handle}`}>
            <h2 className="line-clamp-2 text-base-semi text-[#18310f]">
              {product.title}
            </h2>
          </LocalizedClientLink>
          {category && (
            <Text className="mt-1 text-small-regular text-[#65715f]">
              {category}
            </Text>
          )}
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-base-semi text-[#2f6b1f]">
              {cheapestPrice?.calculated_price || "Price unavailable"}
            </span>
            <span
              className={clx(
                "rounded-circle px-3 py-1 text-small-semi",
                inStock
                  ? "bg-[#eef7e9] text-[#2f6b1f]"
                  : "bg-[#fff1f1] text-[#b42318]"
              )}
            >
              {inStock ? "In stock" : "Out of stock"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button
            className="h-10 w-full bg-[#2f6b1f] text-white hover:bg-[#265519]"
            disabled={!inStock || !selectedVariant?.id || isAdding}
            isLoading={isAdding}
            onClick={handleAddToCart}
          >
            {inStock ? "Add to Cart" : "Out of stock"}
          </Button>
          <button
            type="button"
            className="h-10 rounded-md border border-[#dce8d5] text-small-semi text-[#4f6048] transition hover:border-[#2f6b1f] hover:text-[#18310f]"
            onClick={() => removeFromWishlist(product.id)}
          >
            Remove from Wishlist
          </button>
        </div>
      </div>
    </article>
  )
}

const WishlistEmptyState = () => {
  return (
    <div className="content-container py-16 small:py-24">
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-rounded border border-[#dce8d5] bg-[#f7fbf3] px-6 py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-circle bg-white text-4xl text-[#d92d55] shadow-sm">
          {"\u2665"}
        </div>
        <h1 className="mt-6 text-2xl-semi text-[#18310f]">
          {"\u2665"} Your wishlist is empty
        </h1>
        <Text className="mt-3 text-[#65715f]">
          Save groceries you love and they will stay here after refresh.
        </Text>
        <LocalizedClientLink href="/store" className="mt-6">
          <Button className="bg-[#2f6b1f] text-white hover:bg-[#265519]">
            Browse Products
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

const getDefaultVariant = (product: HttpTypes.StoreProduct) => {
  return (
    product.variants?.find((variant) => isVariantInStock(variant)) ||
    product.variants?.[0]
  )
}

const isVariantInStock = (variant?: HttpTypes.StoreProductVariant) => {
  if (!variant) {
    return false
  }

  if (!variant.manage_inventory || variant.allow_backorder) {
    return true
  }

  return (variant.inventory_quantity || 0) > 0
}

export default WishlistTemplate
