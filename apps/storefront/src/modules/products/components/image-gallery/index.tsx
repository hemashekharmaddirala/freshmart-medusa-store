"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  if (!images.length) {
    return (
      <div className="flex items-start relative">
        <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
          <Container className="relative aspect-[29/34] w-full overflow-hidden rounded-rounded bg-[#eef7e9]">
            <GroceryImagePlaceholder />
          </Container>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start relative">
      <div className="flex flex-col flex-1 small:mx-16 gap-y-4">
        {images.map((image, index) => {
          return (
            <GalleryImage image={image} index={index} key={image.id} />
          )
        })}
      </div>
    </div>
  )
}

function GalleryImage({
  image,
  index,
}: {
  image: HttpTypes.StoreProductImage
  index: number
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const imageUrl = imageFailed ? undefined : normalizeImageUrl(image.url)

  return (
    <Container
      className="relative aspect-[29/34] w-full overflow-hidden rounded-rounded bg-[#eef7e9]"
      id={image.id}
    >
      {imageUrl ? (
        <img
          alt={`Product image ${index + 1}`}
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading={index <= 2 ? "eager" : "lazy"}
          onError={() => setImageFailed(true)}
          src={imageUrl}
        />
      ) : (
        <GroceryImagePlaceholder />
      )}
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
  }

  return encodeURI(trimmedImage)
}

function GroceryImagePlaceholder() {
  return (
    <div className="absolute inset-0 flex h-full w-full items-center justify-center">
      <div className="flex h-28 w-28 items-center justify-center rounded-circle bg-white text-[#2f6b1f] shadow-sm">
        <svg
          aria-hidden="true"
          className="h-16 w-16"
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
        </svg>
      </div>
    </div>
  )
}

export default ImageGallery
