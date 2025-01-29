# webhosting

# backend
api           
    paywall.js
        /paywall
    strikeApi.js
        /create-invoice
        /check-invoice            
        
    serverApi.js
        /challenge
        /verify:signature, challenge, npub

    nostrAuth.js
        /profile:npub   

    registrationHandler.js    
        /new-user
        /recover-user
        /delete-user
    userApi.js
        /check:npub 
    hostingPkgs.js
    jwt.js


# frontend
    home
        nostrAuth.jsx
            checkSignerLogin()
            handleLogin()
            handleLogout()
            checkAlbyLogin()
        signer.js
            isSignerAvailable()
            getPublicKey()
        nostr.js            
            verifyNip05()
            fetchProfile()
                fetchProfileFromRelay()
    user
        profile.jsx
            cPanel Accounts 
                active - access available
                expired - access denied until payment
                suspended - access denied until review      
    product 
        products.jsx
            selectPkg()                                        
            buyPkg() 
        products.js                                          
                               
    errors
        unauthorized user - signature failure
        paymentfailure                


# products
    1. web storage
        basic: 10gb, 1 cPanel account, 



# models 
    model Customer {
    id              String   @id @default(uuid())
    publicKey       String   @unique
    email           String?  @unique
    status          Status   @default(ACTIVE)
    currentPlan     Plan     @relation(fields: [planId], references: [id])
    planId          String
    cPanelAccounts  CPanelAccount[]
    payments        Payment[]
    createdAt       DateTime @default(now())
    updatedAt       DateTime @updatedAt
    }

    model CPanelAccount {
        id              String   @id @default(uuid())
        username        String   @unique
        domain          String?
        status          Status   @default(ACTIVE)
        resourceUsage   Json?    // Store current resource usage metrics
        customerId      String
        customer        Customer @relation(fields: [customerId], references: [id])
        createdAt       DateTime @default(now())
        updatedAt       DateTime @updatedAt
    }

    model Plan {
        id              String   @id @default(uuid())
        name            String
        storage         Int      // in GB
        bandwidth       Int      // in GB
        price          Float
        billingCycle    String   // monthly, yearly
        customers       Customer[]
        createdAt       DateTime @default(now())
        updatedAt       DateTime @updatedAt
    }

        


        
  

    
