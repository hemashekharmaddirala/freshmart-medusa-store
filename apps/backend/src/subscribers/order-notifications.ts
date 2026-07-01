import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"

import { getAdminEmailRecipient, sendEmail } from "../lib/email"
import {
  buildAdminNewOrderEmail,
  buildOrderConfirmationEmail,
  buildPaymentSuccessEmail,
} from "../lib/email-templates"

console.log("🔥 order-notifications subscriber loaded")

type OrderPlacedEvent = {
  id?: string
  order_id?: string
}

type QueryGraph = {
  graph: (input: {
    entity: string
    fields: string[]
    filters: Record<string, unknown>
    options?: Record<string, unknown>
  }) => Promise<{ data: any[] | any }>
}

const formatStatus = (value?: string) => {
  if (!value) {
    return "Pending"
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

const formatOrderId = (order: any) => {
  return order.display_id ? `#${order.display_id}` : order.id
}

const formatAmount = (amount: unknown, currencyCode?: string) => {
  const value = Number(amount || 0)
  const currency = (currencyCode || "INR").toUpperCase()

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}

const getCustomerName = (order: any) => {
  const address = order.shipping_address || order.billing_address || {}
  const name = [address.first_name, address.last_name].filter(Boolean).join(" ")

  return name || order.email || "Customer"
}

const getOrderItems = (order: any) => {
  return (order.items || []).map((item: any) => ({
    title: item.title || item.variant?.title || "FreshMart item",
    quantity: item.quantity,
  }))
}

const getPayment = (order: any) => {
  const collections = order.payment_collections || []

  return collections
    .flatMap((collection: any) => collection.payments || [])
    .find(Boolean)
}

const getPaymentData = (order: any) => {
  const payment = getPayment(order)

  return {
    payment,
    data: payment?.data || {},
    providerId: payment?.provider_id || "",
  }
}

const getPaymentMethod = (providerId: string) => {
  if (providerId.startsWith("pp_system_default")) {
    return "Cash on Delivery (COD)"
  }

  if (providerId.startsWith("pp_razorpay_razorpay")) {
    return "Online Payment (Razorpay)"
  }

  return providerId || "Payment method pending"
}

const isRazorpayPaidOrder = (providerId: string, data: Record<string, any>) => {
  return Boolean(
    providerId.startsWith("pp_razorpay_razorpay") &&
      data.razorpay_verified &&
      data.razorpay_payment_id
  )
}

export default async function orderNotificationsHandler({
  event,
  container,
}: SubscriberArgs<OrderPlacedEvent>) {
  console.log("🔥 order.placed triggered")

  try {
    const orderId = event.data?.id || event.data?.order_id

    if (!orderId) {
      console.warn("[email] order.placed event did not include an order id")
      return
    }

    const query = container.resolve<QueryGraph>("query")
    const result = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "status",
        "total",
        "currency_code",
        "*items",
        "*items.variant",
        "*shipping_address",
        "*billing_address",
        "*payment_collections",
        "*payment_collections.payments",
        "*payment_collections.payments.captures",
      ],
      filters: { id: orderId },
      options: { isList: false },
    })

    const order = Array.isArray(result.data) ? result.data[0] : result.data

    if (!order?.email) {
      console.warn("[email] Order email is missing. Skipping notifications.")
      return
    }

    const customerName = getCustomerName(order)
    const displayOrderId = formatOrderId(order)
    const total = formatAmount(order.total, order.currency_code)
    const { data: paymentData, providerId } = getPaymentData(order)
    const paymentMethod = getPaymentMethod(providerId)
    const orderStatus = formatStatus(order.status)

    const orderConfirmation = buildOrderConfirmationEmail({
      customerName,
      orderId: displayOrderId,
      items: getOrderItems(order),
      total,
      paymentMethod,
      orderStatus,
    })

    await sendEmail({
      to: order.email,
      ...orderConfirmation,
    })

    const adminEmail = getAdminEmailRecipient()

    if (adminEmail) {
      const adminNotification = buildAdminNewOrderEmail({
        customerName,
        orderId: displayOrderId,
        amount: total,
        paymentMethod,
      })

      await sendEmail({
        to: adminEmail,
        ...adminNotification,
      })
    }

    if (isRazorpayPaidOrder(providerId, paymentData)) {
      const paymentSuccess = buildPaymentSuccessEmail({
        customerName,
        paymentId: paymentData.razorpay_payment_id,
        orderId: displayOrderId,
        amountPaid: total,
        paymentStatus: formatStatus(
          paymentData.razorpay_payment_status || "captured"
        ),
      })

      await sendEmail({
        to: order.email,
        ...paymentSuccess,
      })
    }
  } catch (error) {
    console.error("[email] Order notification handling failed:", error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
