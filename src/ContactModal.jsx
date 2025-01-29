import './ContactModal.css';
import React, { useState, useEffect } from 'react';
import LightningPaywall from './LightningPaywall';
import { productList } from './pricing_data';
import BitcoinPrice from './BtcPrice'; // Added missing import

const ContactModal = ({ isOpen, onClose, buttonText = "Submit" }) => {
  const [paymentState, setPaymentState] = useState({
    isPaid: false,
    paymentHash: null,
    paymentExpiry: null
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    package: '',
  });

  const [status, setStatus] = useState({
    submitting: false,
    message: ''
  });

  // Check payment expiry
  useEffect(() => {
    if (paymentState.paymentExpiry && paymentState.isPaid) {
      const now = Date.now();
      if (now > paymentState.paymentExpiry) {
        setPaymentState({
          isPaid: false,
          paymentHash: null,
          paymentExpiry: null
        });
      }
    }
  }, [paymentState.paymentExpiry]);

  const handlePaymentSuccess = (paymentData) => {
    setPaymentState({
      isPaid: true,
      paymentHash: paymentData.paymentHash,
      paymentExpiry: Date.now() + (30 * 60 * 1000) // 30 minutes expiry
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, message: '' });

    try {
      // Include payment verification with form submission
      const response = await fetch('https://www.rockymountainwebservices.com/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          paymentHash: paymentState.paymentHash // Include payment verification
        })
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          submitting: false,
          message: 'Thank you! We will be in touch soon.'
        });
        
        // Reset form and payment state
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: '',
          package: '',
        });
        
        // Close modal after success
        setTimeout(() => {
          onClose();
          setStatus({ submitting: false, message: '' });
          setPaymentState({
            isPaid: false,
            paymentHash: null,
            paymentExpiry: null
          });
        }, 2000);
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (error) {
      setStatus({
        submitting: false,
        message: error.message || 'Something went wrong. Please try again.'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target.className === 'modal-overlay') onClose();
    }}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Contact Us</h2>
        <p>Tell us about your project and we'll get back to you shortly.</p>

        {!paymentState.isPaid ? (
          <div className="paywall-container">
            <p>A small payment of 100 sats is required to prevent spam.</p>
            <LightningPaywall 
              amount={100} 
              onPaymentSuccess={handlePaymentSuccess}
              apiBaseUrl="https://www.rockymountainwebservices.com"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name *"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email *"
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                />
              </div>
            </div>

            <div className="form-group">
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company Name"
              />
            </div>

            <div className="form-group">
              <select
                name="package"
                value={formData.package}
                onChange={handleChange}
                required
              >
                <option value="">Select Package *</option>
                {productList.map((pkg, index) => (
                  <option key={index} value={pkg.name}>
                    {pkg.category} - {pkg.name}
                    <BitcoinPrice 
                      className="price" 
                      usdAmount={pkg.price} 
                      isReOccuring={pkg.isReOccuring}
                    />
                  </option>
                ))}     
              </select>
            </div>

            <div className="form-group">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your project *"
                rows="4"
                required
              ></textarea>
            </div>

            {status.message && (
              <div className={`status-message ${status.submitting ? 'submitting' : ''}`}>
                {status.message}
              </div>
            )}
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={status.submitting}
            >
              {status.submitting ? 'Sending...' : buttonText}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactModal;