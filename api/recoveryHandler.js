// recoveryHandler.js
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { User } = require('./userStorage');
const { verifySignature } = require('nostr-tools');

const router = express.Router();

// Store recovery codes temporarily
const recoveryTokens = new Map();

// Email configuration
const transporter = nodemailer.createTransport({
  // Configure your email service
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Recovery with existing Nostr key
router.post('/api/recover/nostr', async (req, res) => {
  const { signedEvent } = req.body;

  try {
    // Verify signature
    if (!verifySignature(signedEvent)) {
      throw new Error('Invalid signature');
    }

    // Get domain from event tags
    const domainTag = signedEvent.tags.find(tag => tag[0] === 'domain');
    if (!domainTag) {
      throw new Error('Domain not specified');
    }
    const domain = domainTag[1];

    // Find user by domain
    const user = await User.findByDomain(domain);
    if (!user) {
      throw new Error('Account not found');
    }

    // Verify this is the registered Nostr key
    if (user.npub !== signedEvent.pubkey) {
      throw new Error('Invalid Nostr key for this account');
    }

    // Reset account if needed
    user.status = 'active';
    await user.save();

    res.json({
      success: true,
      message: 'Account recovered successfully'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Initiate email recovery
router.post('/api/recover/email', async (req, res) => {
  const { signedEvent, email, domain } = req.body;

  try {
    // Verify new key signature
    if (!verifySignature(signedEvent)) {
      throw new Error('Invalid signature');
    }

    // Find user
    const user = await User.findByDomain(domain);
    if (!user) {
      throw new Error('Account not found');
    }

    // Verify email matches
    if (user.email !== email) {
      throw new Error('Email does not match records');
    }

    // Generate recovery token
    const recoveryToken = crypto.randomBytes(32).toString('hex');
    
    // Store token with new public key
    recoveryTokens.set(recoveryToken, {
      userId: user._id,
      newNpub: signedEvent.pubkey,
      expires: Date.now() + 3600000 // 1 hour expiry
    });

    // Send recovery email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Account Recovery Code',
      text: `Your recovery code is: ${recoveryToken}\nThis code will expire in 1 hour.`
    });

    res.json({
      success: true,
      message: 'Recovery email sent'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Verify recovery code
router.post('/api/recover/verify', async (req, res) => {
  const { code, email, domain } = req.body;

  try {
    // Get recovery data
    const recoveryData = recoveryTokens.get(code);
    if (!recoveryData) {
      throw new Error('Invalid or expired recovery code');
    }

    // Check expiry
    if (Date.now() > recoveryData.expires) {
      recoveryTokens.delete(code);
      throw new Error('Recovery code expired');
    }

    // Find user
    const user = await User.findOne({
      _id: recoveryData.userId,
      email,
      domain
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update Nostr key
    user.npub = recoveryData.newNpub;
    user.status = 'active';
    await user.save();

    // Clean up
    recoveryTokens.delete(code);

    res.json({
      success: true,
      message: 'Account recovered successfully'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;