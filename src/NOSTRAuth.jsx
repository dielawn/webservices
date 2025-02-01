import React, { useState, useEffect } from 'react';
import './NOSTRAuth.css';
import { verifyNip05, fetchProfile } from './nostr';
import { SIGNER_TYPES, isSignerAvailable, getPublicKey } from './signer';
import { nip05, nip19 } from 'nostr-tools';


const NostrAuth = ({ onLogin, onError, userData, setUserData, profile, setProfile }) => {
    
    const [isVerified, setIsVerified] = useState(false);
    const [npub, setNpub] = useState('');
   
    useEffect(() => {
        async function initializeAlby() {
            try {
                await window.alby.enable();
                const nostr = window.alby.nostr;
                await nostr.enable();
               
                const hexKey = await nostr.getPublicKey();
                
                const hexToNpub = (hex) => {
                    try {
                        return nip19.npubEncode(hex);
                    } catch (error) {
                        console.error('Error converting hex to npub:', error);
                        return null;
                    }
                };
        
                const bech32 = hexToNpub(hexKey)                
                setNpub(bech32)
              
            } catch (error) {
                console.error('Error initializing Alby:', error);
            }
        }
        initializeAlby()

    }, []);


    const checkSignerLogin = async (signerType) => {
        try {
            if (await isSignerAvailable(signerType)) {
                const publicKey = await getPublicKey(signerType);
                if (publicKey) {
                    await fetchProfile(publicKey, setProfile);
                    const newUserData = { publicKey, signerType };
                    setUserData(newUserData);
                    onLogin(newUserData);
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error(`Error checking ${signerType} login:`, error);
            onError?.(error);
            return false;
        }
    };

    const checkAllSigners = async (preferredOrder = [SIGNER_TYPES.ALBY, SIGNER_TYPES.NOS2X]) => {
        for (const signerType of preferredOrder) {
            const success = await checkSignerLogin(signerType);
            if (success) return true;
        }
        return false;
    };

    const handleLogin = async () => {
        const success = await checkAllSigners();
        if (!success) {
            console.log('No supported signers found or login failed');
            onError?.(new Error('No supported signers found or login failed'));
        }
    };

    const handleLogout = () => {
        setUserData(null);
        setProfile(null);
    };

    if (!userData) {
        return (
            <div className="nostr-auth">
                <button 
                    onClick={handleLogin}
                    className="primary-button"
                >
                    Login with Nostr
                </button>
            </div>
        );
    }

    return (
        <div className="nostr-auth">
            <div className="profile-info">
                {profile?.picture && (
                    <img 
                        src={profile.picture} 
                        alt="Profile" 
                        className="profile-picture"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                )}
                <h3 className="welcome-message">
                    Welcome, {profile?.display_name || profile?.name || 'Nostrich'}!
                </h3>
                {profile?.nip05 && (
                    <p className="profile-nip05">
                        {profile.nip05}
                        {isVerified ? 
                            <span className="verified-badge"> ✓</span> : 
                            <span className="unverified-badge"> ⚠</span>
                        }
                    </p>
                )}
                {profile?.about && (
                    <p className="profile-about">{profile.about}</p>
                )}
                <p className="profile-pubkey">
                    {npub.slice(0, 8)}...{npub.slice(-8)}
                </p>
            </div>
            <button 
                onClick={handleLogout}
                className="secondary-button logout-button"
            >
                Logout
            </button>
        </div>
    );
};

export default NostrAuth;