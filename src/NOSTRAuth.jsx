import React, { useState, useEffect } from 'react';
import './NOSTRAuth.css'
import { verifyNip05, fetchProfile } from './nostr';
import { SIGNER_TYPES, isSignerAvailable, getPublicKey } from './signer';

const NostrAuth = ({ onLogin, onError }) => {
    const [userData, setUserData] = useState(null);
    const [profile, setProfile] = useState(null);
    const [isVerified, setIsVerified] = useState(false);

    // useEffect(() => {
    //     checkSignerLogin(SIGNER_TYPES.ALBY) // default alby
    // }, []);

    useEffect(() => {
        console.log('profile', profile, userData)
        if (profile?.nip05 && userData?.publicKey) {
            verifyNip05(profile.nip05, userData.publicKey)
                .then(setIsVerified);
        }
    }, [profile, userData]);


    const checkSignerLogin = async (signerType) => {
        try {
            if (isSignerAvailable(signerType)) {
                const publicKey = await getPublicKey(signerType);
                if (publicKey) {
                    const profile = await fetchProfile(publicKey);
                    setProfile(profile);
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

    const checkAllSigners = async (customOrder) => {
        const defaultOrder = [
            SIGNER_TYPES.ALBY,
            SIGNER_TYPES.NOS2X,
            SIGNER_TYPES.NPROFILE,
            SIGNER_TYPES.NOSTRI
        ];
        
        const preferredOrder = customOrder || defaultOrder;
        
        for (const signerType of defaultOrder) {
            const success = await checkSignerLogin(signerType);
            if (success) return true;
        }
        return false;
    };

    const handleLogin = async () => {
        const success = await checkAllSigners({
            fetchProfile,
            setUserData,
            onLogin
        });
        
        if (!success) {
            console.log('No supported signers found or login failed');
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
                    Public Key: {userData.publicKey.slice(0, 8)}...
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