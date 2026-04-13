const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `AMAK Auction <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });
};

const sendWelcomeEmail = async ({ name, email }) => {
  await sendMail({
    to: email,
    subject: "Welcome to AMAK Equipment Auction",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to AMAK Equipment Auction</h2>
        <p>Hi ${name},</p>
        <p>Your account has been created successfully.</p>
        <p>You can now log in and start bidding on available equipment.</p>
        <p>Best regards,<br/>AMAK Auction Team</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  await sendMail({
    to: email,
    subject: "Reset Your Password - AMAK Equipment Auction",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to set a new password:</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#7C9B9C;color:#fff;text-decoration:none;border-radius:8px;">
            Reset Password
          </a>
        </p>
        <p>If you did not request this, you can ignore this email.</p>
        <p>This link will expire in 15 minutes.</p>
        <p>Best regards,<br/>AMAK Auction Team</p>
      </div>
    `,
  });
};

const sendAuctionEndedEmail = async ({
  auctionTitle,
  highestBidAmount,
  highestBidderName,
  highestBidderEmail,
}) => {
  await sendMail({
    to: process.env.ADMIN_EMAIL,
    subject: `Auction Ended: ${auctionTitle}`,
    html: `
      <h2>Auction Ended</h2>
      <p><strong>Auction:</strong> ${auctionTitle}</p>
      <p><strong>Highest Bid:</strong> ${highestBidAmount || "No bids"}</p>
      <p><strong>Highest Bidder:</strong> ${highestBidderName || "N/A"}</p>
      <p><strong>Bidder Email:</strong> ${highestBidderEmail || "N/A"}</p>
      <p>Please review the result in the admin dashboard.</p>
    `,
  });
};

const sendWinnerEmail = async ({
  email,
  name,
  auctionTitle,
  winningAmount,
}) => {
  await sendMail({
    to: email,
    subject: `Congratulations! You won: ${auctionTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Congratulations!</h2>
        <p>Hi ${name},</p>
        <p>You are the winning bidder for:</p>
        <p><strong>${auctionTitle}</strong></p>
        <p><strong>Winning Amount:</strong> ${winningAmount} SAR</p>
        <p>Our team will contact you with the next steps.</p>
        <p>Best regards,<br/>AMAK Auction Team</p>
      </div>
    `,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAuctionEndedEmail,
  sendWinnerEmail,
};