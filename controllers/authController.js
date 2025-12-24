const { Resend } = require("resend");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const Otp = require("../models/Otp");
const { getCustomerByEmail } = require("../utils/shopifyApi");
// const { generateShopifyCustomerToken } = require('../utils/helper');


// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtp = async (req, res) => {
  try {
    const email = req.body?.email?.toLowerCase()?.trim();
    console.log(`📧 Received OTP request for: ${email}`);

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // delete old OTPs
    await Otp.deleteMany({ email });

    // send email
    await resend.emails.send({
      from: 'Shipra App <hello@shipra.app>',
      to: email,
      subject: "Your OTP Code - Shipra App",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Shipra App Verification Code</h2>
          <p>Use the following code to verify your email:</p>
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    });

    await Otp.create({ email, otp });

    console.log(`✅ OTP sent successfully to: ${email}`);
    return res.json({ message: "OTP sent to email" });

  } catch (err) {
    console.error("❌ Error in sendOtp:", err);
    return res.status(500).json({ error: "Error sending OTP" });
  }
};


// Verify OTP and login/register user
// const verifyOtp = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     if (!email || !otp)
//       return res.status(400).json({ error: "Email and OTP are required" });

//     const record = otpStore.get(email);
//     if (!record)
//       return res.status(400).json({ error: "No OTP requested or OTP expired" });

//     if (record.expiresAt < new Date()) {
//       otpStore.delete(email);
//       return res.status(400).json({ error: "OTP expired" });
//     }

//     if (record.code !== otp) {
//       return res.status(400).json({ error: "Invalid OTP" });
//     }

//     otpStore.delete(email);

    // STEP 1: Check MongoDB
//     let user = await User.findOne({ email });

//     if (!user) {
      // STEP 2: Check Shopify
//       let shopifyCustomer = await getCustomerByEmail(email);

//       if (shopifyCustomer) {
//         user = await User.create({
//           name: `${shopifyCustomer.first_name || ""} ${shopifyCustomer.last_name || ""}`.trim(),
//           email: shopifyCustomer.email,
//           phone: shopifyCustomer.phone || null,
//           address: shopifyCustomer.default_address?.address1 || shopifyCustomer.default_address?.city || null,
//           shopifyCustomerId: shopifyCustomer.id,
//         });
//       } else {
//         const newCustomer = await createCustomer({
//           firstName: "",
//           lastName: "",
//           email,
//           phone: null,
//           tags: ["app-user"],
//         });

//         user = await User.create({
//           name: `${newCustomer.first_name || ""} ${newCustomer.last_name || ""}`.trim(),
//           email: newCustomer.email,
//           phone: newCustomer.phone || null,
//           address: newCustomer.default_address?.address1 || newCustomer.default_address?.city || null,
//           shopifyCustomerId: newCustomer.id,
//         });
//       }
//     }

    // STEP 3: Generate JWT
//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       process.env.JWT_SECRET || "fallback_secret_do_change",
//       { expiresIn: process.env.JWT_EXPIRY || "1h" }
//     );

   // STEP 4: Generate Shopify Token
// let shopifyCustomerToken = null;
// if (user.shopifyCustomerId) {
//   if (!user.shopifyPassword) {
    // Generate random password for first-time Shopify customer
//     const randomPassword = Math.random().toString(36).slice(-12);
//     user.shopifyPassword = randomPassword;
//     await user.save();
//   }

//   shopifyCustomerToken = await generateShopifyCustomerToken(user.email, user.shopifyPassword);
// }


    // STEP 5: Send both JWT and Shopify token
//     return res.json({
//     message: "OTP verified successfully",
//     token, // Your JWT token
//     user: {
//       id: user._id,
//       email: user.email,
//       name: user.name,
//       shopifyCustomerId: user.shopifyCustomerId,
//     },
//   });
//   } catch (err) {
//     console.error("❌ Error in verifyOtp:", err);
//     return res.status(500).json({ error: "Server error", details: err.message });
//   }
  
// };


const verifyOtp = async (req, res) => {
  try {
    console.log(req.body);

    /* ---------- INPUT ---------- */
    const email = req.body?.email?.toLowerCase()?.trim();
    const otp = req.body?.otp?.toString()?.trim();

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    /* ---------- OTP ---------- */
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({ error: "OTP expired or not requested" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

   // OTP used → delete it
    await Otp.deleteOne({ _id: otpRecord._id });

    /* ---------- USER ---------- */
    let user = await User.findOne({ email });

    if (!user) {
      let shopifyCustomer = null;

      try {
        shopifyCustomer = await getCustomerByEmail(email);
      } catch (err) {
        console.error("⚠️ Shopify lookup failed:", err.message);
      }

      const userPayload = {
        email,
        name: "",
        phone: null,
        address: null,
        shopifyCustomerId: null,
      };

      if (shopifyCustomer) {
        userPayload.name =
          `${shopifyCustomer.first_name || ""} ${shopifyCustomer.last_name || ""}`.trim();
        userPayload.phone = shopifyCustomer.phone || null;
        userPayload.address =
          shopifyCustomer.default_address?.address1 ||
          shopifyCustomer.default_address?.city ||
          null;
        userPayload.shopifyCustomerId = shopifyCustomer.id || null;
      }

      user = await User.create(userPayload);
    }

    /* ---------- JWT ---------- */
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    /* ---------- RESPONSE ---------- */
    return res.json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name || "User",
        shopifyCustomerId: user.shopifyCustomerId || null,
      },
    });

  } catch (err) {
    console.error("🔥 verifyOtp fatal crash:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  sendOtp,
  verifyOtp,
};

