import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import ProductSearchBox from "@modules/store/components/product-search-box"
import WishlistNavLink from "@modules/wishlist/components/wishlist-nav-link"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="relative min-h-16 mx-auto border-b border-[#dce8d5] bg-white/95 backdrop-blur duration-200">
        <nav className="content-container text-small-regular text-[#4f6048] flex min-h-16 items-center justify-between gap-4 py-3">
          <div className="flex-1 basis-0 h-full flex items-center">
            <div className="h-full">
              <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
            </div>
          </div>

          <div className="flex items-center h-full gap-8">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2 text-xl-semi text-[#18310f]"
              data-testid="nav-store-link"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-circle bg-[#2f6b1f] text-white">
                F
              </span>
              FreshMart
            </LocalizedClientLink>
            <div className="hidden medium:flex items-center gap-6 text-base-semi">
              <LocalizedClientLink className="hover:text-[#18310f]" href="/store">
                Shop
              </LocalizedClientLink>
              <LocalizedClientLink className="hover:text-[#18310f]" href="/store">
                Offers
              </LocalizedClientLink>
              <LocalizedClientLink className="hover:text-[#18310f]" href="/store">
                Organic
              </LocalizedClientLink>
              <WishlistNavLink />
            </div>
          </div>

          <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
            <div className="hidden small:flex items-center gap-x-5 h-full">
              <ProductSearchBox
                className="hidden h-10 w-[260px] px-3 large:flex"
                inputClassName="text-small-regular"
                placeholder="Search groceries"
              />
              <LocalizedClientLink
                className="hover:text-[#18310f]"
                href="/account"
                data-testid="nav-account-link"
              >
                Account
              </LocalizedClientLink>
            </div>
            <Suspense
              fallback={
                <LocalizedClientLink
                  className="hover:text-ui-fg-base flex gap-2"
                  href="/cart"
                  data-testid="nav-cart-link"
                >
                  Cart (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>
          </div>
        </nav>
      </header>
    </div>
  )
}
