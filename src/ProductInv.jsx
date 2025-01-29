import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './cart.css';

const ProductInv = ({ onPaymentSuccess, cart = [], apiBaseUrl = 'http://localhost:3000' }) => {
  const [invoice, setInvoice] = useState(null);
  const [status, setStatus] = useState('initial');
  const [error, setError] = useState(null);

  // Create invoice when component mounts
  useEffect(() => {
    if (cart && cart.length > 0) {
      createInvoice();
    }
  }, [cart]);

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
      const cartString = cart.map(item => `${item.name} (${item.qty})`).join(', ');
      
      const response = await fetch(`${apiBaseUrl}/create-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: cart.reduce((total, item) => total + (item.price * item.qty), 0),
          memo: `Purchase: ${cartString}`,
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
      const response = await fetch(`${apiBaseUrl}/check-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id
        })
      });

      const data = await response.json();
      if (data.success && data.paid) {
        setStatus('paid');
        onPaymentSuccess();
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

  // Calculate total amount
  const totalAmount = cart.reduce((total, item) => total + (item.price * item.qty), 0);

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
        <h3>Pay {totalAmount} sats</h3>
        <div className="cart-summary">
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                <span className="item-name">{item.name}</span>
                <span className="item-qty">x{item.qty}</span>
                <span className="item-price">{item.price * item.qty} sats</span>
              </li>
            ))}
          </ul>
          <div className="total">
            <span>Total:</span>
            <span>{totalAmount} sats</span>
          </div>
        </div>
        
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
          <p>Expires in: {invoice.expiryMinutes} minutes</p>
        </div>
      </div>
    );
  }

  return null;
};

export default ProductInv;

// *******              Example Usage           ********//

// const MyCheckout = () => {
//     const cart = [
//       { name: "Product 1", price: 1000, qty: 2 },
//       { name: "Product 2", price: 500, qty: 1 }
//     ];
  
//     const handlePaymentSuccess = () => {
//       // Handle successful payment
//       console.log('Payment successful!');
//     };
  
//     return (
//       <ProductInv 
//         cart={cart}
//         onPaymentSuccess={handlePaymentSuccess}
//         apiBaseUrl="http://localhost:3000"
//       />
//     );
//   };