import React, { useState } from 'react';

const AccountRecovery = ({ onRecovered, onError }) => {
  const [method, setMethod] = useState(''); // 'nostr' or 'email'
  const [step, setStep] = useState('select'); // select, verify, complete
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    domain: '',
    newNpub: ''
  });

  const handleNostrRecovery = async () => {
    try {
      setLoading(true);

      if (!window.nostr) {
        throw new Error('Please install a Nostr extension');
      }

      // Get public key from extension
      const publicKey = await window.nostr.getPublicKey();

      // Create recovery event
      const event = {
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['action', 'recover'],
          ['domain', formData.domain]
        ],
        content: 'Account recovery request',
        pubkey: publicKey
      };

      // Get signature
      const signedEvent = await window.nostr.signEvent(event);

      // Send to backend
      const response = await fetch('/api/recover/nostr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ signedEvent })
      });

      if (!response.ok) {
        throw new Error('Recovery failed');
      }

      const result = await response.json();
      onRecovered(result);
      setStep('complete');

    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRecovery = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // First, verify new Nostr key
      if (!window.nostr) {
        throw new Error('Please install a Nostr extension');
      }

      // Get new public key
      const newPublicKey = await window.nostr.getPublicKey();
      
      // Create verification event with new key
      const event = {
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['action', 'recover'],
          ['domain', formData.domain],
          ['email', formData.email]
        ],
        content: 'Email recovery verification',
        pubkey: newPublicKey
      };

      const signedEvent = await window.nostr.signEvent(event);

      // Send recovery request
      const response = await fetch('/api/recover/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signedEvent,
          email: formData.email,
          domain: formData.domain
        })
      });

      if (!response.ok) {
        throw new Error('Recovery request failed');
      }

      // Email verification will be sent
      setStep('verify');

    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailCode = async (code) => {
    try {
      setLoading(true);

      const response = await fetch('/api/recover/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          email: formData.email,
          domain: formData.domain
        })
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const result = await response.json();
      onRecovered(result);
      setStep('complete');

    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-recovery">
      {step === 'select' && (
        <div>
          <h2>Account Recovery</h2>
          <p>Choose your recovery method:</p>
          
          <div className="recovery-options">
            <button
              onClick={() => {
                setMethod('nostr');
                setStep('verify');
              }}
            >
              Recover with Existing Nostr Key
            </button>
            
            <button
              onClick={() => {
                setMethod('email');
                setStep('verify');
              }}
            >
              Recover with Email
            </button>
          </div>
        </div>
      )}

      {step === 'verify' && method === 'nostr' && (
        <div>
          <h3>Verify with Nostr</h3>
          <input
            type="text"
            placeholder="Your domain"
            value={formData.domain}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              domain: e.target.value
            }))}
          />
          <button
            onClick={handleNostrRecovery}
            disabled={loading || !formData.domain}
          >
            {loading ? 'Verifying...' : 'Verify Ownership'}
          </button>
        </div>
      )}

      {step === 'verify' && method === 'email' && (
        <div>
          <h3>Email Recovery</h3>
          <form onSubmit={handleEmailRecovery}>
            <input
              type="email"
              placeholder="Registered email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))}
              required
            />
            <input
              type="text"
              placeholder="Your domain"
              value={formData.domain}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                domain: e.target.value
              }))}
              required
            />
            <button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Recovery Email'}
            </button>
          </form>
        </div>
      )}

      {step === 'complete' && (
        <div>
          <h3>Recovery Complete!</h3>
          <p>Your account has been recovered successfully.</p>
          <p>You can now log in with your Nostr key.</p>
        </div>
      )}
    </div>
  );
};

export default AccountRecovery;