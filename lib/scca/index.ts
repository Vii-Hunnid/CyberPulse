/**
 * SCCA Vault Integration
 * All encryption, decryption, and integrity verification is delegated to the
 * external SCCA Vault API (https://scca-black.vercel.app).
 *
 * Auth:    Authorization: Bearer <SCCA_API_KEY>
 * Context: "cyberpulse" for scan data, "cyberpulse-integrity" for findings integrity
 */

const SCCA_API_URL = (process.env.SCCA_API_URL ?? 'https://scca-black.vercel.app').replace(/\/$/, '');
const SCCA_API_KEY = process.env.SCCA_API_KEY ?? '';
const SCAN_CONTEXT = 'cyberpulse';
const INTEGRITY_CONTEXT = 'cyberpulse-integrity';

interface EncryptResponse {
  tokens: string[];
  merkleRoot: string;
  context: string;
  metadata: {
    itemCount: number;
    originalBytes: number;
    encryptedBytes: number;
    compressionRatio: number;
    cipher: string;
  };
}

interface DecryptItem {
  content: string;
  sequence: number;
  timestamp: string;
  contentHash: string;
}

interface DecryptResponse {
  data: DecryptItem[];
  context: string;
}

interface VerifyResponse {
  valid: boolean;
  merkleRootMatch: boolean;
  computedRoot: string;
  tokenCount: number;
  errors: string[];
}

/** Stored blob format for scan data */
interface VaultBlob {
  tokens: string[];
  merkleRoot: string;
}

async function vaultPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${SCCA_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SCCA_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`SCCA Vault error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Encrypts a scan result object via the SCCA Vault.
 * Returns a JSON string containing the tokens and merkle root for storage.
 */
export async function encryptScanData(data: object): Promise<string> {
  const result = await vaultPost<EncryptResponse>('/api/scca/vault/encrypt', {
    data: JSON.stringify(data),
    context: SCAN_CONTEXT,
  });

  const blob: VaultBlob = { tokens: result.tokens, merkleRoot: result.merkleRoot };
  return JSON.stringify(blob);
}

/**
 * Decrypts a stored blob (produced by encryptScanData) back to the original object.
 */
export async function decryptScanData(blob: string): Promise<object> {
  const { tokens } = JSON.parse(blob) as VaultBlob;

  const result = await vaultPost<DecryptResponse>('/api/scca/vault/decrypt', {
    tokens,
    context: SCAN_CONTEXT,
  });

  return JSON.parse(result.data[0].content) as object;
}

/**
 * Encrypts an array of finding fingerprints and returns a stored integrity blob.
 * The blob (tokens + merkle root) is saved alongside the scan record.
 */
export async function buildIntegrityRoot(items: string[]): Promise<string> {
  const result = await vaultPost<EncryptResponse>('/api/scca/vault/encrypt', {
    data: items,
    context: INTEGRITY_CONTEXT,
  });

  const blob: VaultBlob = { tokens: result.tokens, merkleRoot: result.merkleRoot };
  return JSON.stringify(blob);
}

/**
 * Verifies that the stored integrity blob has not been tampered with.
 * Calls SCCA /verify which re-runs the Merkle-HMAC chain over stored tokens.
 */
export async function verifyIntegrityRoot(
  _items: string[],
  storedRoot: string
): Promise<boolean> {
  try {
    const { tokens, merkleRoot } = JSON.parse(storedRoot) as VaultBlob;

    const result = await vaultPost<VerifyResponse>('/api/scca/vault/verify', {
      tokens,
      merkleRoot,
      context: INTEGRITY_CONTEXT,
    });

    return result.valid;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// SSE streaming helper (unchanged — no SCCA dependency)
// ---------------------------------------------------------------------------

export function createSSEStream(): import('../../types').SSEEmitter {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController | null = null;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
    },
  });

  const emitter = {
    send(event: string, data: unknown) {
      if (!controller) return;
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      try {
        controller.enqueue(encoder.encode(payload));
      } catch {
        // stream already closed
      }
    },
    close() {
      try {
        controller?.close();
      } catch {
        // already closed
      }
    },
    get stream() {
      return stream;
    },
  };

  return emitter;
}
