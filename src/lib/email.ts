import nodemailer from "nodemailer"

export const BUSSINES_DATA = {
  name: "Cache Marketing",
  web: "masterclass.cachemarketing.net",
  supportEmail: "soporte@cachemarketing.net",
  supportEmailPassword: import.meta.env.EMAIL_PASSWORD,
  supportEmailName: "Cache Marketing",
  emailHost: import.meta.env.EMAIL_HOST,
} as const

const transporter = nodemailer.createTransport({
  host: BUSSINES_DATA.emailHost,
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: BUSSINES_DATA.supportEmail,
    pass: BUSSINES_DATA.supportEmailPassword,
  },
  tls: {
    rejectUnauthorized: false, // Temporal para diagnóstico
  },
})
export const sendEmail = async ({
  to,
  subject,
  body,
}: {
  to: string
  subject: string
  body: string
}) => {
  const info = await transporter.sendMail({
    from: BUSSINES_DATA.supportEmail,
    to,
    subject,
    html: body,
  })

  console.log("Message sent:", info.messageId)
  return info
}
