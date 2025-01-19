import React, { useState, useEffect } from 'react';
import './BtcPrice.css'

const BitcoinPrice = ({ onPriceUpdate, usdAmount, isReOccuring }) => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [satsPerDollar, setSatsPerDollar] = useState(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
        const data = await response.json();
        setPrice(parseFloat(data.data.amount));
        if (onPriceUpdate) {
          onPriceUpdate(parseFloat(data.data.amount));
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch Bitcoin price');
        setLoading(false);
      }
    };

    // Fetch immediately
    fetchPrice();

    // Then fetch every 30 seconds
    const interval = setInterval(fetchPrice, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [onPriceUpdate]);

  useEffect(() => { 
    const sats = 100000000/price
    const btcDiscount = sats * .1
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
     <p className='price'>{Math.ceil(satsPerDollar * usdAmount)
        }<span> sats {isReOccuring ? '/mo' : '/one-time'}</span>
     </p>   
   
     
    </>
      
  
  );
};

export default BitcoinPrice;