"use client"

import { clx } from "@modules/common/components/ui"
import { useWishlist } from "@lib/context/wishlist-context"
import { MouseEvent } from "react"

type WishlistButtonProps = {
  productId?: string | null
  productTitle?: string | null
  className?: string
}

const WishlistButton = ({
  productId,
  productTitle,
  className,
}: WishlistButtonProps) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const active = isInWishlist(productId)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()

    if (!productId) {
      return
    }

    if (active) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={
        active
          ? `Remove ${productTitle || "product"} from wishlist`
          : `Add ${productTitle || "product"} to wishlist`
      }
      className={clx(
        "absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-circle border border-[#dce8d5] bg-white/95 text-lg shadow-sm transition hover:border-[#2f6b1f] hover:text-[#2f6b1f] focus:outline-none focus:ring-2 focus:ring-[#2f6b1f] focus:ring-offset-2",
        active ? "border-[#f2b8c6] bg-[#fff3f6] text-[#d92d55]" : "text-[#65715f]",
        className
      )}
      onClick={handleClick}
    >
      {active ? "\u2665" : "\u2661"}
    </button>
  )
}

export default WishlistButton
