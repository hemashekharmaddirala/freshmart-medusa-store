"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

export const listCartPaymentMethods = async (regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("payment_providers")),
  }

  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      `/store/payment-providers`,
      {
        method: "GET",
        query: { region_id: regionId },
        headers,
        next,
        cache: "no-store",
      }
    )
    .then(({ payment_providers }) =>
      payment_providers.sort((a, b) => {
        const order = ["pp_system_default", "pp_razorpay_razorpay"]
        const aIndex = order.indexOf(a.id)
        const bIndex = order.indexOf(b.id)

        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex
        }

        if (aIndex !== -1) {
          return -1
        }

        if (bIndex !== -1) {
          return 1
        }

        return a.id > b.id ? 1 : -1
      })
    )
    .catch(() => {
      return null
    })
}

export const verifyRazorpayPayment = async (data: {
  payment_session_id: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client.fetch<{
    success: boolean
    payment_session: HttpTypes.StorePaymentSession
  }>(`/store/razorpay/verify`, {
    method: "POST",
    body: data,
    headers,
    cache: "no-store",
  })
}

export const createRazorpayOrder = async (data: {
  payment_session_id: string
  amount?: number
  currency?: string
  receipt?: string
}) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const response = await sdk.client.fetch<{
    success: boolean
    order_id: string
    amount: number
    currency: string
    key_id: string
    message?: string
  }>(`/store/razorpay/create-order`, {
    method: "POST",
    body: data,
    headers,
    cache: "no-store",
  })

  if (!response.success) {
    throw new Error(response.message || "Failed to create Razorpay order.")
  }

  return response
}
