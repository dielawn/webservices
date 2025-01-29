// server.js
require('dotenv').config();  // This loads your .env file
const express = require('express');
const CPanelIntegration = require('./cPanelIntegration');

const app = express();
app.use(express.json());

// Initialize cPanel integration with your credentials
const cpanel = new CPanelIntegration({
  whmHost: process.env.WHM_HOST || 'your.server.com',  // Your WHM host
  whmUsername: process.env.WHM_USERNAME || 'root',      // Usually 'root'
  whmApiToken: process.env.WHM_NOSTR_AUTH_TOKEN        // Your saved token
});

// Test endpoint to verify connection
app.get('/api/test-connection', async (req, res) => {
  try {
    // Try to list accounts as a test
    const testResult = await cpanel.validateAccount('test');
    res.json({ success: true, message: 'WHM connection successful' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'WHM connection failed', 
      error: error.message 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});