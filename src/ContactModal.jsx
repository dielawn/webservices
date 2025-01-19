import './ContactModal.css'
import React, { useState } from 'react';
import LightningPaywall from './LightningPaywall';

const ContactModal = ({ isOpen, onClose, buttonText = "Submit" }) => {
    const [isPaid, setIsPaid] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, message: '' });

    try {
      const response = await fetch('https://www.rockymountainwebservices.com/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setStatus({
          submitting: false,
          message: data.message
        });
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: '',
          package: '',
        });
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setStatus({ submitting: false, message: '' });
        }, 2000);
      } else {
        throw new Error(data.message);
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
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>Contact Us</h2>
        <p>Tell us about your project and we'll get back to you shortly.</p>

        {!isPaid ? (
          <LightningPaywall 
            amount={100} 
            onPaymentSuccess={() => setIsPaid(true)} 
          />
        ) : (
       
        <form onSubmit={handleSubmit}>
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
              <option value="hosting-basic">Hosting - Basic ($9.99/mo)</option>
              <option value="hosting-pro">Hosting - Pro ($24.99/mo)</option>
              <option value="hosting-enterprise">Hosting - Enterprise ($49.99/mo)</option>
              <option value="design-single">Web Design - Single Page ($999)</option>
              <option value="design-three">Web Design - Three Page ($2,499)</option>
              <option value="design-custom">Web Design - Custom</option>
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