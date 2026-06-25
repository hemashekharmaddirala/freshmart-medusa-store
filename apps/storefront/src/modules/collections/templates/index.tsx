import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="bg-[#fbfcf8]">
      <div className="content-container flex flex-col py-8 small:flex-row small:items-start small:gap-8">
        <RefinementList sortBy={sort} />
        <div className="w-full">
          <div className="mb-8 rounded-rounded border border-[#dce8d5] bg-white p-6">
            <p className="text-small-semi uppercase text-[#5d7f2f]">
              FreshMart collection
            </p>
            <h1 className="mt-2 text-3xl-semi text-[#18310f]">
              {collection.title}
            </h1>
          </div>
          <Suspense
            fallback={
              <SkeletonProductGrid
                numberOfProducts={collection.products?.length}
              />
            }
          >
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              collectionId={collection.id}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
