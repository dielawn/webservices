import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export class CustomerService {
  // Create a new customer with their nostr public key
  async createCustomer(nostrPubKey) {
    try {
      const customer = await prisma.customer.create({
        data: {
          nostrPubKey,
        },
      })
      return customer
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Customer with this nostr public key already exists')
      }
      throw error
    }
  }

  // Associate a cPanel account with a customer
  async addCPanelAccount(customerId, username, domain) {
    return await prisma.cPanelAccount.create({
      data: {
        username,
        domain,
        customerId,
      },
    })
  }

  // Get all cPanel accounts for a customer
  async getCustomerAccounts(nostrPubKey) {
    return await prisma.customer.findUnique({
      where: {
        nostrPubKey,
      },
      include: {
        cPanelAccounts: true,
      },
    })
  }

  // Update last login for a cPanel account
  async updateLastLogin(username) {
    return await prisma.cPanelAccount.update({
      where: {
        username,
      },
      data: {
        lastLogin: new Date(),
      },
    })
  }
}
