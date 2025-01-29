// userStorage.js
const { Schema, model } = require('mongoose');

// User Schema
const userSchema = new Schema({
  npub: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  domain: {
    type: String,
    required: true,
    unique: true
  },
  cpanelUsername: {
    type: String,
    required: true,
    unique: true
  },
  email: String,
  package: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  relays: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending'],
    default: 'active'
  }
});

// Add methods for user management
userSchema.methods = {
  // Update last login
  async recordLogin() {
    this.lastLogin = new Date();
    await this.save();
  },

  // Check if user can login
  canLogin() {
    return this.status === 'active';
  }
};

// Static methods for user operations
userSchema.statics = {
  // Find user by Nostr public key
  async findByNpub(npub) {
    return this.findOne({ npub });
  },

  // Find user by domain
  async findByDomain(domain) {
    return this.findOne({ domain });
  },

  // Create new user
  async createUser({ npub, domain, cpanelUsername, email, package: pkg }) {
    return this.create({
      npub,
      domain,
      cpanelUsername,
      email,
      package: pkg,
      relays: []  // Can be updated later
    });
  }
};

const User = model('User', userSchema);

module.exports = { User };

// Example usage:
/*
// Registration
const user = await User.createUser({
  npub: 'npub1...',
  domain: 'example.com',
  cpanelUsername: 'user123',
  email: 'user@example.com',
  package: 'basic'
});

// Login
const user = await User.findByNpub('npub1...');
if (user && user.canLogin()) {
  await user.recordLogin();
  // Proceed with login
}
*/