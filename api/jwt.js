import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

async function handleLogin(req, res) {
    const { publicKey, signature, challenge } = req.body;

    // verify the signature
    const isValid = await verifyNostrSignature(publicKey, signature, challenge);

    if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
    }

    // create JWT
    const token = jwt.sign(
        {
            sub: publicKey,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 *60) // 24 hours
        },
        JWT_SECRET
    );
    return res.json({ token });
}



// // Example flow

// // Server generate a challenge
// const challenge = crypto.randomBytes(32).toString('hex');

// //User signs it using nip-07
// const publicKey = await window.nostr.getPublicKey();
// const signature = await window.nostr.signMessage(challenge);

// //Server verifies the signature
// const isValid = await verifySignature(publicKey, signature, challenge);