/**
 * ALETOREX - Security & PIN Management Module
 * Provides SHA-256 cryptographic hashing and secure emergency code validation.
 * Never stores emergency code in plain text.
 */

const STORAGE_KEY_PIN_HASH = 'aletorex_security_pin_hash_v1';

// SHA-256 hash of the 8-digit Emergency Master Code (securely obfuscated / hashed)
const EMERGENCY_MASTER_HASH = 'c80db51580c9066896f5f7bbcb5644a720f4d2d55d54264a25e57d3141483577';

/**
 * Computes the SHA-256 hex string of any text using Web Crypto API.
 */
export async function computeSha256(text: string): Promise<string> {
  const normalized = text.trim();
  if (!normalized) return '';

  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(normalized);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }

  // Pure JS SHA-256 fallback for environments where subtle crypto might be restricted
  return fallbackSha256(normalized);
}

/**
 * Checks if the user has already configured a security PIN.
 */
export function hasStoredPin(): boolean {
  try {
    const hash = localStorage.getItem(STORAGE_KEY_PIN_HASH);
    return Boolean(hash && hash.trim().length > 0);
  } catch {
    return false;
  }
}

/**
 * Retrieves the stored user PIN hash.
 */
export function getStoredPinHash(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_PIN_HASH);
  } catch {
    return null;
  }
}

/**
 * Saves a new user PIN by hashing it securely before storing.
 */
export async function saveUserPin(rawPin: string): Promise<boolean> {
  try {
    const hash = await computeSha256(rawPin);
    if (!hash) return false;
    localStorage.setItem(STORAGE_KEY_PIN_HASH, hash);
    return true;
  } catch (err) {
    console.error('Error saving PIN hash', err);
    return false;
  }
}

/**
 * Validates an entered code against the user PIN hash OR the emergency master code hash.
 */
export async function verifyPinOrMaster(inputCode: string): Promise<{
  valid: boolean;
  isMaster: boolean;
}> {
  const cleanInput = inputCode.trim();
  if (!cleanInput) return { valid: false, isMaster: false };

  const inputHash = await computeSha256(cleanInput);

  // 1. Check emergency master code hash
  if (inputHash === EMERGENCY_MASTER_HASH) {
    return { valid: true, isMaster: true };
  }

  // 2. Check stored user PIN hash
  const storedHash = getStoredPinHash();
  if (storedHash && inputHash === storedHash) {
    return { valid: true, isMaster: false };
  }

  return { valid: false, isMaster: false };
}

/**
 * Removes the stored PIN (only if reset occurs or requested).
 */
export function removeStoredPin(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PIN_HASH);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Fallback SHA-256 implementation
 */
function fallbackSha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let isLastBlock = false;
  let blockIndex = 0;

  while (!isLastBlock) {
    const wordCount = 16;
    const block: number[] = [];

    for (i = 0; i < wordCount; i++) {
      const charIndex = blockIndex * 64 + i * 4;
      if (charIndex >= ascii.length) {
        if (!isLastBlock) {
          isLastBlock = true;
          block[i] = 0x80000000;
        } else {
          block[i] = 0;
        }
      } else {
        block[i] =
          ((ascii.charCodeAt(charIndex) || 0) << 24) |
          ((ascii.charCodeAt(charIndex + 1) || 0) << 16) |
          ((ascii.charCodeAt(charIndex + 2) || 0) << 8) |
          (ascii.charCodeAt(charIndex + 3) || 0);
      }
    }

    if (isLastBlock && blockIndex * 64 + 56 <= ascii.length) {
      block[15] = asciiBitLength;
    }

    words.push(...block);
    blockIndex++;
  }

  for (j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      if (i >= 16) {
        const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }

      const s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = (hash[7] + s1 + ch + k[i] + w[i]) | 0;
      const s0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = (s0 + maj) | 0;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}
