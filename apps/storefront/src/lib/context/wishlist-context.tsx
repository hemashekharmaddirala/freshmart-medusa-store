"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

const WISHLIST_STORAGE_KEY = "freshmart:wishlist"

type WishlistContextValue = {
  wishlistIds: string[]
  wishlistCount: number
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId?: string | null) => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

const readStoredWishlist = () => {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const storedValue = window.localStorage.getItem(WISHLIST_STORAGE_KEY)
    const parsedValue = storedValue ? JSON.parse(storedValue) : []

    return Array.isArray(parsedValue)
      ? parsedValue.filter((id): id is string => typeof id === "string")
      : []
  } catch {
    return []
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([])
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setWishlistIds(Array.from(new Set(readStoredWishlist())))
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    window.localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(wishlistIds)
    )
  }, [hasHydrated, wishlistIds])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === WISHLIST_STORAGE_KEY) {
        setWishlistIds(Array.from(new Set(readStoredWishlist())))
      }
    }

    window.addEventListener("storage", handleStorage)

    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const addToWishlist = useCallback((productId: string) => {
    setWishlistIds((currentIds) =>
      currentIds.includes(productId) ? currentIds : [...currentIds, productId]
    )
  }, [])

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlistIds((currentIds) => currentIds.filter((id) => id !== productId))
  }, [])

  const isInWishlist = useCallback(
    (productId?: string | null) => !!productId && wishlistIds.includes(productId),
    [wishlistIds]
  )

  const clearWishlist = useCallback(() => {
    setWishlistIds([])
  }, [])

  const value = useMemo(
    () => ({
      wishlistIds,
      wishlistCount: wishlistIds.length,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
    }),
    [
      wishlistIds,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist,
    ]
  )

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }

  return context
}
