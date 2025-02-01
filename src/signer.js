// Types of supported signers
const SIGNER_TYPES = {
    ALBY: 'Alby',
    NOS2X: 'nos2x',
    NPROFILE: 'NProfile',
    NOSTRI: 'Nostri'
};

// Check if a specific signer is available
const isSignerAvailable = async (signerType) => {
    try {
        switch (signerType) {
            case SIGNER_TYPES.ALBY:
                return !!window.alby;
            case SIGNER_TYPES.NOS2X:
                return !!window.nostr;
            case SIGNER_TYPES.NPROFILE:
                return !!window.nprofile;
            case SIGNER_TYPES.NOSTRI:
                return !!window.nostri;
            default:
                return false;
        }
    } catch (error) {
        console.error('Error checking signer availability:', error);
        return false;
    }
};

// Get public key from specified signer
const getPublicKey = async (signerType) => {
    try {
        switch (signerType) {
            case SIGNER_TYPES.ALBY:
                if (!window.alby) throw new Error('Alby not available');
                await window.alby.enable();
                if (window.alby.nostr) {
                    await window.alby.nostr.enable();
                }
                // Use the NIP-07 interface after enabling Alby
                return await window.nostr.getPublicKey();
                
            case SIGNER_TYPES.NOS2X:
                if (!window.nostr) throw new Error('nos2x not available');
                return await window.nostr.getPublicKey();
                
            case SIGNER_TYPES.NPROFILE:
                if (!window.nprofile) throw new Error('nprofile not available');
                return await window.nprofile.getPublicKey();
                
            case SIGNER_TYPES.NOSTRI:
                if (!window.nostri) throw new Error('nostri not available');
                return await window.nostri.getPublicKey();
                
            default:
                throw new Error(`Unsupported signer type: ${signerType}`);
        }
    } catch (error) {
        console.error('Error getting public key:', error);
        throw error;
    }
};

export {
    SIGNER_TYPES,
    isSignerAvailable,
    getPublicKey
}