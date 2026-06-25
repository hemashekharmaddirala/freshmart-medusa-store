"use client"

import { clx } from "@modules/common/components/ui"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"

type ProductSearchBoxProps = {
  className?: string
  inputClassName?: string
  placeholder?: string
  showButton?: boolean
}

export default function ProductSearchBox({
  className,
  inputClassName,
  placeholder = "Search the FreshMart catalog",
  showButton = false,
}: ProductSearchBoxProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams<{ countryCode?: string }>()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(searchParams.get("q") || "")

  useEffect(() => {
    setValue(searchParams.get("q") || "")
  }, [searchParams])

  const updateSearch = (nextValue: string) => {
    setValue(nextValue)

    const query = nextValue.trim()
    const nextParams = new URLSearchParams(searchParams)

    nextParams.delete("page")

    if (query) {
      nextParams.set("q", query)
    } else {
      nextParams.delete("q")
    }

    const isStorePath = pathname.endsWith("/store")
    const nextPath = isStorePath
      ? pathname
      : `/${params.countryCode || ""}/store`.replace("//", "/")
    const nextQuery = nextParams.toString()

    startTransition(() => {
      router.replace(nextQuery ? `${nextPath}?${nextQuery}` : nextPath, {
        scroll: false,
      })
    })
  }

  return (
    <div
      className={clx(
        "relative flex items-center rounded-rounded border border-[#dce8d5] bg-[#f7faf5]",
        className
      )}
    >
      <input
        aria-label="Search products"
        className={clx(
          "w-full bg-transparent text-base-regular text-[#18310f] outline-none",
          inputClassName
        )}
        onChange={(event) => updateSearch(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
      {isPending && (
        <span className="absolute bottom-0 left-0 h-[2px] w-full overflow-hidden rounded-rounded bg-[#dce8d5]">
          <span className="block h-full w-1/2 animate-pulse bg-[#2f6b1f]" />
        </span>
      )}
      {showButton && (
        <button
          className="ml-2 flex h-12 items-center justify-center rounded-rounded bg-[#2f6b1f] px-6 text-base-semi text-white transition hover:bg-[#18310f]"
          type="button"
        >
          Search
        </button>
      )}
    </div>
  )
}
