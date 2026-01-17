const { sendEmail } = require("../utils/supportMail");

/**
 * POST /api/support/contact
 */
exports.contactUs = async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await sendEmail({
      to: process.env.SUPPORT_EMAIL,
      replyTo: email,
      subject: `Contact Us – ${fullName}`,
      html: `
        <h2>New Contact Us Message</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Contact Us error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

/**
 * POST /api/support/content-removal
 */
exports.contentRemovalRequest = async (req, res) => {
  try {
    const { fullName, email, contentUrl, reason } = req.body;

    if (!fullName || !email || !contentUrl || !reason) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    await sendEmail({
      to: process.env.SUPPORT_EMAIL,
      replyTo: email,
      subject: "Content Removal Request",
      html: `
        <h2>Content Removal Request</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Reported Content URL:</strong></p>
        <p>${contentUrl}</p>
        <p><strong>Reason:</strong></p>
        <p>${reason}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Content removal request submitted",
    });
  } catch (error) {
    console.error("Content removal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit content removal request",
    });
  }
};
