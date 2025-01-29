// registrationHandler.js
const express = require('express');
const { verifySignature } = require('nostr-tools');
const CPanelIntegration = require('./cPanelIntegration');

const router = express.Router();

const cpanel = new CPanelIntegration({
  whmHost: process.env.WHM_HOST,
  whmUsername: process.env.WHM_USERNAME,
  whmApiToken: process.env.WHM_NOSTR_AUTH_TOKEN
});

router.post('/api/register', async (req, res) => {
  const { signedEvent, formData } = req.body;

  try {
    const handleRegistration = async (userData) => {
      // Show paywall
      showPaywallModal(PaywallComponent);
    };
    // 1. Verify Nostr signature
    if (!verifySignature(signedEvent)) {
      throw new Error('Invalid signature');
    }

    // 2. Validate username format
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(formData.username)) {
      throw new Error('Invalid username format');
    }

    // 3. Check if account already exists
    const exists = await cpanel.validateAccount(formData.username);
    if (exists) {
      throw new Error('Username already taken');
    }

    // 4. Create account using WHM API
    const params = new URLSearchParams();
    params.append('api.version', '1');
    params.append('username', formData.username);
    params.append('domain', formData.domain);
    params.append('plan', formData.package);
    params.append('pkgname', formData.package);
    params.append('savepkg', '1');
    params.append('featurelist', 'default');
    params.append('email', formData.email);
    // Add more parameters as needed

    const response = await cpanel.makeWHMRequest('GET', '/json-api/createacct', params);

    if (!response.status) {
      throw new Error(response.errors || 'Account creation failed');
    }

    // 5. Store Nostr association
    // You might want to store this in a database
    const nostrAssociation = {
      username: formData.username,
      publicKey: signedEvent.pubkey,
      createdAt: new Date().toISOString()
    };

    // 6. Return success response
    res.json({
      success: true,
      message: 'Account created successfully',
      username: formData.username,
      domain: formData.domain
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;