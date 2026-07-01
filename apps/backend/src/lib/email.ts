import nodemailer from "nodemailer"
import type Mail from "nodemailer/lib/mailer"

type EmailMessage = {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

let transporter: Mail | null = null

const getSmtpPort = () => Number(process.env.SMTP_PORT || 587)

const isEmailConfigured = () => {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_FROM
  )
}

const getTransporter = () => {
  if (!transporter) {
    const port = getSmtpPort()

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  return transporter
}

export const getAdminEmailRecipient = () => {
  return process.env.SMTP_ADMIN_TO || process.env.SMTP_USER || ""
}

export const sendEmail = async (message: EmailMessage) => {
  if (!isEmailConfigured()) {
    console.warn(
      "[email] SMTP is not configured. Skipping email:",
      message.subject
    )

    return false
  }

  try {
    console.log("Sending email to:", message.to)

    const smtpTransporter = getTransporter()

    await smtpTransporter.verify()

    const info = await smtpTransporter.sendMail({
      from: process.env.SMTP_FROM,
      ...message,
    })

    console.log("Email sent:", info.messageId)

    return true
  } catch (error) {
    console.error("Email error:", error)

    return false
  }
}
