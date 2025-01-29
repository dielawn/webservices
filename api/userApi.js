// userApi.js
const express = require('express');
const { User } = require('./userStorage');
const { verifySignature } = require('nostr-tools');

const router = express.Router();

// Register new user
router.post('/api/users', async (req, res) => {
  try {
    const { signedEvent, formData } = req.body;

    // Verify Nostr signature
    if (!verifySignature(signedEvent)) {
      throw new Error('Invalid signature');
    }

    // Create user in database
    const user = await User.createUser({
      npub: signedEvent.pubkey,
      domain: formData.domain,
      cpanelUsername: formData.username,
      email: formData.email,
      package: formData.package
    });

    res.json({
      success: true,
      user: {
        npub: user.npub,
        domain: user.domain,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Verify user login
router.post('/api/users/verify', async (req, res) => {
  try {
    const { signedEvent } = req.body;

    // Verify signature
    if (!verifySignature(signedEvent)) {
      throw new Error('Invalid signature');
    }

    // Find user
    const user = await User.findByNpub(signedEvent.pubkey);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user can login
    if (!user.canLogin()) {
      throw new Error('Account is not active');
    }

    // Record login
    await user.recordLogin();

    res.json({
      success: true,
      user: {
        domain: user.domain,
        cpanelUsername: user.cpanelUsername
      }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Get user details
router.get('/api/users/:npub', async (req, res) => {
  try {
    const user = await User.findByNpub(req.params.npub);
    if (!user) {
      throw new Error('User not found');
    }

    res.json({
      success: true,
      user: {
        domain: user.domain,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        status: user.status
      }
    });

  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;