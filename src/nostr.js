const verifyNip05 = async (nip05, pubkey) => {
    try {
        const [name, domain] = nip05.split('@');
        const response = await fetch(`https://${domain}/.well-known/nostr.json?name=${name}`);
        const data = await response.json();
        return data?.names?.[name] === pubkey;
    } catch (error) {
        console.error('Error verifying NIP-05:', error);
        return false;
    }
};

const fetchProfile = async (publicKey, setProfile) => {
    const relays = [
        'wss://relay.damus.io',
        'wss://relay.nostr.band',
        'wss://nos.lol'
    ];

    for (const relayUrl of relays) {
        try {
            const profile = await fetchProfileFromRelay(relayUrl, publicKey);
            if (profile) {
                if (!setProfile) {
                    return profile
                } else {
                    setProfile(profile);
                    break;
                }                
            }
        } catch (error) {
            console.error(`Failed to fetch from ${relayUrl}:`, error);
        }
    }
};

const fetchProfileFromRelay = (relayUrl, publicKey) => {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(relayUrl);
        const timeout = setTimeout(() => {
            ws.close();
            resolve(null);
        }, 5000);

        ws.onopen = () => {
            ws.send(JSON.stringify([
                "REQ",
                "profile-req",
                { kinds: [0], authors: [publicKey], limit: 1 }
            ]));
        };

        ws.onmessage = (msg) => {
            try {
                const [type, _, event] = JSON.parse(msg.data);
                if (type === 'EVENT' && event?.kind === 0) {
                    const profile = JSON.parse(event.content);
                    clearTimeout(timeout);
                    ws.close();
                    resolve(profile);
                } else if (type === 'EOSE') {
                    clearTimeout(timeout);
                    ws.close();
                    resolve(null);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        ws.onerror = () => {
            clearTimeout(timeout);
            ws.close();
            resolve(null);
        };
    });
};

export {
    verifyNip05,
    fetchProfile
}