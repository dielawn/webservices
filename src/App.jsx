import React from 'react';
import { Monitor, Cloud, Code, Phone, Check, ChevronRight, Mail } from 'lucide-react';
import './App.css';
import BitcoinPrice from './BtcPrice';
import ContactModal from './ContactModal';
import { useState } from 'react';
import { webHostingPkgs, webDesignPkgs, contactData } from './pricing_data';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="page-container">
      {/* Hero Section */}
      <header className="hero">
        <nav className="nav-container">
          <div className="nav-content">
            <div className="logo">R.M.W.S</div>
            <div className="nav-links">
              <a href="#services">Services</a>
              <a href="#features">Features</a>
              <a href="#wd-pricing">Pricing</a>
              <a href="#contact">Contact</a>
            </div>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              Get Started
            </button>
          </div>
        </nav>
        
        <div className="hero-content">
          <h1>Rocky Mountain Web Services</h1>
          <p>Elevate Your Digital Presence with Mountain-Strong Reliability</p>
          <div className="hero-buttons">
            <button className="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </header>

       {/* Web Design Section */}
       <section id="wd-pricing" className="web-design-section">
        <h2>Web Design Packages</h2>
        <div className="pricing-grid">
         
         {webDesignPkgs.map((pkg, index) => (
            <div key={index} className="pricing-card">
              <h3>{pkg.name}</h3>
              {pkg.price === 'Custom' ? <p className='price'>{pkg.price} Pricing<span><br></br>*bitcoin preferred, 10% premium for $</span></p> : 
              <>
                <BitcoinPrice className="price" usdAmount={pkg.price} isReOccuring={pkg.isReOccuring}/> 
                <p className='price'>${pkg.price}<span>/one-time <br></br>*bitcoin preferred, 10% premium for $</span></p>
              </>
              
              }
              
              
              <ul>
                {pkg.features.map((feature, index) => (
                  <li key={index}><Check className="check-icon" /> {feature}</li>
                ))}
              </ul>
              <button className="btn btn-primary">Get Started</button>
            </div>
          ))}
         
         
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          
          <div className="feature-card">
            <Cloud className="feature-icon" />
            <h3>99.9% Uptime</h3>
            <p>Rest easy knowing your website is always available with our reliable hosting infrastructure.</p>
          </div>
          <div className="feature-card">
            <Monitor className="feature-icon" />
            <h3>Custom Design & Web Hosting</h3>
            <p>User-friendly human to help realize your digital vision.</p>
          </div>
          <div className="feature-card">
            <Code className="feature-icon" />
            <h3>Expert Support</h3>
            <p>24/7 technical support from our experienced human.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="wh-pricing" className="pricing-section">
        <h2>Hosting</h2>
        <div className="pricing-grid">
        {webHostingPkgs.map((pkg, index) => (
            <div key={index} className="pricing-card">
              <h3>{pkg.name}</h3>              
              {pkg.price === 'Custom' ? <p className='price'>{pkg.price} Pricing<span><br></br>*bitcoin preferred, 10% premium for $</span></p> : 
              <>
                <BitcoinPrice className="price" usdAmount={pkg.price} isReOccuring={pkg.isReOccuring}/> 
                <p className='price'>${pkg.price}<span>/one-time <br></br>*bitcoin preferred, 10% premium for $</span></p>
              </>
              
              }
              <ul>
                {pkg.features.map((feature, index) => (
                  <li key={index}><Check className="check-icon"/>{feature}</li>
                ))}
              </ul>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              Get Started
            </button>
            </div>
          ))}
          
        </div>
      </section>

     

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <h2>Contact Us</h2>
        <div className="contact-container">
          <div className="contact-info">
            <div className="info-item">
              <Phone className="contact-icon" />
              <div>
                <h3>Phone</h3>
                <p>{contactData.phone}</p>
              </div>
            </div>
            <div className="info-item">
              <Mail className="contact-icon" />
              <div>
                <h3>Email</h3>
                <p>{contactData.email}</p>
              </div>
            </div>
          </div>
          <form className="contact-form">
            <div className="form-row">
              <input type="text" placeholder="Name" />
              <input type="email" placeholder="Email" />
            </div>
            <textarea placeholder="Message" rows="4"></textarea>
            <button className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>R.M.W.S.</h4>
            <p>Your trusted partner for reliable web hosting and design solutions.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><a href="#">Web Hosting</a></li>
              {/* <li><a href="#">Domain Names</a></li> */}
              <li><a href="#">SSL Certificates</a></li>
              <li><a href="#">Web Design</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Newsletter</h4>
            <p>Subscribe to our newsletter for updates and offers.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button className="btn btn-primary">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Rocky Mountain Web Services. All rights reserved.</p>
        </div>
      </footer>
      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        buttonText="Submit"
      />
    </div>
  );
};

export default App;