import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductPreview from "@modules/products/components/product-preview"

type FreshMartHomeProps = {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

type Shelf = {
  eyebrow: string
  title: string
  description: string
  products: HttpTypes.StoreProduct[]
  href?: string
}

const categoryShelfConfig = [
  {
    title: "Fresh Fruits",
    category: "fruits",
    description: "Seasonal fruit picks from your live FreshMart catalog.",
  },
  {
    title: "Fresh Vegetables",
    category: "vegetables",
    description: "Daily cooking essentials and market-fresh vegetables.",
  },
  {
    title: "Dairy Products",
    category: "dairy",
    description: "Milk, butter, cheese, yogurt, and chilled dairy staples.",
  },
  {
    title: "Bakery",
    category: "bakery",
    description: "Fresh breads and bakery treats from your Medusa catalog.",
  },
  {
    title: "Household Essentials",
    category: "household essentials",
    description: "Home care basics for weekly grocery runs.",
  },
]

const collectionShelfConfig = [
  {
    title: "Best Sellers",
    collection: "best sellers",
    description: "Customer favorites shoppers keep adding to cart.",
  },
  {
    title: "Weekly Offers",
    collection: "weekly offers",
    description: "Dynamic deal shelves powered by Admin collections.",
  },
  {
    title: "Organic Products",
    collection: "organic products",
    description: "Clean, wholesome grocery choices in one quick shelf.",
  },
  {
    title: "Trending Products",
    collection: "new arrivals",
    description: "Freshly added and fast-moving grocery products.",
  },
]

export default function FreshMartHome({
  categories,
  collections,
  products,
  region,
}: FreshMartHomeProps) {
  const topCategories = categories
    .filter((category) => !category.parent_category)
    .slice(0, 10)

  const categoryShelves = categoryShelfConfig.map((shelf) => ({
    eyebrow: "Shop by category",
    title: shelf.title,
    description: shelf.description,
    products: productsByCategory(products, shelf.category).slice(0, 4),
    href: categoryHref(categories, shelf.category),
  }))

  const collectionShelves = collectionShelfConfig.map((shelf, index) => {
    const matchingProducts = productsByCollection(products, shelf.collection)
    const fallbackProducts = products.slice(index * 4, index * 4 + 4)

    return {
      eyebrow: "FreshMart shelf",
      title: shelf.title,
      description: shelf.description,
      products: (matchingProducts.length ? matchingProducts : fallbackProducts).slice(
        0,
        4
      ),
      href: collectionHref(collections, shelf.collection),
    }
  })

  const shelves: Shelf[] = [
    collectionShelves[0],
    collectionShelves[1],
    categoryShelves[0],
    categoryShelves[1],
    categoryShelves[2],
    categoryShelves[3],
    categoryShelves[4],
    collectionShelves[2],
    collectionShelves[3],
  ]

  const topBrandNames = getTopBrandNames(products, collections, categories)

  return (
    <div className="bg-[#fbfcf8]">
      <CategorySection categories={topCategories} />

      <section className="content-container py-6">
        <div className="grid gap-4 small:grid-cols-3">
          {[
            {
              title: "Superfast grocery runs",
              copy: "Find everyday essentials, fresh produce, and home care in a few taps.",
            },
            {
              title: "Live prices from Medusa",
              copy: "Every product card uses backend prices, collections, and catalog data.",
            },
            {
              title: "Checkout stays native",
              copy: "FreshMart styling sits on top of the existing cart and checkout flow.",
            },
          ].map((item) => (
            <article
              className="rounded-rounded border border-[#dce8d5] bg-white p-5 shadow-sm"
              key={item.title}
            >
              <p className="text-small-semi uppercase text-[#5d7f2f]">
                FreshMart promise
              </p>
              <h3 className="mt-2 text-xl-semi text-[#18310f]">{item.title}</h3>
              <p className="mt-2 text-base-regular text-[#65715f]">
                {item.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      {shelves.map((shelf) => (
        <ProductSection key={shelf.title} {...shelf} region={region} />
      ))}

      <TopBrands names={topBrandNames} />
      <WhyChooseFreshMart />
      <CustomerReviews />
      <NewsletterSection />
    </div>
  )
}

function productsByCategory(
  products: HttpTypes.StoreProduct[],
  categoryName: string
) {
  const normalizedCategory = normalize(categoryName)

  return products.filter((product) =>
    product.categories?.some(
      (category) => normalize(category.name) === normalizedCategory
    )
  )
}

function productsByCollection(
  products: HttpTypes.StoreProduct[],
  collectionTitle: string
) {
  const normalizedCollection = normalize(collectionTitle)

  return products.filter(
    (product) => normalize(product.collection?.title) === normalizedCollection
  )
}

function categoryHref(
  categories: HttpTypes.StoreProductCategory[],
  categoryName: string
) {
  const category = categories.find(
    (item) => normalize(item.name) === normalize(categoryName)
  )

  return category?.handle ? `/categories/${category.handle}` : "/store"
}

function collectionHref(
  collections: HttpTypes.StoreCollection[],
  collectionTitle: string
) {
  const collection = collections.find(
    (item) => normalize(item.title) === normalize(collectionTitle)
  )

  return collection?.handle ? `/collections/${collection.handle}` : "/store"
}

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() || ""
}

function getTopBrandNames(
  products: HttpTypes.StoreProduct[],
  collections: HttpTypes.StoreCollection[],
  categories: HttpTypes.StoreProductCategory[]
) {
  const metadataBrands = products
    .map((product) => product.metadata?.brand)
    .filter((brand): brand is string => typeof brand === "string" && !!brand)

  if (metadataBrands.length) {
    return Array.from(new Set(metadataBrands)).slice(0, 8)
  }

  if (collections.length) {
    return collections.map((collection) => collection.title).slice(0, 8)
  }

  return categories
    .filter((category) => !category.parent_category)
    .map((category) => category.name)
    .slice(0, 8)
}

function CategorySection({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) {
  return (
    <section className="content-container py-14">
      <div className="mb-8 flex flex-col gap-3 small:flex-row small:items-end small:justify-between">
        <div>
          <p className="text-small-semi uppercase text-[#5d7f2f]">
            Shop by category
          </p>
          <h2 className="mt-2 text-3xl-semi text-[#18310f]">
            Browse grocery aisles
          </h2>
        </div>
        <LocalizedClientLink
          href="/store"
          className="text-base-semi text-[#2f6b1f] hover:text-[#18310f]"
        >
          Browse all products
        </LocalizedClientLink>
      </div>
      {categories.length ? (
        <div className="grid grid-cols-2 gap-4 small:grid-cols-3 medium:grid-cols-5">
          {categories.map((category) => (
            <LocalizedClientLink
              href={`/categories/${category.handle}`}
              key={category.id}
              className="group overflow-hidden rounded-rounded border border-[#dce8d5] bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#9ec479] hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f3f8ed]">
                <Image
                  alt={category.name}
                  className="object-cover transition duration-300 group-hover:scale-105"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  src={getCategoryImage(category.name)}
                />
                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/25 to-transparent" />
              </div>
              <div className="p-4">
                <p className="text-base-semi text-[#18310f]">{category.name}</p>
                <p className="mt-1 text-small-regular text-[#65715f]">
                  {category.products?.length ?? 0} products
                </p>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      ) : (
        <EmptySection
          title="No categories yet"
          description="Create categories in Medusa Admin and they will appear here."
        />
      )}
    </section>
  )
}

const categoryImageMap: Record<string, string> = {
  fruits: "/images/grocery/pomegranate.png",
  vegetables: "/images/grocery/tomato.png",
  dairy: "/images/grocery/milk.png",
  bakery: "/images/grocery/bread.png",
  beverages: "/images/grocery/orange.png",
  snacks: "/images/grocery/chips.png",
  "rice & grains": "/images/grocery/rice.png",
  "rice and grains": "/images/grocery/rice.png",
  "personal care": "/images/grocery/shampoo.png",
  "household essentials": "/images/grocery/dishwashing-liquid.png",
  "cooking oil": "/images/grocery/sunflower-oil.png",
}

const fallbackCategoryImage = "/images/grocery/apple.png"

function getCategoryImage(categoryName: string) {
  const normalizedName = categoryName.trim().toLowerCase()
  return categoryImageMap[normalizedName] || fallbackCategoryImage
}

function ProductSection({
  eyebrow,
  title,
  description,
  products,
  region,
  href = "/store",
}: Shelf & {
  region: HttpTypes.StoreRegion
}) {
  if (!products.length) {
    return (
      <section className="content-container py-10">
        <EmptySection
          eyebrow={eyebrow}
          title={title}
          description="Products will appear here when matching Medusa catalog data exists."
        />
      </section>
    )
  }

  return (
    <section className="content-container py-10">
      <div className="mb-8 flex flex-col gap-3 small:flex-row small:items-end small:justify-between">
        <div>
          <p className="text-small-semi uppercase text-[#5d7f2f]">{eyebrow}</p>
          <h2 className="mt-2 text-3xl-semi text-[#18310f]">{title}</h2>
          <p className="mt-2 max-w-2xl text-base-regular text-[#65715f]">
            {description}
          </p>
        </div>
        <LocalizedClientLink
          href={href}
          className="text-base-semi text-[#2f6b1f] hover:text-[#18310f]"
        >
          View all
        </LocalizedClientLink>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 small:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </section>
  )
}

function TopBrands({ names }: { names: string[] }) {
  if (!names.length) {
    return null
  }

  return (
    <section className="content-container py-10">
      <div className="mb-8">
        <p className="text-small-semi uppercase text-[#5d7f2f]">Top brands</p>
        <h2 className="mt-2 text-3xl-semi text-[#18310f]">
          Popular FreshMart shelves
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 small:grid-cols-4">
        {names.map((name) => (
          <div
            className="rounded-rounded border border-[#dce8d5] bg-white p-5 text-center shadow-sm"
            key={name}
          >
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-circle bg-[#f3f8ed] text-xl-semi text-[#2f6b1f]">
              {name.slice(0, 1)}
            </div>
            <p className="text-base-semi text-[#18310f]">{name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function WhyChooseFreshMart() {
  return (
    <section className="content-container py-10">
      <div className="rounded-rounded border border-[#dce8d5] bg-[#18310f] p-6 text-white small:p-10">
        <p className="text-small-semi uppercase text-[#cde8ba]">
          Why choose FreshMart
        </p>
        <h2 className="mt-2 text-3xl-semi">Made for everyday grocery runs</h2>
        <div className="mt-8 grid gap-5 small:grid-cols-4">
          {[
            ["Fresh catalog", "Products, prices, and availability come from Medusa."],
            ["Fast discovery", "Search, categories, and shelves help shoppers move quickly."],
            ["Secure buying", "Existing cart, checkout, payment, and orders stay intact."],
            ["Mobile ready", "Dense grocery layouts stay easy to scan on every screen."],
          ].map(([title, copy]) => (
            <article className="border-l border-white/20 pl-4" key={title}>
              <h3 className="text-large-semi">{title}</h3>
              <p className="mt-2 text-base-regular text-[#dcebd3]">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function CustomerReviews() {
  return (
    <section className="content-container py-10">
      <div className="mb-8">
        <p className="text-small-semi uppercase text-[#5d7f2f]">
          Customer reviews
        </p>
        <h2 className="mt-2 text-3xl-semi text-[#18310f]">
          Grocery shopping that feels quick and calm
        </h2>
      </div>
      <div className="grid gap-4 small:grid-cols-3">
        {[
          [
            "The shelves are easy to scan and checkout feels familiar.",
            "FreshMart shopper",
          ],
          [
            "I can find dairy, bakery, produce, and home essentials quickly.",
            "Weekly buyer",
          ],
          [
            "Search makes reordering everyday groceries much faster.",
            "Local customer",
          ],
        ].map(([quote, name]) => (
          <article
            className="rounded-rounded border border-[#dce8d5] bg-white p-5 shadow-sm"
            key={quote}
          >
            <p className="text-large-semi text-[#f2b84b]">★★★★★</p>
            <p className="mt-3 text-base-regular text-[#35452d]">"{quote}"</p>
            <p className="mt-4 text-small-semi text-[#18310f]">{name}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function NewsletterSection() {
  return (
    <section className="content-container py-14">
      <div className="grid gap-6 rounded-rounded border border-[#dce8d5] bg-white p-6 small:grid-cols-[1fr_360px] small:p-10">
        <div>
          <p className="text-small-semi uppercase text-[#5d7f2f]">
            FreshMart newsletter
          </p>
          <h2 className="mt-3 text-3xl-semi text-[#18310f]">
            Get weekly grocery updates
          </h2>
          <p className="mt-3 max-w-2xl text-base-regular text-[#65715f]">
            Seasonal picks, new arrivals, and FreshMart offers delivered to your
            inbox.
          </p>
        </div>
        <form className="flex flex-col gap-3 self-end">
          <input
            aria-label="Email address"
            className="h-12 rounded-rounded border border-[#dce8d5] bg-[#f7faf5] px-4 text-base-regular text-[#18310f] outline-none"
            placeholder="Email address"
            type="email"
          />
          <button
            className="h-12 rounded-rounded bg-[#2f6b1f] px-5 text-base-semi text-white transition hover:bg-[#18310f]"
            type="button"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}

function EmptySection({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description: string
}) {
  return (
    <div className="rounded-rounded border border-dashed border-[#c8d9bd] bg-white p-8 text-center">
      {eyebrow && (
        <p className="text-small-semi uppercase text-[#5d7f2f]">{eyebrow}</p>
      )}
      <h2 className="mt-2 text-2xl-semi text-[#18310f]">{title}</h2>
      <p className="mt-2 text-base-regular text-[#65715f]">{description}</p>
    </div>
  )
}
