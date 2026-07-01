import {
  escapeHtml,
  OrderEmailData,
  renderItemsHtml,
  renderItemsText,
} from "./shared"

export const buildOrderConfirmationEmail = (data: OrderEmailData) => {
  return {
    subject: `FreshMart order confirmed: ${data.orderId}`,
    text: [
      `Hi ${data.customerName},`,
      "",
      "Your order has been placed successfully.",
      "",
      `Order ID: ${data.orderId}`,
      `Payment Method: ${data.paymentMethod}`,
      `Order Status: ${data.orderStatus}`,
      `Total: ${data.total}`,
      "",
      "Products:",
      renderItemsText(data.items),
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2933; line-height: 1.5;">
        <h2 style="margin: 0 0 16px;">Your FreshMart order is confirmed</h2>
        <p>Hi ${escapeHtml(data.customerName)},</p>
        <p>Your order has been placed successfully.</p>
        <p><strong>Order ID:</strong> ${escapeHtml(data.orderId)}</p>
        <p><strong>Payment Method:</strong> ${escapeHtml(data.paymentMethod)}</p>
        <p><strong>Order Status:</strong> ${escapeHtml(data.orderStatus)}</p>
        <p><strong>Total:</strong> ${escapeHtml(data.total)}</p>
        <h3 style="margin: 24px 0 8px;">Products</h3>
        <ul>${renderItemsHtml(data.items)}</ul>
      </div>
    `,
  }
}
