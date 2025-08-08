const fs = require('fs');
const path = require('path');

// Configuration
const START_DATE = '2020-01-01';
const MIN_PRICE = 4000; // Only prices above $4000
const OUTPUT_FILE = path.join(__dirname, '../public/eth-daily-highs.json');

async function fetchHistoricalData() {
  console.log('Fetching ETH historical data from Binance (year by year)...');
  
  try {
    const today = new Date();
    const startYear = 2020;
    const currentYear = today.getFullYear();
    
    let allDailyHighs = [];
    
    // Fetch data year by year from 2020 to current year
    for (let year = startYear; year <= currentYear; year++) {
      const yearStart = new Date(year, 0, 1); // January 1st of the year
      const yearEnd = year === currentYear ? today : new Date(year, 11, 31); // December 31st or today
      
      console.log(`\n📅 Fetching ${year}...`);
      
      // Add delay between requests to respect rate limits
      if (year > startYear) {
        console.log('⏳ Waiting 1 second between requests...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Binance API: klines endpoint with 1 day interval
      const url = `https://api.binance.com/api/v3/klines?symbol=ETHUSDT&interval=1d&startTime=${yearStart.getTime()}&endTime=${yearEnd.getTime()}&limit=1000`;
      
      let response, data;
      try {
        response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; ETH-Boss-Tracker/1.0)'
          },
          signal: AbortSignal.timeout(30000) // 30 second timeout
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Error fetching ${year}:`, errorText);
          console.log(`   Skipping ${year} and continuing...`);
          continue;
        }
        
        data = await response.json();
      } catch (fetchError) {
        console.error(`❌ Network error fetching ${year}:`, fetchError.message);
        console.log(`   Skipping ${year} and continuing...`);
        continue;
      }
      
      if (!Array.isArray(data)) {
        console.error(`❌ Invalid response format for ${year}`);
        continue;
      }
      
      console.log(`   Received ${data.length} daily candles for ${year}`);
      
      // Process the data to find daily highs above $4000
      const yearDailyHighs = processDailyHighs(data);
      
      console.log(`   Found ${yearDailyHighs.length} daily highs above $${MIN_PRICE.toLocaleString()} in ${year}`);
      
      allDailyHighs = allDailyHighs.concat(yearDailyHighs);
    }
    
    if (allDailyHighs.length === 0) {
      throw new Error('No data found for any year');
    }
    
    // Remove duplicates (in case of overlapping dates)
    const uniqueHighs = removeDuplicates(allDailyHighs);
    
    // Sort by date (oldest first)
    uniqueHighs.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(uniqueHighs, null, 2));
    
    console.log(`\n✅ Data written to ${OUTPUT_FILE}`);
    console.log(`📊 Summary:`);
    console.log(`   - Date range: ${uniqueHighs[0]?.date} to ${uniqueHighs[uniqueHighs.length - 1]?.date}`);
    console.log(`   - Total entries: ${uniqueHighs.length}`);
    console.log(`   - Price range: $${Math.min(...uniqueHighs.map(h => h.high)).toLocaleString()} to $${Math.max(...uniqueHighs.map(h => h.high)).toLocaleString()}`);
    
    // Show some sample entries
    console.log(`\n📋 Sample entries:`);
    uniqueHighs.slice(0, 10).forEach(entry => {
      console.log(`   ${entry.date}: $${entry.high.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    process.exit(1);
  }
}

function processDailyHighs(candles) {
  const dailyHighs = [];
  
  candles.forEach(candle => {
    // Binance klines format: [openTime, open, high, low, close, volume, closeTime, ...]
    const [openTime, open, high, low, close] = candle;
    const highPrice = parseFloat(high);
    
    // Only include if high price is above our minimum
    if (highPrice >= MIN_PRICE) {
      const date = new Date(openTime).toISOString().split('T')[0];
      
      dailyHighs.push({
        date: date,
        high: Math.round(highPrice * 100) / 100 // Round to 2 decimal places
      });
    }
  });
  
  return dailyHighs;
}

function removeDuplicates(dailyHighs) {
  const seen = new Set();
  return dailyHighs.filter(entry => {
    const key = entry.date;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Run the script
fetchHistoricalData(); 