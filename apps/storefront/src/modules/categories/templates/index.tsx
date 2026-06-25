import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <div className="bg-[#fbfcf8]">
      <div
        className="content-container flex flex-col py-8 small:flex-row small:items-start small:gap-8"
        data-testid="category-container"
      >
        <RefinementList sortBy={sort} data-testid="sort-by-container" />
        <div className="w-full">
          <div className="mb-8 rounded-rounded border border-[#dce8d5] bg-white p-6">
            <div className="mb-3 flex flex-wrap gap-2 text-small-semi text-[#5d7f2f]">
              {parents &&
                parents.map((parent) => (
                  <span key={parent.id}>
                    <LocalizedClientLink
                      className="hover:text-[#18310f]"
                      href={`/categories/${parent.handle}`}
                      data-testid="sort-by-link"
                    >
                      {parent.name}
                    </LocalizedClientLink>
                    <span className="mx-2 text-[#9eb493]">/</span>
                  </span>
                ))}
            </div>
            <h1
              className="text-3xl-semi text-[#18310f]"
              data-testid="category-page-title"
            >
              {category.name}
            </h1>
        {category.description && (
          <div className="mt-2 max-w-2xl text-base-regular text-[#65715f]">
            <p>{category.description}</p>
          </div>
        )}
        {category.category_children && (
          <div className="mt-5 text-base-large">
            <ul className="flex flex-wrap gap-2">
              {category.category_children?.map((c) => (
                <li key={c.id}>
                  <InteractiveLink href={`/categories/${c.handle}`}>
                    {c.name}
                  </InteractiveLink>
                </li>
              ))}
            </ul>
          </div>
        )}
          </div>
        <Suspense
          fallback={
            <SkeletonProductGrid
              numberOfProducts={category.products?.length ?? 8}
            />
          }
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
        </div>
      </div>
    </div>
  )
}
