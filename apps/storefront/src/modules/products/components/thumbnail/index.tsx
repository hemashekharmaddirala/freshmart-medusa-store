"use client"

import { Container, clx } from "@modules/common/components/ui"
import { getGroceryImage } from "@lib/util/grocery-images"
import React, { useMemo, useState } from "react"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  productTitle?: string | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  productTitle,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = useMemo(
    () =>
      normalizeImageUrl(
        thumbnail || getGroceryImage(productTitle) || images?.[0]?.url
      ),
    [productTitle, thumbnail, images]
  )
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden bg-[#f3f8ed] p-4 rounded-rounded transition-shadow ease-in-out duration-150",
        className,
        {
          "aspect-[4/5]": size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder
        image={imageFailed ? undefined : initialImage}
        onError={() => setImageFailed(true)}
        size={size}
      />
    </Container>
  )
}

const normalizeImageUrl = (image?: string | null) => {
  if (!image) {
    return undefined
  }

  const trimmedImage = image.trim()

  if (!trimmedImage) {
    return undefined
  }

  if (trimmedImage.startsWith("http://") || trimmedImage.startsWith("https://")) {
    return encodeURI(trimmedImage)
  }

  if (trimmedImage.startsWith("/")) {
    if (trimmedImage.startsWith("/images/")) {
      return encodeURI(trimmedImage)
    }

    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

    if (backendUrl) {
      return encodeURI(`${backendUrl.replace(/\/$/, "")}${trimmedImage}`)
    }

    return encodeURI(trimmedImage)
  }

  return encodeURI(trimmedImage)
}

const ImageOrPlaceholder = ({
  image,
  onError,
  size,
}: Pick<ThumbnailProps, "size"> & {
  image?: string
  onError: () => void
}) => {
  return image ? (
    <img
      src={image}
      alt="Thumbnail"
      className="absolute inset-0 h-full w-full object-cover object-center"
      draggable={false}
      onError={onError}
    />
  ) : (
    <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-[#eef7e9]">
      <div className="flex h-20 w-20 items-center justify-center rounded-circle bg-white text-[#2f6b1f] shadow-sm">
        <svg
          aria-hidden="true"
          className={size === "small" ? "h-9 w-9" : "h-12 w-12"}
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
    </div>
  )
}

export default Thumbnail
