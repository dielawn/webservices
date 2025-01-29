// Frontend authentication flow
class NostrAuth {
    constructor(apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl;
    }

    async login() {
        try {
            // Check if nostr is available (NIP-07)
            if (!window.nostr) {
                throw new Error('Nostr extension not found');
            }

            // Get public key from extension
            const publicKey = await window.nostr.getPublicKey();

            // Step 1: Request challenge
            const challengeResponse = await fetch(`${this.apiBaseUrl}/auth/challenge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ publicKey })
            });

            const { challenge } = await challengeResponse.json();

            // Step 2: Sign challenge
            const signature = await window.nostr.signMessage(challenge);

            // Step 3: Verify signature and get token
            const verifyResponse = await fetch(`${this.apiBaseUrl}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    publicKey,
                    challenge,
                    signature
                })
            });

            const { token } = await verifyResponse.json();

            // Store token
            localStorage.setItem('jwt', token);
            return token;

        } catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        }
    }
}

// // Usage example
// const auth = new NostrAuth('https://api.yourserver.com');

// document.getElementById('loginButton').addEventListener('click', async () => {
//     try {
//         await auth.login();
//         console.log('Successfully logged in!');
//     } catch (error) {
//         console.error('Login failed:', error);
//     }
// });