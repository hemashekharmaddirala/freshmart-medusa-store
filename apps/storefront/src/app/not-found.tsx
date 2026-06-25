import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@modules/common/components/ui"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4 bg-[#fbfcf8] px-6 text-center">
      <h1 className="text-2xl-semi text-[#18310f]">Fresh aisle not found</h1>
      <p className="text-small-regular text-[#65715f]">
        The FreshMart page you tried to access does not exist.
      </p>
      <Link className="flex gap-x-1 items-center group" href="/">
        <Text className="text-[#2f6b1f]">Go to FreshMart home</Text>
        <ArrowUpRightMini
          className="group-hover:rotate-45 ease-in-out duration-150"
          color="var(--fg-interactive)"
        />
      </Link>
    </div>
  )
}
