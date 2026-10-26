/**
 * WebAuthn helpers for platform (fingerprint) authenticators.
 */

export interface WebAuthnResult {
  credentialId: string
  success: boolean
  error?: string
}

/**
 * Check whether the device has a user-verifying platform authenticator
 * (Touch ID, Windows Hello fingerprint, etc.) available.
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!window.PublicKeyCredential) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

/**
 * Register a new platform authenticator (fingerprint).
 * Returns the base64 credential ID on success.
 */
export async function registerFingerprint(
  userName: string,
  onProgress?: (pct: number) => void
): Promise<WebAuthnResult> {
  if (!window.PublicKeyCredential) {
    return { credentialId: '', success: false, error: 'WebAuthn is not supported in this browser.' }
  }

  const available = await isPlatformAuthenticatorAvailable()
  if (!available) {
    return {
      credentialId: '',
      success: false,
      error:
        'No platform authenticator found. Please ensure your laptop fingerprint sensor is enrolled in Windows Hello / Touch ID / system settings.',
    }
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = crypto.getRandomValues(new Uint8Array(16))

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: { name: 'Voterena', id: window.location.hostname },
    user: {
      id: userId,
      name: userName,
      displayName: userName,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },   // ES256
      { alg: -257, type: 'public-key' }, // RS256 (fallback)
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred',
    },
    timeout: 60000,
    attestation: 'none',
  }

  // Animate progress while waiting for user to touch sensor
  let progress = 0
  const progressInterval = setInterval(() => {
    progress = Math.min(progress + 2, 90)
    onProgress?.(progress)
  }, 200)

  try {
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    })) as PublicKeyCredential | null

    clearInterval(progressInterval)
    onProgress?.(100)

    if (!credential) {
      return { credentialId: '', success: false, error: 'Fingerprint registration was cancelled by user or system.' }
    }

    const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))
    return { credentialId, success: true }
  } catch (err: any) {
    clearInterval(progressInterval)
    onProgress?.(0)

    const msg = err?.message || String(err)
    if (msg.includes('NotAllowedError') || msg.includes('cancelled') || msg.includes('abort')) {
      return { credentialId: '', success: false, error: 'Registration cancelled. You may have declined the fingerprint prompt or timed out.' }
    }
    if (msg.includes('NotSupportedError')) {
      return { credentialId: '', success: false, error: 'This browser or device does not support the required authenticator type.' }
    }
    if (msg.includes('SecurityError')) {
      return { credentialId: '', success: false, error: 'Security error: ensure you are on HTTPS and the domain matches.' }
    }
    return { credentialId: '', success: false, error: `Fingerprint registration failed: ${msg}` }
  }
}

/**
 * Verify an existing platform authenticator (fingerprint).
 */
export async function verifyFingerprint(
  credentialIdB64: string,
  onProgress?: (pct: number) => void
): Promise<{ success: boolean; error?: string }> {
  if (!window.PublicKeyCredential) {
    return { success: false, error: 'WebAuthn is not supported in this browser.' }
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32))

  let rawId: Uint8Array
  try {
    rawId = Uint8Array.from(atob(credentialIdB64), (c) => c.charCodeAt(0))
  } catch {
    return { success: false, error: 'Invalid stored credential. Please re-register your fingerprint.' }
  }

  const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    allowCredentials: [
      {
        id: rawId as unknown as ArrayBuffer,
        type: 'public-key',
      },
    ],
    userVerification: 'required',
    timeout: 60000,
  }

  let progress = 0
  const progressInterval = setInterval(() => {
    progress = Math.min(progress + 3, 90)
    onProgress?.(progress)
  }, 200)

  try {
    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    })) as PublicKeyCredential | null

    clearInterval(progressInterval)
    onProgress?.(100)

    if (!assertion) {
      return { success: false, error: 'Fingerprint verification was cancelled by user or system.' }
    }

    return { success: true }
  } catch (err: any) {
    clearInterval(progressInterval)
    onProgress?.(0)

    const msg = err?.message || String(err)
    if (msg.includes('NotAllowedError') || msg.includes('cancelled') || msg.includes('abort')) {
      return { success: false, error: 'Verification cancelled. You may have declined the fingerprint prompt or timed out.' }
    }
    if (msg.includes('NotSupportedError')) {
      return { success: false, error: 'This browser or device does not support the required authenticator type.' }
    }
    if (msg.includes('SecurityError')) {
      return { success: false, error: 'Security error: ensure you are on HTTPS and the domain matches.' }
    }
    return { success: false, error: `Fingerprint verification failed: ${msg}` }
  }
}
