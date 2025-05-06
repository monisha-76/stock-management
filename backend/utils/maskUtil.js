const crypto = require("crypto");

// 32 bytes secret key for AES-256
const ENCRYPTION_KEY = crypto.randomBytes(32);
const IV_LENGTH = 16; // AES block size

exports.maskData = (data) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted; // include IV for decryption
};

exports.unmaskData = (encryptedData) => {
  const parts = encryptedData.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
