/**
 * Native biometric authentication utility.
 *
 * On Android/iOS (Capacitor): calls the device's native fingerprint /
 * Face ID / iris scanner directly — same as Telebirr / MPesa. No browser
 * passkey sheet, no "Continue" button. Just place your finger and you're in.
 *
 * On web (browser): falls back to WebAuthn (passkey).
 */

// ── Detect whether we're running inside a Capacitor native shell ─────────────
export function isNativeApp() {
  return !!(window.Capacitor && window.Capacitor.isNativePlatform());
}

// ── Lazy-load the native plugin (only available in the Capacitor shell) ───────
async function getBiometricPlugin() {
  const mod = await import('@aparajita/capacitor-biometric-auth');
  return mod.BiometricAuth;
}

/**
 * Check whether native biometrics are available on this device.
 * Returns { available: boolean, reason?: string }
 */
export async function checkNativeBiometrics() {
  if (!isNativeApp()) return { available: false, reason: 'not-native' };
  try {
    const BiometricAuth = await getBiometricPlugin();
    const result = await BiometricAuth.checkBiometry();
    return {
      available: result.isAvailable,
      biometryType: result.biometryType,   // e.g. 'TouchID', 'FaceID', 'Fingerprint'
      reason: result.reason,
    };
  } catch {
    return { available: false, reason: 'plugin-error' };
  }
}

/**
 * Prompt the user for a native biometric scan.
 *
 * Resolves with true if the scan succeeded.
 * Throws with a user-friendly message on failure/cancellation.
 *
 * @param {string} [reason]  — shown in the iOS Face ID dialog
 */
export async function authenticateWithBiometrics(reason = 'Sign in to Lihiket') {
  if (!isNativeApp()) {
    throw new Error('Native biometrics only available in the mobile app.');
  }

  const BiometricAuth = await getBiometricPlugin();

  // This fires the native Android BiometricPrompt or iOS LAContext
  // — identical to the Telebirr experience.
  await BiometricAuth.authenticate({
    reason,
    // Android BiometricPrompt texts
    androidTitle:    'Lihiket',
    androidSubtitle: 'Sign in with your fingerprint',
    // No extra "Confirm" button after scan — instant login on success
    androidConfirmationRequired: false,
    // iOS texts
    iosFallbackTitle: 'Use Password',
  });

  // If we reach here the biometric scan passed — no exception thrown
  return true;
}
