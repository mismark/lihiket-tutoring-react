import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
} from '@simplewebauthn/browser';

/**
 * Synchronous check: can this browser run WebAuthn at all?
 * (i.e. is `window.PublicKeyCredential` available and the context is secure:
 *  https:// in production, http://localhost in development.)
 */
export function isWebAuthnSupported() {
  try {
    return browserSupportsWebAuthn();
  } catch {
    return false;
  }
}

/**
 * Async check: is there a built-in ("platform") authenticator available —
 * Windows Hello (fingerprint / face / PIN), Touch ID, Android fingerprint, etc.
 * Used to decide whether to brand the prompt as "fingerprint" vs generic passkey.
 */
export async function isPlatformAuthenticatorAvailable() {
  try {
    return await platformAuthenticatorIsAvailable();
  } catch {
    return false;
  }
}

/**
 * Combined async gate for rendering the "Sign in with fingerprint" affordance.
 * We only require general WebAuthn support (so cross-device / synced passkeys
 * and security keys keep working); the platform-authenticator check is a hint,
 * not a hard requirement.
 */
export async function canUsePasskeyLogin() {
  if (!isWebAuthnSupported()) return false;
  return true; // platform authenticator is a bonus, not required
}
