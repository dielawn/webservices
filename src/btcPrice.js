// For browser environments, we don't need dotenv imports
// Remove these lines:
// import 'dotenv/config'
// import * as dotenv from 'dotenv'
// dotenv.config()

// Access the environment variable using import.meta.env
const STRIKE_API_KEY = import.meta.env.VITE_STRIKE_API_KEY  // If using Vite
// OR
// const STRIKE_API_KEY = process.env.REACT_APP_STRIKE_API_KEY  // If using Create React App

const fetchCBRate = async () => {
    try {
      const response = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot');
      const data = await response.json();
      const price = parseFloat(data.data.amount)

      return price
    } catch (err) {
      return 'Error fetching coinbase btc/usd rate.'
    }
  };

  const fetchStrikeRate = async () => {
    try {
      const response = await fetch('https://api.strike.me/v1/rates/ticker', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${STRIKE_API_KEY}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
     
      const btcRate = data.find(rate => 
        rate.sourceCurrency === 'BTC' && rate.targetCurrency === 'USD'
      );
      
      if (!btcRate) {
        console.log('Strike btc rate unavailable. Getting coinbase rate.')
        const price = fetchCBRate()
        return price
      }
  
      const price = parseFloat(btcRate.amount);
      return price;
  
    } catch (err) {
      console.error('Error fetching Bitcoin price:', err);
      return fetchCBRate();
    }
  };

  export {
    fetchStrikeRate
  }