import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import ProductSearchBox from "@modules/store/components/product-search-box"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = ({
  sortBy,
  page,
  query,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  query?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const searchQuery = query?.trim() || ""

  return (
    <div className="bg-[#fbfcf8]">
      <div
        className="content-container flex flex-col py-8 small:flex-row small:items-start small:gap-8"
        data-testid="category-container"
      >
        <RefinementList sortBy={sort} />
        <div className="w-full">
          <div className="mb-8 rounded-rounded border border-[#dce8d5] bg-white p-6">
            <p className="text-small-semi uppercase text-[#5d7f2f]">
              FreshMart shelves
            </p>
            <h1
              className="mt-2 text-3xl-semi text-[#18310f]"
              data-testid="store-page-title"
            >
              All groceries
            </h1>
            <p className="mt-2 max-w-2xl text-base-regular text-[#65715f]">
              Browse fresh produce, pantry essentials, organic picks, and
              everyday household staples from your Medusa catalog.
            </p>
            <ProductSearchBox
              className="mt-5 max-w-xl px-4 py-3"
              placeholder="Search by product, category, or collection"
            />
          </div>
          <Suspense
            fallback={<SkeletonProductGrid />}
            key={`${sort}-${pageNumber}-${searchQuery}`}
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              searchQuery={searchQuery}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
