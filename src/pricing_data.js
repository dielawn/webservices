const productList = [
    {
        name: 'Single Page',
        price: 999,
        isReOccuring: false,
        features: ['One-page Website', 'Mobile Responsive', 'Contact Form', 'Basic SEO Setup', '2 Web Revisions', '1 Month Free Hosting'],
        category: 'Web Design'
    },
    {
        name: 'Three Page',
        price: 2499,
        isReOccuring: false,
        features: ['Three-page Website', 'Mobile Responsive','Contact Form', 'Advanced SEO Setup', '4 Web Revisions', '3 Month Free Hosting', 'Basic Analytics Setup', 'Social Media Integration' ],
        category: 'Web Design'
    },
    {
        name: 'Custom',
        price: 'Custom',
        isReOccuring: false,
        features: ['Unlimited Pages', 'Custom Functionality', 'E-commerce Options', 'Advanced SEO Strategy', 'Unlimited Revisions', '6 Months Free Hosting', 'Full Analytics Setup', 'Custom Integrations'],
        category: 'Web Design'
    },
    {
        name: 'Basic',
        price: 9.99,
        isReOccuring: true,
        features: ['10GB Storage', '1 Website', 'Free SSL Certificates', 'Word Press'],
        category: 'Hosting'
    },
    {
        name: 'Pro',
        price: 19.99,
        isReOccuring: true,
        features: ['25GB Storage', '3 Websites', 'Free SSL Certificates', 'Word Press'],
        category: 'Hosting'
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        isReOccuring: true,
        features: ['Custom Storage', 'Custom number of Websites', 'Free SSL Certificates', 'Word Press'],
        category: 'Hosting'
    }

]

const paywallPrices = [
    {
      type: 'registration',
      price: 1000,
      description: 'New account registration'
    },
    {
      type: 'recovery',
      price: 500,
      description: 'Account recovery'
    },
    {
      type: 'contact',
      price: 100,
      description: 'Contact form access'
    }
  ];

const contactData = {
    email: 'dillon@rockymountainwebservices.com',
    phone: '4068230774',
    lnad: 'dmercill@strike.me',
    npub: '',
    
}

export {
    productList,
    contactData,
    paywallPrices
}