function generateChallenge() {
    return crypto.randomBytes(32).toString('hex');
    // Creates a random string like:
    // "a4813798378470937c98479c378947c398..." 
  }

  async function verifySignature(publicKey, signature, challenge) {
    try {
      const isValid = await secp256k1.schnorr.verify(
        signature,     // 64-byte hex string
        challenge,     // The original challenge
        publicKey      // 32-byte hex string
      );
      return isValid;  // Returns true/false
    } catch (e) {
      console.error('Error verifying:', e);
      return false;
    }
  }

  export {
    generateChallenge,
    verifySignature
  }