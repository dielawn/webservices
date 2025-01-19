import './LightningPaywall.css';
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const LightningPaywall = ({ onPaymentSuccess, amount = 100 }) => {
  const [invoice, setInvoice] = useState(null);
  const [status, setStatus] = useState('initial');
  const [error, setError] = useState(null);

  // Convert USD to sats for display (Strike uses USD)
  const usdToSats = (usd) => {
    // This should ideally fetch the current exchange rate
    // For now using a rough estimate
    return Math.floor(usd * 100);
  };

  // Create invoice when component mounts
  useEffect(() => {
    createInvoice();
  }, []);

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
      const response = await fetch('https://your-domain.com/api/create-invoice.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount, // Amount in sats
          memo: 'Contact Form Access - RMWH',
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

  const checkPaymentStatus = async () => {
    if (!invoice) return;

    try {
      const response = await fetch('https://your-domain.com/api/check-payment.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id
        })
      });

      const data = await response.json();
      if (data.paid) {
        setStatus('paid');
        onPaymentSuccess();
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

  if (status === 'loading') {
    return <div className="lightning-paywall">Generating payment request...</div>;
  }

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

  if (status === 'pending' && invoice) {
    return (
      <div className="lightning-paywall">
        <h3>Pay {amount} sats to access contact form</h3>
        <div className="qr-container">
          <QRCodeSVG value={invoice.paymentRequest} size={256} />
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
          <p>Amount: {amount} sats</p>
          <p>Expires in: {invoice.expiryMinutes} minutes</p>
        </div>
      </div>
    );
  }

  return null;
};

export default LightningPaywall;