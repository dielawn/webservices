// Required dependencies
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';

// Initialize environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Constants
const STRIKE_API_BASE = 'https://api.strike.me/v1';
const STRIKE_API_KEY = process.env.STRIKE_API_KEY;

// Utility function to make Strike API requests
async function strikeRequest(endpoint, options = {}) {
    const url = `${STRIKE_API_BASE}${endpoint}`;
    const headers = {
        'Authorization': `Bearer ${STRIKE_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`Strike API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
}

// Check invoice status endpoint
app.post('/check-invoice', async (req, res) => {
    try {
        const { invoiceId } = req.body;

        if (!invoiceId) {
            return res.status(400).json({
                success: false,
                message: 'Invoice ID is required'
            });
        }

        const response = await strikeRequest(`/invoices/${invoiceId}`);

        res.json({
            success: true,
            paid: response.state === 'PAID'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Create invoice endpoint
app.post('/create-invoice', async (req, res) => {
    try {
        const { amount, memo } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: 'Amount is required'
            });
        }

        // Create Strike invoice
        const invoiceResponse = await strikeRequest('/invoices', {
            method: 'POST',
            body: JSON.stringify({
                amount: {
                    currency: 'USD',
                    amount: amount / 100 // Convert sats to USD
                },
                description: memo || 'Contact Form Access',
                correlationId: `rmwh_${Date.now()}`
            })
        });

        // Get BOLT11 invoice
        const quoteResponse = await strikeRequest(`/invoices/${invoiceResponse.invoiceId}/quote`, {
            method: 'POST'
        });

        res.json({
            success: true,
            invoice: {
                id: invoiceResponse.invoiceId,
                paymentRequest: quoteResponse.lnInvoice,
                expiryMinutes: 60
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});