import React, { useState, useEffect } from 'react';
import './BtcPrice.css'
import { fetchStrikeRate } from './btcPrice';

const BitcoinPrice = ({ onPriceUpdate, usdAmount, isReOccuring }) => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [satsPerDollar, setSatsPerDollar] = useState(null);
  
  const discountPercent = .1

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const rate = await fetchStrikeRate();
        setPrice(rate);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch Bitcoin price');
        setLoading(false);
      }
    };
  
    fetchPrice();
    
    // Then fetch every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
  
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [onPriceUpdate]);

  useEffect(() => { 
    const sats = 100000000/price
    const btcDiscount = sats * discountPercent
    const btcPrice = sats - btcDiscount
    setSatsPerDollar(btcPrice)
  }, [price])

  if (loading) {
    return (
      <div className="bitcoin-price loading">
        Loading Bitcoin price...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bitcoin-price error">
        {error}
      </div>
    );
  }

  return (
    
    <>
     <p className='price'>
      {Math.ceil(satsPerDollar * usdAmount).toLocaleString()}
      <span> sats {isReOccuring ? '/mo' : '/one-time'}</span>
    </p>     
    </>
      
  
  );
};

export default BitcoinPrice;