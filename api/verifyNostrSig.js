// verifyNostrSig.js
import { schnorr } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';

async function verifySignature(event) {
  try {
    // Debug input
    console.log('\nVerifying Nostr event:', JSON.stringify(event, null, 2));

    // 1. Serialize the event
    const serializedEvent = new TextEncoder().encode(
      JSON.stringify([
        0,
        event.pubkey,
        event.created_at,
        event.kind,
        event.tags,
        event.content
      ])
    );

    // 2. Calculate the event hash
    const eventHash = sha256(serializedEvent);
    const calculatedId = bytesToHex(eventHash);

    console.log('\nVerification details:');
    console.log('1. Calculated event ID:', calculatedId);
    console.log('2. Provided event ID:', event.id);
    
    // 3. Verify the event ID matches
    if (calculatedId !== event.id) {
      console.log('Event ID mismatch!');
      return false;
    }

    // 4. Convert hex strings to Uint8Arrays
    const signature = hexToBytes(event.sig);
    const pubkey = hexToBytes(event.pubkey);

    // 5. Verify using schnorr
    const isValid = schnorr.verify(
      signature,
      eventHash,
      pubkey
    );

    console.log('3. Signature verification result:', isValid);
    return isValid;

  } catch (error) {
    console.error('\nVerification error:', error);
    return false;
  }
}

function hexToBytes(hex) {
  if (typeof hex !== 'string') {
    throw new Error('Expected string, got ' + typeof hex);
  }
  
  hex = hex.replace('0x', '');
  
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const j = i * 2;
    bytes[i] = parseInt(hex.slice(j, j + 2), 16);
  }
  return bytes;
}

export { verifySignature };