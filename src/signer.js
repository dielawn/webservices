// Types of supported signers
const SIGNER_TYPES = {
    ALBY: 'Alby',
    NOS2X: 'nos2x',
    NPROFILE: 'NProfile',
    NOSTRI: 'Nostri'
};

// Check if a specific signer is available
const isSignerAvailable = (signerType) => {
    console.log('signerType', signerType)
    switch (signerType) {
        case SIGNER_TYPES.ALBY:
            return !!window.nostr;
        case SIGNER_TYPES.NOS2X:
            return !!window.nostr;
        case SIGNER_TYPES.NPROFILE:
            return !!window.nprofile;
        case SIGNER_TYPES.NOSTRI:
            return !!window.nostri;
        default:
            return false;
    }
};

// Get public key from specified signer
const getPublicKey = async (signerType) => {
    switch (signerType) {
        case SIGNER_TYPES.ALBY:
        case SIGNER_TYPES.NOS2X:
            return await window.nostr.getPublicKey();
        case SIGNER_TYPES.NPROFILE:
            return await window.nprofile.getPublicKey();
        case SIGNER_TYPES.NOSTRI:
            return await window.nostri.getPublicKey();
        default:
            throw new Error(`Unsupported signer type: ${signerType}`);
    }
};

export {
    SIGNER_TYPES,
    isSignerAvailable,
    getPublicKey
}

