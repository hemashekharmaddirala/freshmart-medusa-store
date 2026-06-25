import { getBaseURL } from "@lib/util/env"
import { WishlistProvider } from "@lib/context/wishlist-context"
import { Metadata } from "next"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <WishlistProvider>
          <main className="relative">{props.children}</main>
        </WishlistProvider>
      </body>
    </html>
  )
}
