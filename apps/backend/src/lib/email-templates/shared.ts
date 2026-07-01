export type OrderEmailItem = {
  title: string
  quantity?: number
}

export type OrderEmailData = {
  customerName: string
  orderId: string
  items: OrderEmailItem[]
  total: string
  paymentMethod: string
  orderStatus: string
}

export type PaymentSuccessEmailData = {
  customerName: string
  paymentId: string
  orderId: string
  amountPaid: string
  paymentStatus: string
}

export type AdminNewOrderEmailData = {
  customerName: string
  orderId: string
  amount: string
  paymentMethod: string
}

export const escapeHtml = (value: unknown) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export const renderItemsText = (items: OrderEmailItem[]) => {
  if (!items.length) {
    return "Items are being prepared."
  }

  return items
    .map((item) => `- ${item.title}${item.quantity ? ` x ${item.quantity}` : ""}`)
    .join("\n")
}

export const renderItemsHtml = (items: OrderEmailItem[]) => {
  if (!items.length) {
    return "<li>Items are being prepared.</li>"
  }

  return items
    .map((item) => {
      const quantity = item.quantity ? ` x ${item.quantity}` : ""

      return `<li>${escapeHtml(item.title)}${escapeHtml(quantity)}</li>`
    })
    .join("")
}
