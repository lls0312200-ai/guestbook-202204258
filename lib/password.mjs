import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

// One entry password -> one random salt + scrypt hash, stored as "salt:hash" hex.
// See docs/adr/0001-password-verification-via-scrypt.md.
export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  const [salt, hashHex] = typeof storedHash === "string" ? storedHash.split(":") : [];
  if (!salt || !hashHex) return false;

  const storedBuffer = Buffer.from(hashHex, "hex");
  const derivedKey = await scrypt(password, salt, storedBuffer.length);
  if (storedBuffer.length !== derivedKey.length) return false;

  return timingSafeEqual(derivedKey, storedBuffer);
}
