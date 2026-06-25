import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@modules/common/components/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="w-full border-t border-[#dce8d5] bg-[#18310f] text-white">
      <div className="content-container flex w-full flex-col">
        <div className="grid gap-10 py-16 small:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-3 text-2xl-semi text-white"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-circle bg-[#d7ff8f] text-[#18310f]">
                F
              </span>
              FreshMart
            </LocalizedClientLink>
            <Text className="mt-4 text-base-regular text-[#dcebd3]">
              Premium groceries, crisp produce, and everyday essentials with
              reliable Medusa-powered commerce underneath.
            </Text>
            <div className="mt-6 grid grid-cols-3 gap-3 text-small-regular text-[#dcebd3]">
              <span>Fast delivery</span>
              <span>Fresh picks</span>
              <span>Secure checkout</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-small-regular sm:grid-cols-3 md:gap-x-16">
            {productCategories && productCategories?.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-small-semi text-white">Categories</span>
                <ul
                  className="grid grid-cols-1 gap-2"
                  data-testid="footer-categories"
                >
                  {productCategories?.slice(0, 6).map((c) => {
                    if (c.parent_category) {
                      return
                    }

                    const children =
                      c.category_children?.map((child) => ({
                        name: child.name,
                        handle: child.handle,
                        id: child.id,
                      })) || null

                    return (
                      <li
                        className="flex flex-col gap-2 text-small-regular text-[#dcebd3]"
                        key={c.id}
                      >
                        <LocalizedClientLink
                          className={clx(
                            "hover:text-white",
                            children && "text-small-semi"
                          )}
                          href={`/categories/${c.handle}`}
                          data-testid="category-link"
                        >
                          {c.name}
                        </LocalizedClientLink>
                        {children && (
                          <ul className="ml-3 grid grid-cols-1 gap-2 text-[#b9cbb0]">
                            {children.map((child) => (
                              <li key={child.id}>
                                <LocalizedClientLink
                                  className="hover:text-white"
                                  href={`/categories/${child.handle}`}
                                  data-testid="category-link"
                                >
                                  {child.name}
                                </LocalizedClientLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {collections && collections.length > 0 && (
              <div className="flex flex-col gap-y-2">
                <span className="text-small-semi text-white">Collections</span>
                <ul
                  className={clx(
                    "grid grid-cols-1 gap-2 text-small-regular text-[#dcebd3]",
                    {
                      "grid-cols-2": (collections?.length || 0) > 3,
                    }
                  )}
                >
                  {collections?.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-white"
                        href={`/collections/${c.handle}`}
                      >
                        {c.title}
                      </LocalizedClientLink>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-y-2">
              <span className="text-small-semi text-white">FreshMart</span>
              <ul className="grid grid-cols-1 gap-y-2 text-small-regular text-[#dcebd3]">
                <li>
                  <LocalizedClientLink className="hover:text-white" href="/store">
                    Shop groceries
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    className="hover:text-white"
                    href="/account"
                  >
                    My account
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink className="hover:text-white" href="/cart">
                    Cart
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-10 flex w-full justify-between border-t border-white/10 pt-6 text-[#b9cbb0]">
          <Text className="text-small-regular">
            Copyright {new Date().getFullYear()} FreshMart. All rights reserved.
          </Text>
          <Text className="hidden text-small-regular small:block">
            Built on Medusa commerce APIs.
          </Text>
        </div>
      </div>
    </footer>
  )
}
