# nostr
public key / private key 
    hex - standard for interacting with nostr
    bech32 - user recognizability  public key/nsec

hash
    sha-256
    used for digital signatures, challenges, nostrId w/ private key

events 
        {
            id: nostrId,
            pubkey: hex public key
            created_at: UTC
            kind: 1,    // https://nostrdata.github.io/kinds/
            tags: [],
            content: 'GM',
            sig: 
        }

tags
    e = event
    p = another user
    a = addressable or replaceable event
    {
    "tags": [
        ["e",   // event 
        "5c83da77af...c27f5a77226f36", // 32-bytes lowercase hex of the id of another event
         "wss://nostr.example.com"], // recommended realy
        ["p", "f7234bd4c13.....4fb06676e9ca"], // 
        ["a", "30023:f7234b....676e9ca:abcd", "wss://nostr.example.com"],
        ["alt", "reply"],
        // ...
    ],
    // ...
    }

relays
    a websocket server

# backend
api           
    paywall.js
        /paywall
    strikeApi.js
        /create-invoice
        /check-invoice            

    serverApi.js
        /challenge
        /verify:signature, challenge,  public key

    nostrAuth.js
        /profile: public key   

    registrationHandler.js    
        /new-user
        /recover-user
        /delete-user
    userApi.js
        /check: public key 
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

# database
database/
├── customers/
│   ├── {customer-id}.json
│   └── ...
├── cpanel-accounts/
│   ├── {account-id}.json
│   └── ...
├── plans/
└── payments/



# models 
    model Customer {
    id              String   hash or @id @default(uuid()) 
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

        


        
  

    
