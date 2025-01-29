import React, { useState } from 'react';
import { SimplePool } from 'nostr-tools';

const NostrRegistration = ({ onRegister, onError }) => {
  const [step, setStep] = useState('verify'); // verify, details, confirm
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    domain: '',
    package: '',  // cPanel package name
    email: '',
    publicKey: ''
  });

  const verifyNostr = async () => {
    try {
      setLoading(true);
      
      if (!window.nostr) {
        throw new Error('Please install a Nostr extension');
      }

      // Get public key from Nostr extension
      const publicKey = await window.nostr.getPublicKey();
      
      // Create verification event
      const event = {
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: 'Hosting account registration verification',
        pubkey: publicKey
      };

      // Get signature
      const signedEvent = await window.nostr.signEvent(event);

      setFormData(prev => ({ ...prev, publicKey }));
      setStep('details');

    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create signed event with account details
      const event = {
        kind: 27235,
        created_at: Math.floor(Date.now() / 1000),
        tags: [
          ['domain', formData.domain],
          ['username', formData.username],
          ['package', formData.package],
          ['email', formData.email]
        ],
        content: 'Hosting account registration',
        pubkey: formData.publicKey
      };

      const signedEvent = await window.nostr.signEvent(event);

      // Send to backend
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          signedEvent,
          formData
        })
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const result = await response.json();
      onRegister(result);
      setStep('confirm');

    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Validate username format for cPanel
  const validateUsername = (username) => {
    return /^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(username) && username.length <= 16;
  };

  return (
    <div className="registration-form">
      {step === 'verify' && (
        <div>
          <h2>Verify your Nostr identity</h2>
          <p>First, let's connect your Nostr identity to your new hosting account.</p>
          <button 
            onClick={verifyNostr}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Connect with Nostr'}
          </button>
        </div>
      )}

      {step === 'details' && (
        <form onSubmit={handleSubmit}>
          <h2>Account Details</h2>
          
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                username: e.target.value.toLowerCase()
              }))}
              pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
              maxLength="16"
              required
            />
            <small>Letters, numbers, and hyphens only. Max 16 characters.</small>
          </div>

          <div className="form-group">
            <label>Domain:</label>
            <input
              type="text"
              value={formData.domain}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                domain: e.target.value.toLowerCase()
              }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Package:</label>
            <select
              value={formData.package}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                package: e.target.value
              }))}
              required
            >
              <option value="">Select a package</option>
              <option value="basic">Basic Hosting</option>
              <option value="premium">Premium Hosting</option>
              {/* Add your actual packages here */}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading || !validateUsername(formData.username)}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}

      {step === 'confirm' && (
        <div>
          <h2>Account Created Successfully!</h2>
          <p>Your hosting account has been created and linked to your Nostr identity.</p>
          <p>You can now log in to cPanel using your Nostr key.</p>
        </div>
      )}
    </div>
  );
};

export default NostrRegistration;