// registrationHandler.js
import express from 'express';
import { verifySignature } from './verifyNostrSig.js';
import { PersistentDatabaseManager } from '../database/database.js';
const router = express.Router();
const dbManager = new PersistentDatabaseManager('./database');

router.post('/api/register', async (req, res) => {
  console.log('made it to register')
  const { signedEvent, formData } = req.body;
  console.log('signature', signedEvent)
  console.log('formData', formData)
  
  try {
    // Initialize database if not already initialized
    await dbManager.init();

    // Check if email already exists
    const existingCustomers = await dbManager.db.list(dbManager.db.collections.customers);
    const emailExists = existingCustomers.some(customer => customer.email === formData.email);
    if (emailExists) {
        return res.status(400).json({ error: 'Email already exists' });
    }

    // Verify the Nostr signature
    const isValid = await verifySignature(signedEvent);
    if (!isValid) {
        return res.status(400).json({ error: 'Invalid signature' });
    }

    // Verify that the pubkey matches
    if (signedEvent.pubkey !== formData.publicKey) {
        return res.status(400).json({ error: 'Public key mismatch' });
    }

    // Create customer record
    const customer = await dbManager.createCustomer({
        email: formData.email,
        publicKey: formData.publicKey,
        planId: formData.package,
        status: 'ACTIVE'
    });

    return res.status(200).json({
        message: 'Registration successful',
        customerId: customer.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

export default router;