import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './LightningPaywall.css';
import { paywallPrices } from './pricing_data';

const NostrLightningPaywall = ({ 
  onPaymentSuccess, 
  paymentType = 'registration', // 'registration', 'recovery', or 'contact'
  apiBaseUrl = 'http://localhost:3000'
}) => {
  const [invoice, setInvoice] = useState(null);
  const [status, setStatus] = useState('initial');
  const [error, setError] = useState(null);
  const [qrLoaded, setQrLoaded] = useState(false);

  // Set amount based on payment type
  const getAmount = () => {
    const priceItem = paywallPrices.find(item => item.type === paymentType);
    return priceItem ? priceItem.price : 1000; // Default to 1000 if type not found
  };
  // Get memo based on payment type
  const getMemo = () => {
    const priceItem = paywallPrices.find(item => item.type === paymentType);
    return priceItem ? priceItem.description : 'Nostr Hosting Payment';
  };

  // Create invoice when component mounts
  useEffect(() => {
    createInvoice();
  }, [paymentType]);

  // Check payment status
  useEffect(() => {
    let interval;
    if (invoice && status === 'pending') {
      interval = setInterval(checkPaymentStatus, 2000);
    }
    return () => clearInterval(interval);
  }, [invoice, status]);

  const createInvoice = async () => {
    try {
      setStatus('loading');
      const response = await fetch(`${apiBaseUrl}/create-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: getAmount(),
          memo: getMemo(),
          paymentType, // Send to backend to track payment purpose
        })
      });

      const data = await response.json();
      if (data.success) {
        setInvoice(data.invoice);
        setStatus('pending');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError('Failed to create invoice. Please try again.');
      setStatus('error');
    }
  };

  useEffect(() => {
    let timeout;
    if (invoice && status === 'pending') {
      // Cancel payment after invoice expires
      timeout = setTimeout(() => {
        setStatus('expired');
        setError('Payment expired. Please try again.');
      }, invoice.expiryMinutes * 60 * 1000);
    }
    return () => clearTimeout(timeout);
  }, [invoice]);

  const checkPaymentStatus = async () => {
    if (!invoice) return;

    try {
      const response = await fetch(`${apiBaseUrl}/check-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          paymentType // Include payment type for verification
        })
      });

      const data = await response.json();
      if (data.success && data.paid) {
        setStatus('paid');
        // Pass payment data to parent component
        onPaymentSuccess({
          invoiceId: invoice.id,
          paymentHash: data.paymentHash,
          paymentType,
          amount: getAmount()
        });
      }
    }  catch (err) {
        if (retries > 0) {
          setTimeout(() => checkPaymentStatus(retries - 1), 2000);
        } else {
          console.error('Error checking payment status:', err);
        }
      }
  };

  const getPaymentMessage = () => {
    switch (paymentType) {
      case 'registration':
        return 'Pay to create your hosting account';
      case 'recovery':
        return 'Pay to recover your account';
      default:
        return 'Payment required';
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="loading-message">
        Generating payment request...
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="lightning-paywall error">
        <p>{error}</p>
        <button onClick={createInvoice} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  // Payment pending state
  if (status === 'pending' && invoice) {
    return (
      <div className="lightning-paywall">
        <h3>{getPaymentMessage()}</h3>
        <p className="amount">Amount: {getAmount()} sats</p>
        
        <div className="qr-container">
            {!qrLoaded && <div className="qr-loading">Loading QR Code...</div>}
            <QRCodeSVG 
                value={invoice.paymentRequest} 
                size={256} 
                onLoad={() => setQrLoaded(true)}
            />
        </div>

        <div className="payment-details">
          <p className="instructions">Scan with a Lightning wallet</p>
          <button 
            onClick={() => window.open(`lightning:${invoice.paymentRequest}`)}
            className="btn btn-secondary"
          >
            Open in Wallet
          </button>
        </div>

        <div className="payment-text">
          <p>Expires in: {invoice.expiryMinutes} minutes</p>
          {paymentType === 'recovery' && (
            <p className="note">
              This payment is required after multiple failed recovery attempts.
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default NostrLightningPaywall;