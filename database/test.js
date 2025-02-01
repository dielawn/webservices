// test.js
import { PersistentDatabaseManager, Status } from './database.js';

async function testDatabase() {
    const dbManager = new PersistentDatabaseManager('./test-database');
    
    try {
        await dbManager.init();
        
        const customer = await dbManager.createCustomer({
            email: 'test@example.com',
            publicKey: 'testkey123',
            planId: 'basic-plan'
        });
        console.log('Created Customer:', customer);
        
        const account1 = await dbManager.createCPanelAccount({
            username: 'testuser1',
            domain: 'test1.com',
            customerId: customer.id
        });
        
        const account2 = await dbManager.createCPanelAccount({
            username: 'testuser2',
            domain: 'test2.com',
            customerId: customer.id
        });
        
        console.log('Created Accounts:', account1, account2);
        
        const customerAccounts = await dbManager.getCustomerCPanelAccounts(customer.id);
        console.log('Customer Accounts:', customerAccounts);
        
        const updatedCustomer = await dbManager.updateCustomer(customer.id, {
            email: 'updated@example.com'
        });
        console.log('Updated Customer:', updatedCustomer);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// testDatabase();