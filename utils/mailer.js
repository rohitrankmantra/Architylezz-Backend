import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL, // your Gmail
    pass: process.env.ADMIN_EMAIL_PASSWORD, // app password
  },
});

/**
 * Send mail to admin
 */
export const sendAdminMail = async ({ name, email, phone, service, message }) => {
  const mailOptions = {
    from: `"Architylezz Website Contact Form" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL, // Admin gets the mail
    subject: "📩 New Contact Form Submission",
    html: `
      <h2>New Contact Form Submission</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      ${phone ? `<p><b>Phone:</b> ${phone}</p>` : ""}
      ${service ? `<p><b>Service:</b> ${service}</p>` : ""}
      <p><b>Message:</b></p>
      <p>${message}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
