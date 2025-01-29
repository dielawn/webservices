// paymentHandler.js
const express = require('express');
const router = express.Router();

// Track payments and their purposes
const paymentTracker = new Map();

router.post('/create-invoice', async (req, res) => {
  try {
    const { amount, memo, paymentType } = req.body;

    // Existing Strike invoice creation code
    const response = await fetch('https://api.strike.me/v1/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRIKE_API_KEY}`
      },
      body: JSON.stringify({
        amount: {
          amount: amount.toString(),
          currency: 'BTC'
        },
        description: memo
      })
    });

    const invoice = await response.json();

    // Track the payment type
    paymentTracker.set(invoice.id, {
      paymentType,
      amount,
      created: Date.now(),
      used: false
    });

    res.json({
      success: true,
      invoice: {
        id: invoice.id,
        paymentRequest: invoice.lnInvoice,
        expiryMinutes: 60 // Adjust as needed
      }
    });

  } catch (error) {
    console.error('Invoice creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice'
    });
  }
});

router.post('/check-invoice', async (req, res) => {
  try {
    const { invoiceId, paymentType } = req.body;

    // Get payment tracking info
    const paymentInfo = paymentTracker.get(invoiceId);
    if (!paymentInfo) {
      return res.json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Your existing Strike payment verification code
    const response = await fetch(`https://api.strike.me/v1/invoices/${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.STRIKE_API_KEY}`
      }
    });

    const invoice = await response.json();

    if (invoice.state === 'PAID') {
      // Verify payment hasn't been used before
      if (paymentInfo.used) {
        return res.json({
          success: false,
          message: 'Payment already used'
        });
      }

      // Mark payment as used
      paymentInfo.used = true;
      paymentTracker.set(invoiceId, paymentInfo);

      // Return success with payment hash
      res.json({
        success: true,
        paid: true,
        paymentHash: invoice.paymentHash,
        paymentType: paymentInfo.paymentType
      });
    } else {
      res.json({
        success: true,
        paid: false
      });
    }

  } catch (error) {
    console.error('Payment check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status'
    });
  }
});

// Cleanup old payment tracking data periodically
setInterval(() => {
  const now = Date.now();
  for (const [invoiceId, info] of paymentTracker.entries()) {
    if (now - info.created > 24 * 60 * 60 * 1000) { // 24 hours
      paymentTracker.delete(invoiceId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

module.exports = router;