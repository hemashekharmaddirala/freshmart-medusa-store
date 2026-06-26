import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import ProductSearchBox from "@modules/store/components/product-search-box"

type HeroProps = {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
  products: HttpTypes.StoreProduct[]
}

const Hero = ({ categories, collections, products }: HeroProps) => {
  const heroProducts = products.slice(0, 4)
  const statItems = [
    {
      value: `${products.length}+`,
      label: "catalog items",
    },
    {
      value: `${
        categories.filter((category) => !category.parent_category).length
      }+`,
      label: "shop aisles",
    },
    {
      value: `${collections.length}+`,
      label: "curated shelves",
    },
  ]

  return (
    <section className="relative overflow-hidden bg-[#f4f8ec]">
      <div className="content-container grid items-center gap-8 py-10 small:min-h-[560px] small:grid-cols-[1.04fr_0.96fr] small:gap-10 small:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 inline-flex rounded-full border border-[#b8d6a1] bg-white px-4 py-2 text-small-semi uppercase text-[#2f6b1f] shadow-sm">
            Fresh groceries delivered daily
          </p>
          <Heading
            level="h1"
            className="text-[42px] font-semibold leading-[48px] text-[#18310f] small:text-[62px] small:leading-[68px]"
          >
            FreshMart
          </Heading>
          <p className="mt-4 max-w-2xl text-large-regular text-[#4f6048]">
            Premium grocery shopping powered by your existing Medusa catalog,
            prices, inventory, cart, checkout, and fulfillment flow.
          </p>
          <ProductSearchBox
            className="mt-7 w-full max-w-2xl bg-white p-2 shadow-sm"
            inputClassName="h-12 rounded-rounded border border-transparent px-4 focus:border-[#9ec479]"
            placeholder="Search by product, category, or collection"
            showButton
          />
          <div className="mt-7 grid grid-cols-3 gap-4 text-[#18310f]">
            {statItems.map((item) => (
              <div key={item.label}>
                <p className="text-2xl-semi">{item.value}</p>
                <p className="text-small-regular text-[#65715f]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[360px] small:min-h-[480px]">
          <div className="absolute inset-0 rounded-[32px] bg-[#d7ff8f]" />
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[32px] border border-[#e6f1d9] bg-white/40" />
          <div className="absolute left-4 right-4 top-4 rounded-[28px] bg-white p-4 shadow-[0_24px_80px_rgba(24,49,15,0.16)] small:left-8 small:right-0 small:top-8">
            <div className="mb-4 rounded-[20px] border border-[#dce8d5] bg-[#f8fbf4] px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[#9ec479] hover:shadow-md">
              <p className="text-small-semi uppercase tracking-[0.12em] text-[#2f6b1f]">
                Free Delivery in 30 Minutes
              </p>
              <p className="mt-1 text-small-regular text-[#5d6a58]">
                Groceries, pantry staples, and fresh essentials delivered fast
                to customers nearby.
              </p>
            </div>
            {heroProducts.length ? (
              <div className="grid grid-cols-2 gap-3">
                {heroProducts.map((product) => (
                  <LocalizedClientLink
                    className="rounded-rounded border border-[#e0ead9] bg-[#fbfcf8] p-3 shadow-sm transition hover:-translate-y-1 hover:border-[#9ec479] hover:shadow-md"
                    href={`/products/${product.handle}`}
                    key={product.id}
                  >
                    <Thumbnail
                      thumbnail={product.thumbnail}
                      images={product.images}
                      productTitle={product.title}
                      size="square"
                      className="mb-3"
                    />
                    <p className="line-clamp-1 text-base-semi text-[#18310f]">
                      {product.title}
                    </p>
                    {product.collection && (
                      <p className="line-clamp-1 text-small-regular text-[#65715f]">
                        {product.collection.title}
                      </p>
                    )}
                  </LocalizedClientLink>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-rounded border border-dashed border-[#c8d9bd] bg-[#fbfcf8] p-6 text-center">
                <p className="text-small-semi uppercase text-[#5d7f2f]">
                  Empty catalog
                </p>
                <p className="mt-2 text-2xl-semi text-[#18310f]">
                  Add products in Medusa Admin
                </p>
                <p className="mt-2 max-w-sm text-base-regular text-[#65715f]">
                  FreshMart will display your products here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
