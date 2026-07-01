import { AdminNewOrderEmailData, escapeHtml } from "./shared"

export const buildAdminNewOrderEmail = (data: AdminNewOrderEmailData) => {
  return {
    subject: `FreshMart new order: ${data.orderId}`,
    text: [
      "A new FreshMart order has been created.",
      "",
      `Customer: ${data.customerName}`,
      `Order ID: ${data.orderId}`,
      `Amount: ${data.amount}`,
      `Payment Method: ${data.paymentMethod}`,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2933; line-height: 1.5;">
        <h2 style="margin: 0 0 16px;">New FreshMart order</h2>
        <p><strong>Customer:</strong> ${escapeHtml(data.customerName)}</p>
        <p><strong>Order ID:</strong> ${escapeHtml(data.orderId)}</p>
        <p><strong>Amount:</strong> ${escapeHtml(data.amount)}</p>
        <p><strong>Payment Method:</strong> ${escapeHtml(data.paymentMethod)}</p>
      </div>
    `,
  }
}
