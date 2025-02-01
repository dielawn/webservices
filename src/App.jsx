import React from 'react';
import { Monitor, Cloud, Code, Phone, Check, ChevronRight, Mail } from 'lucide-react';
import './App.css';
import BitcoinPrice from './BtcPrice';
import ContactModal from './ContactModal';
import { productList, contactData } from './pricing_data';
import { useState } from 'react';
import NostrAuth from './NOSTRAuth';
import NostrAuthFlow from '../api/authFlow';
import NostrRegistration from './NostrRegistration';
import NostrContactsImport from './NostrContactsImport';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profile, setProfile] = useState(null);

  const handleLogin = (authInfo) => {
    console.log('Logged in with public key:', authInfo.publicKey);
    // Handle successful login
  };

  const handleRegister = (publicKey) => {
    console.log('Registered:', publicKey)
  }

  const handleError = (error) => {
    console.error('Login error:', error);
    // Handle error (show toast, alert, etc.)
  };


  return (
    <div className="page-container">

      <NostrRegistration  
        userData={userData}  
        profile={profile}
        onError={handleError}
        onRegister={handleRegister}
        onLogin={handleLogin}
        setUserData={setUserData}
        setProfile={setProfile}
      />
      <NostrAuth 
        onLogin={handleLogin}
        onError={handleError}
        userData={userData}
        setUserData={setUserData}
        profile={profile}
        setProfile={setProfile}
      />
     
      {/* Hero Section
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
          <div className="hero-">            
            <p>Web Design & Hosting on a bitcoin standard</p>
          </div>
        </div>
      </header> */}

       {/* Web Design Section
       <section id="wd-pricing" className="web-design-section">
        <h2>Web Design Packages</h2>
        <div className="pricing-grid">         
         {productList.map((pkg, index) => (
           pkg.category === 'Web Design' &&
           <div key={index} className="pricing-card">
           <h3>{pkg.name}</h3>
           {pkg.price === 'Custom' ? <p className='price'>{pkg.price} Pricing<span><br></br></span></p> : 
           <>
             <BitcoinPrice className="price" usdAmount={pkg.price} isReOccuring={pkg.isReOccuring}/> 
           </>
           }             
           <ul>
             {pkg.features.map((feature, index) => (
               <li key={index}><Check className="check-icon" /> {feature}</li>
             ))}
           </ul>
           <button className="btn btn-primary">{pkg.price === 'Custom' ? 'Get Started' : 'Buy Now' }</button>
         </div>
          ))}         
        </div>
      </section> */}

      {/* Features Section
      <section id="features" className="features-section">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          
          <div className="feature-card">
            <Cloud className="feature-icon" />
            <h3>Minimal User Data Storage</h3>
            <p>Rest easy knowing we can't loose your sensitive data because we don't have it!</p>
          </div>
          <div className="feature-card">
            <Monitor className="feature-icon" />
            <h3>Self Service</h3>
            <p>NOSTR Registration & login combined with Bitcoin Lightning payments.</p>
          </div>
          <div className="feature-card">
            <Code className="feature-icon" />
            <h3>Security</h3>
            <p>Natural 2FA - Key & Domain access</p>
          </div>
        </div>
      </section> */}

      {/* Pricing Section */}
      {/* <section id="wh-pricing" className="pricing-section">
        <h2>Hosting</h2>
        <div className="pricing-grid">
        {productList.map((pkg, index) => (
            pkg.category === 'Hosting' && 
            <div key={index} className="pricing-card">
              <h3>{pkg.name}</h3>              
              {pkg.price === 'Custom' ? <p className='price'>{pkg.price} Pricing<span><br></br></span></p> : 
              <>
                <BitcoinPrice className="price" usdAmount={pkg.price} isReOccuring={pkg.isReOccuring}/> 
              </>
              
              }
              <ul>
                {pkg.features.map((feature, index) => (
                  <li key={index}><Check className="check-icon"/>{feature}</li>
                ))}
              </ul>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
             {pkg.price === 'Custom' ? 'Get Started' : 'Buy Now' }
            </button>
            </div>
          ))}
          
        </div>
      </section> */}

     

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
            <li><a href="#">Web Design</a></li>
              <li><a href="#">Web Hosting</a></li>
              {/* <li><a href="#">Domain Names</a></li> */}
              <li><a href="#">SSL Certificates</a></li>
              
            </ul>
          </div>
          <div className="footer-section">
            <h4>Powered By:</h4>
            <p>NOSTR</p>
            <p>Strike</p>
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