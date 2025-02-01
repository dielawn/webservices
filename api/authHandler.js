import express from 'express';
import { PersistentDatabaseManager } from '../database/database.js';
const baseUrl = import.meta.env.VITE_SERVER_URL
const router = express.Router();
const dbManager = new PersistentDatabaseManager('./database');

router.post(`${baseUrl}}/api/auth/verify`, async (req, res) => {
    const { publicKey } = req.body;
    console.log('auth verify')
    try {
        await dbManager.init();
        const customer = await dbManager.getCustomerByPublicKey(publicKey);
        
        if (customer) {
            return res.status(200).json({
                authenticated: true,
                customer: {
                    id: customer.id,
                    email: customer.email,
                    status: customer.status,
                    planId: customer.planId
                }
            });
        }
        
        return res.status(401).json({
            authenticated: false,
            error: 'Public key not found'
        });
        
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            authenticated: false,
            error: 'Authentication failed'
        });
    }
});