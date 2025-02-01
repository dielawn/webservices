import React, { useState } from 'react';
import * as NostrTools from 'nostr-tools';

const RELAYS = [
    'wss://relay.damus.io/',
    'wss://relay.nostr.band/',
    'wss://nos.lol/'
];

// Utility functions
const connectToRelay = (url) => {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(url);
        
        ws.onopen = () => {
            console.log(`Connected to ${url}`);
            resolve(ws);
        };
        
        ws.onerror = (error) => {
            console.error(`Failed to connect to ${url}:`, error);
            reject(error);
        };
    });
};

const parseContactList = (event) => {
    const contactTags = event.tags.filter(tag => tag[0] === 'p');
    return contactTags.map(tag => ({
        pubkey: tag[1],
        relayUrl: tag[2] || '',
        petname: tag[3] || ''
    }));
};

const publishToRelay = async (relay, event) => {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(relay);
        
        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error('Timeout'));
        }, 5000);

        ws.onopen = () => {
            console.log(`Connected to ${relay} for publishing`);
            ws.send(JSON.stringify(["EVENT", event]));
        };

        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            if (data[0] === 'OK' && data[1] === event.id) {
                clearTimeout(timeout);
                ws.close();
                resolve();
            }
        };

        ws.onerror = (error) => {
            clearTimeout(timeout);
            ws.close();
            reject(error);
        };
    });
};

const NostrContactsImport = () => {
    const [oldPubkey, setOldPubkey] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [contacts, setContacts] = useState(null);
    const [contactList, setContactList] = useState([]);

    const fetchContacts = async () => {
        const activeConnections = [];
        try {
            setLoading(true);
            setStatus('Fetching contacts...');
            setContactList([]);

            let publicKey = oldPubkey;
            if (oldPubkey.startsWith('npub')) {
                const { data } = NostrTools.nip19.decode(oldPubkey);
                publicKey = data;
            }

            const subId = Math.random().toString(36).substring(7);
            const filter = {
                kinds: [3],
                authors: [publicKey],
                limit: 1
            };
            
            const request = JSON.stringify([
                "REQ",
                subId,
                filter
            ]);

            console.log('Request:', request);
            const events = [];

            const connectionPromises = RELAYS.map(async (url) => {
                try {
                    const ws = await connectToRelay(url);
                    activeConnections.push(ws);

                    ws.onmessage = (msg) => {
                        try {
                            const data = JSON.parse(msg.data);
                            if (data[0] === 'EVENT' && data[1] === subId) {
                                const event = data[2];
                                console.log('Raw event data:', event);
                                
                                const contactsData = parseContactList(event);
                                console.log('Parsed contacts:', contactsData);
                                
                                events.push(event);
                            }
                        } catch (error) {
                            console.error('Error parsing message:', error);
                        }
                    };

                    ws.send(request);
                } catch (error) {
                    console.warn(`Failed to connect to ${url}:`, error);
                }
            });

            await Promise.allSettled(connectionPromises);
            await new Promise(resolve => setTimeout(resolve, 3000));

            activeConnections.forEach(ws => {
                try {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                } catch (error) {
                    console.warn('Error closing connection:', error);
                }
            });

            if (events.length > 0) {
                const latestEvent = events.sort((a, b) => b.created_at - a.created_at)[0];
                const contacts = parseContactList(latestEvent);
                setContacts(latestEvent);
                setContactList(contacts);
                setStatus(`Found ${contacts.length} contacts! Click Import to add them to your new account.`);
            } else {
                setStatus('No contact list found for this public key');
            }

        } catch (error) {
            console.error('Error fetching contacts:', error);
            setStatus('Error fetching contacts: ' + error.message);
        } finally {
            activeConnections.forEach(ws => {
                try {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.close();
                    }
                } catch (error) {
                    console.warn('Error closing connection:', error);
                }
            });
            setLoading(false);
        }
    };

    const importContacts = async () => {
        if (!contacts) {
            setStatus('Please fetch contacts first');
            return;
        }

        try {
            setLoading(true);
            setStatus('Preparing contact list for import...');

            const event = {
                kind: 3,
                created_at: Math.floor(Date.now() / 1000),
                tags: contacts.tags,
                content: JSON.stringify({}),
                pubkey: ''
            };

            if (!window.nostr) {
                throw new Error('Nostr extension not found');
            }

            await window.nostr.enable();
            const signedEvent = await window.nostr.signEvent(event);

            const publishPromises = RELAYS.map(relay => 
                publishToRelay(relay, signedEvent)
                    .catch(error => {
                        console.warn(`Failed to publish to ${relay}:`, error);
                        return false;
                    })
            );

            const results = await Promise.all(publishPromises);
            
            if (results.some(result => result !== false)) {
                setStatus('Successfully imported contacts! They should appear in your client soon.');
            } else {
                throw new Error('Failed to publish to any relay');
            }

        } catch (error) {
            console.error('Error importing contacts:', error);
            setStatus('Error importing contacts: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4">Import Contacts from Old Account</h2>
            
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                    Old Account Public Key (npub or hex):
                </label>
                <input
                    type="text"
                    value={oldPubkey}
                    onChange={(e) => setOldPubkey(e.target.value)}
                    placeholder="npub1... or hex public key"
                    className="w-full p-2 border rounded"
                    disabled={loading}
                />
            </div>

            <div className="flex space-x-4 mb-4">
                <button
                    onClick={fetchContacts}
                    disabled={loading || !oldPubkey}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Working...' : 'Fetch Contacts'}
                </button>

                {contacts && (
                    <button
                        onClick={importContacts}
                        disabled={loading}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                        Import to New Account
                    </button>
                )}
            </div>

            {status && (
                <div className="p-4 border rounded bg-gray-50">
                    {status}
                </div>
            )}

            {/* Contact List Preview */}
            {contactList.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Found Contacts:</h3>
                    <div className="max-h-60 overflow-y-auto">
                        {contactList.map((contact, index) => (
                            <div key={index} className="p-2 border-b">
                                <div className="font-mono text-sm">
                                    {NostrTools.nip19.npubEncode(contact.pubkey)}
                                </div>
                                {contact.petname && (
                                    <div className="text-sm text-gray-600">
                                        Petname: {contact.petname}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Debug information */}
            <div className="mt-4 text-sm text-gray-500">
                <details>
                    <summary>Debug Info</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {contacts ? JSON.stringify(contacts, null, 2) : 'No contacts loaded'}
                    </pre>
                </details>
            </div>
        </div>
    );
};

export default NostrContactsImport; 