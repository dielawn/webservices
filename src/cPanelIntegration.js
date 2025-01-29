// cPanelIntegration.js
const https = require('https');
const crypto = require('crypto');

class CPanelIntegration {
  constructor(config) {
    this.config = {
      whmHost: config.whmHost,
      whmUsername: config.whmUsername,
      whmApiToken: config.whmApiToken,
      port: config.port || 2087
    };
  }

  // Create a new cPanel session for a user
  async createUserSession(username) {
    const params = new URLSearchParams();
    params.append('api.version', '1');
    params.append('user', username);
    params.append('service', 'cpaneld');

    const response = await this.makeWHMRequest('GET', '/json-api/create_user_session', params);
    
    if (response.status) {
      return {
        url: response.data.url,
        token: response.data.cp_security_token
      };
    } else {
      throw new Error(response.errors || 'Failed to create session');
    }
  }

  // Validate if a cPanel account exists
  async validateAccount(username) {
    const params = new URLSearchParams();
    params.append('api.version', '1');
    params.append('search', username);
    params.append('searchtype', 'user');

    const response = await this.makeWHMRequest('GET', '/json-api/listaccts', params);
    return response.data && response.data.acct && 
           response.data.acct.some(account => account.user === username);
  }

  // Get account details including domain
  async getAccountDetails(username) {
    const params = new URLSearchParams();
    params.append('api.version', '1');
    params.append('user', username);

    const response = await this.makeWHMRequest('GET', '/json-api/accountsummary', params);
    if (response.data && response.data.acct && response.data.acct[0]) {
      return response.data.acct[0];
    }
    throw new Error('Account not found');
  }

  // Make authenticated request to WHM API
  makeWHMRequest(method, endpoint, params) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.config.whmHost,
        port: this.config.port,
        path: `${endpoint}?${params.toString()}`,
        method: method,
        headers: {
          'Authorization': `WHM ${this.config.whmUsername}:${this.config.whmApiToken}`
        },
        rejectUnauthorized: true  // Always verify SSL in production
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            if (parsedData.status === 0 || parsedData.errors) {
              reject(new Error(parsedData.errors || 'API request failed'));
            } else {
              resolve(parsedData);
            }
          } catch (e) {
            reject(new Error('Failed to parse response: ' + e.message));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`WHM API request failed: ${error.message}`));
      });

      // Set timeout for the request
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  // Generate a secure URL for direct cPanel access
  generateSecureURL(username, domain) {
    const timestamp = Math.floor(Date.now() / 1000);
    const token = this.generateSecurityToken(username, timestamp);
    
    return `https://${domain}:2083/cpsess${token}/execute/`;
  }

  // Generate a security token for the URL
  generateSecurityToken(username, timestamp) {
    const data = `${username}:${timestamp}:${this.config.whmApiToken}`;
    return crypto
      .createHash('sha256')
      .update(data)
      .digest('hex');
  }
}

module.exports = CPanelIntegration;

// Example usage:
/*
const cpanel = new CPanelIntegration({
  whmHost: 'your.server.com',
  whmUsername: 'root',
  whmApiToken: 'YOUR_API_TOKEN'
});

async function testConnection() {
  try {
    // Test account validation
    const isValid = await cpanel.validateAccount('username');
    console.log('Account exists:', isValid);

    if (isValid) {
      // Get account details
      const details = await cpanel.getAccountDetails('username');
      console.log('Account details:', details);

      // Create a session
      const session = await cpanel.createUserSession('username');
      console.log('Session URL:', session.url);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}
*/