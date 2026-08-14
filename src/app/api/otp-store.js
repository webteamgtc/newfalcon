// Shared OTP store module for secure OTP storage and verification

// In-memory OTP stores
export const phoneOtpStore = new Map();
export const emailOtpStore = new Map();

// OTP expiration time: 10 minutes
export const OTP_TTL = 10 * 60 * 1000;

// Cleanup interval: 5 minutes
export const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  
  // Cleanup phone OTPs
  for (const [phone, data] of phoneOtpStore.entries()) {
    if (data.expiresAt < now) {
      phoneOtpStore.delete(phone);
    }
  }
  
  // Cleanup email OTPs
  for (const [email, data] of emailOtpStore.entries()) {
    if (data.expiresAt < now) {
      emailOtpStore.delete(email);
    }
  }
}, CLEANUP_INTERVAL);

// Helper function to sanitize phone number for storage key
export const sanitizePhone = (phone = "") => phone.toString().replace(/[^\d]/g, "");

// Store OTP
export const storeOtp = (type, identifier, otp) => {
  const expiresAt = Date.now() + OTP_TTL;
  
  if (type === "phone") {
    const phoneKey = sanitizePhone(identifier);
    phoneOtpStore.set(phoneKey, {
      otp: otp,
      expiresAt: expiresAt,
      phone: identifier,
    });
    // Also store in emailOtpStore for compatibility with otp-smtp route
    emailOtpStore.set(`phone_${phoneKey}`, {
      otp: otp,
      expiresAt: expiresAt,
      phone: identifier,
    });
  } else if (type === "email") {
    const emailKey = identifier.toLowerCase();
    emailOtpStore.set(emailKey, {
      otp: otp,
      expiresAt: expiresAt,
      email: identifier,
    });
  }
};

// Verify OTP
export const verifyOtp = (type, identifier, otp) => {
  let storedOtpData = null;
  
  if (type === "phone") {
    const phoneKey = sanitizePhone(identifier);
    storedOtpData = phoneOtpStore.get(phoneKey) || emailOtpStore.get(`phone_${phoneKey}`);
  } else if (type === "email") {
    const emailKey = identifier.toLowerCase();
    storedOtpData = emailOtpStore.get(emailKey);
  }
  
  if (!storedOtpData) {
    return { success: false, message: "No OTP found. Please request a new OTP." };
  }
  
  if (storedOtpData.expiresAt < Date.now()) {
    // Clean up expired OTP
    if (type === "phone") {
      const phoneKey = sanitizePhone(identifier);
      phoneOtpStore.delete(phoneKey);
      emailOtpStore.delete(`phone_${phoneKey}`);
    } else {
      emailOtpStore.delete(identifier.toLowerCase());
    }
    return { success: false, message: "OTP has expired. Please request a new OTP." };
  }
  
  if (storedOtpData.otp === otp) {
    // OTP verified - remove it (one-time use)
    if (type === "phone") {
      const phoneKey = sanitizePhone(identifier);
      phoneOtpStore.delete(phoneKey);
      emailOtpStore.delete(`phone_${phoneKey}`);
    } else {
      emailOtpStore.delete(identifier.toLowerCase());
    }
    return { success: true, message: "OTP verified successfully." };
  }
  
  return { success: false, message: "Invalid OTP. Please try again." };
};

