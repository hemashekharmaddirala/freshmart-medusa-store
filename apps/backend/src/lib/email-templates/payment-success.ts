import { escapeHtml, PaymentSuccessEmailData } from "./shared"

export const buildPaymentSuccessEmail = (data: PaymentSuccessEmailData) => {
  return {
    subject: `FreshMart payment received: ${data.orderId}`,
    text: [
      `Hi ${data.customerName},`,
      "",
      "Your online payment was successful.",
      "",
      `Payment ID: ${data.paymentId}`,
      `Order ID: ${data.orderId}`,
      `Amount Paid: ${data.amountPaid}`,
      `Payment Status: ${data.paymentStatus}`,
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2933; line-height: 1.5;">
        <h2 style="margin: 0 0 16px;">Payment received</h2>
        <p>Hi ${escapeHtml(data.customerName)},</p>
        <p>Your online payment was successful.</p>
        <p><strong>Payment ID:</strong> ${escapeHtml(data.paymentId)}</p>
        <p><strong>Order ID:</strong> ${escapeHtml(data.orderId)}</p>
        <p><strong>Amount Paid:</strong> ${escapeHtml(data.amountPaid)}</p>
        <p><strong>Payment Status:</strong> ${escapeHtml(data.paymentStatus)}</p>
      </div>
    `,
  }
}
