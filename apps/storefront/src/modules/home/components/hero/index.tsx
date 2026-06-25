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
      <div className="content-container grid min-h-[620px] items-center gap-10 py-12 small:grid-cols-[1.05fr_0.95fr] small:py-20">
        <div className="relative z-10 max-w-3xl">
          <p className="mb-4 inline-flex rounded-circle border border-[#b8d6a1] bg-white px-4 py-2 text-small-semi uppercase text-[#2f6b1f]">
            Fresh groceries delivered daily
          </p>
          <Heading
            level="h1"
            className="text-[42px] leading-[48px] small:text-[64px] small:leading-[70px] font-semibold text-[#18310f]"
          >
            FreshMart
          </Heading>
          <p className="mt-5 max-w-2xl text-large-regular text-[#4f6048]">
            Premium grocery shopping powered by your existing Medusa catalog,
            prices, inventory, cart, checkout, and fulfillment flow.
          </p>
          <ProductSearchBox
            className="mt-8 w-full max-w-2xl bg-white p-2 shadow-sm"
            inputClassName="h-12 rounded-rounded border border-transparent px-4 focus:border-[#9ec479]"
            placeholder="Search by product, category, or collection"
            showButton
          />
          <div className="mt-8 grid grid-cols-3 gap-4 text-[#18310f]">
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
        <div className="relative min-h-[360px] small:min-h-[500px]">
          <div className="absolute inset-0 rounded-rounded bg-[#d7ff8f]" />
          <div className="absolute left-6 right-6 top-8 rounded-rounded bg-white p-5 shadow-xl small:left-12 small:right-0">
            {heroProducts.length ? (
              <div className="grid grid-cols-2 gap-3">
                {heroProducts.map((product) => (
                  <LocalizedClientLink
                    className="rounded-rounded border border-[#e0ead9] bg-[#fbfcf8] p-3 transition hover:border-[#9ec479]"
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
          <div className="absolute bottom-6 left-0 rounded-rounded bg-[#18310f] p-5 text-white shadow-xl small:bottom-12">
            <p className="text-small-semi uppercase text-[#d7ff8f]">
              Dynamic catalog
            </p>
            <p className="mt-1 text-2xl-semi">Admin powered</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
