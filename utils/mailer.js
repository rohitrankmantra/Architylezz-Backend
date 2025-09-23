import nodemailer from "nodemailer";

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
export const sendAdminMail = async ({ name, email, message }) => {
  const mailOptions = {
    from: `"Website Contact Form" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL, // Admin gets the mail
    subject: "📩 New Contact Form Submission",
    html: `
      <h2>New Contact Form Submission</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b> ${message}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
