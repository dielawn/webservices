// nostrCPanelAuth.js
const express = require('express');
const { verifySignature } = require('nostr-tools');
const CPanelIntegration = require('./cPanelIntegration');

const router = express.Router();

const cpanel = new CPanelIntegration({
  whmHost: process.env.WHM_HOST,
  whmUsername: process.env.WHM_USERNAME,
  whmApiToken: process.env.WHM_API_TOKEN
});

router.post('/verify-and-login', async (req, res) => {
  const { signedEvent, domain } = req.body;

  try {
    // 1. Verify Nostr event signature
    if (!verifySignature(signedEvent)) {
      throw new Error('Invalid signature');
    }

    // 2. Extract username from domain
    const username = domain.split('.')[0]; // Or your naming scheme

    // 3. Validate cPanel account exists
    const accountExists = await cpanel.validateAccount(username);
    if (!accountExists) {
      throw new Error('cPanel account not found');
    }

    // 4. Verify domain ownership (DNS or file method)
    const isDomainVerified = await verifyDomainOwnership(domain, signedEvent);
    if (!isDomainVerified) {
      throw new Error('Domain verification failed');
    }

    // 5. Create cPanel session
    const session = await cpanel.createUserSession(username);

    // 6. Return session URL to client
    res.json({
      success: true,
      sessionUrl: session.url
    });

  } catch (error) {
    console.error('Authentication failed:', error);
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

async function verifyDomainOwnership(domain, signedEvent) {
  // Implementation of your domain verification logic
  // This could check DNS TXT records or verification file
  // Return true if verified, false otherwise
  return true; // Placeholder
}

module.exports = router;