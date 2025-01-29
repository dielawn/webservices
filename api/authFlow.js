// authFlow.js
import { SimplePool } from 'nostr-tools';

class NostrAuthFlow {
  constructor(config = {}) {
    this.apiBaseUrl = config.apiBaseUrl || '/api';
  }

  async handleAuth(authInfo) {
    try {
      // First, check if user exists
      const userResponse = await fetch(`${this.apiBaseUrl}/check-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publicKey: authInfo.publicKey
        })
      });

      const userData = await userResponse.json();

      if (userData.exists) {
        // User exists - proceed with login
        return await this.handleLogin(authInfo, userData);
      } else {
        // User doesn't exist - proceed with registration flow
        return {
          needsRegistration: true,
          publicKey: authInfo.publicKey
        };
      }
    } catch (error) {
      throw new Error(`Auth flow failed: ${error.message}`);
    }
  }

  async handleLogin(authInfo, userData) {
    try {
      // Verify the sign-in event
      const loginResponse = await fetch(`${this.apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          publicKey: authInfo.publicKey,
          signedEvent: authInfo.signedEvent,
          signerType: authInfo.signerType
        })
      });

      if (!loginResponse.ok) {
        throw new Error('Login failed');
      }

      const loginData = await loginResponse.json();

      return {
        success: true,
        user: {
          publicKey: authInfo.publicKey,
          domain: userData.domain,
          cpanelUsername: userData.cpanelUsername
        },
        sessionData: loginData.session
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async registerUser(registrationData) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
}

export default NostrAuthFlow;