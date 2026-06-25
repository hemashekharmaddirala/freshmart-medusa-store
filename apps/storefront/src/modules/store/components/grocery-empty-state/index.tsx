import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function GroceryEmptyState({
  title = "No grocery products found",
  description = "Try another search or browse the full FreshMart catalog.",
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="rounded-rounded border border-dashed border-[#c8d9bd] bg-white p-10 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-circle bg-[#eef7e9]">
        <svg
          aria-hidden="true"
          className="h-14 w-14 text-[#2f6b1f]"
          fill="none"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 30c0-7 5-13 12-13s12 6 12 13v14c0 4-3 7-7 7H27c-4 0-7-3-7-7V30Z"
            fill="#d7ff8f"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M33 17c1-5 5-8 10-8 0 6-4 10-10 10v-2Z"
            fill="#9ec479"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M32 17V9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            d="M25 34h14M25 42h10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </div>
      <h2 className="mt-5 text-2xl-semi text-[#18310f]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-base-regular text-[#65715f]">
        {description}
      </p>
      <LocalizedClientLink
        className="mt-5 inline-flex rounded-rounded bg-[#2f6b1f] px-5 py-3 text-base-semi text-white transition hover:bg-[#18310f]"
        href="/store"
      >
        Browse all products
      </LocalizedClientLink>
    </div>
  )
}
