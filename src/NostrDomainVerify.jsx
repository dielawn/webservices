import React, { useState } from 'react';
import { SimplePool, verifySignature } from 'nostr-tools';

const NostrDomainVerifier = ({ onVerified }) => {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('input'); // input, verify, or complete
  const [verificationCode, setVerificationCode] = useState('');
  
  const generateVerificationCode = (pubkey, domain) => {
    // Create a unique verification code combining pubkey and domain
    return `nostr-verify-${pubkey.slice(0, 8)}-${Math.random().toString(36).slice(2, 10)}`;
  };

  const startVerification = async () => {
    try {
      setLoading(true);

      // 1. Get user's public key
      if (!window.nostr) {
        throw new Error('Please install a Nostr extension');
      }
      const publicKey = await window.nostr.getPublicKey();

      // 2. Generate verification code
      const code = generateVerificationCode(publicKey, domain);
      setVerificationCode(code);

      // 3. Move to verification step
      setStep('verify');

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyDomain = async () => {
    try {
      setLoading(true);
      const publicKey = await window.nostr.getPublicKey();

      // 1. Create verification event
      const event = {
        kind: 27235, // Custom kind for domain verification
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['d', domain],
          ['verification', verificationCode]
        ],
        content: `Verifying ownership of ${domain}`,
        pubkey: publicKey
      };

      // 2. Get signature
      const signedEvent = await window.nostr.signEvent(event);
      
      // 3. Verify DNS record or file exists
      const verificationMethod = await checkVerificationMethod(domain, verificationCode);
      if (!verificationMethod) {
        throw new Error('Verification record not found. Please add the DNS TXT record or verification file first.');
      }

      // 4. Success! Notify parent component
      onVerified({
        publicKey,
        domain,
        signedEvent,
        verificationMethod
      });

      setStep('complete');

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const checkVerificationMethod = async (domain, code) => {
    try {
      // Try DNS verification first
      const dnsResult = await verifyDNS(domain, code);
      if (dnsResult) return 'dns';

      // Fall back to file verification
      const fileResult = await verifyFile(domain, code);
      if (fileResult) return 'file';

      return null;
    } catch (error) {
      console.error('Verification check failed:', error);
      return null;
    }
  };

  const verifyDNS = async (domain, code) => {
    try {
      // In real implementation, you'd query DNS TXT records
      // This is a placeholder for demonstration
      const response = await fetch(`/api/check-dns?domain=${domain}&code=${code}`);
      return response.ok;
    } catch {
      return false;
    }
  };

  const verifyFile = async (domain, code) => {
    try {
      // Check if verification file exists at domain/.well-known/nostr-verify.txt
      const response = await fetch(`https://${domain}/.well-known/nostr-verify.txt`);
      const content = await response.text();
      return content.includes(code);
    } catch {
      return false;
    }
  };

  const getInstructions = () => {
    return (
      <div className="instructions">
        <p>Add one of the following verifications:</p>
        
        <div className="verification-method">
          <h3>Method 1: DNS TXT Record</h3>
          <p>Add a TXT record to your domain with:</p>
          <code>nostr-verify={verificationCode}</code>
        </div>

        <div className="verification-method">
          <h3>Method 2: Verification File</h3>
          <p>Create a file at:</p>
          <code>https://{domain}/.well-known/nostr-verify.txt</code>
          <p>With content:</p>
          <code>{verificationCode}</code>
        </div>
      </div>
    );
  };

  return (
    <div className="nostr-verifier">
      {step === 'input' && (
        <div>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter your domain"
            disabled={loading}
          />
          <button 
            onClick={startVerification}
            disabled={loading || !domain}
          >
            {loading ? 'Loading...' : 'Verify Domain'}
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div>
          {getInstructions()}
          <button 
            onClick={verifyDomain}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Check Verification'}
          </button>
        </div>
      )}

      {step === 'complete' && (
        <div>
          <p>✅ Domain verified successfully!</p>
          <p>You can now access your cPanel.</p>
        </div>
      )}
    </div>
  );
};

export default NostrDomainVerifier;