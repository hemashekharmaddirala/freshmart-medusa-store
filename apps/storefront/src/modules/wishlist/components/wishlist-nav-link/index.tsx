"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const WishlistNavLink = ({
  className = "hover:text-[#18310f]",
  onClick,
}: {
  className?: string
  onClick?: () => void
}) => {
  const { wishlistCount } = useWishlist()

  return (
    <LocalizedClientLink
      className={className}
      href="/wishlist"
      onClick={onClick}
      data-testid="nav-wishlist-link"
    >
      Wishlist ({wishlistCount})
    </LocalizedClientLink>
  )
}

export default WishlistNavLink
