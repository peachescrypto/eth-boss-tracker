require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const {
  analyzeBattleState,
  generateDailyStatusTweet,
  generateBossDefeatTweet,
  generateAllBossesDefeatedTweet,
  generateMilestoneTweet
} = require('../lib/tweet-templates');

// Load boss data
const bossDataPath = path.join(__dirname, '..', 'public', 'eth-weekly-highs.json');
const bossData = JSON.parse(fs.readFileSync(bossDataPath, 'utf8'));

function printSeparator(title = '') {
  console.log('='.repeat(60));
  if (title) console.log(`📝 ${title}`);
  console.log('='.repeat(60));
}

function testTweets() {
  console.log('🎯 ETH Boss Hunter Tweet Iterator\n');
  
  // Test different price scenarios
  // Nyxara: 4027.88
  // Othrak: 4071.00
  const scenarios = [
    { price: 4035, desc: '<0.25 - Resting - Othrak' }, 
    { price: 4045, desc: '<0.5 - Approaching - Othrak' },
    { price: 4055, desc: '<0.75 - Heating Up - Othrak' },
    { price: 4065, desc: '<0.9 - Critical - Othrak' },
    { price: 4070.9, desc: '<1.0 - Final Assault - Othrak' },
    { price: 4071, desc: '1.0 - Defeatured Othrak' },    
    { price: 5000, desc: 'Legendary status (all defeated)' }
  ];

  scenarios.forEach(({ price, desc }) => {
    console.log(`\n🎲 Scenario: ${desc} (ETH: $${price.toLocaleString()})`);
    
    const battleState = analyzeBattleState(price, bossData);
    
    console.log(`   Current Boss: ${battleState.currentBoss?.name || 'All Defeated'}`);
    console.log(`   Progress: ${Math.round(battleState.progress * 100)}%`);
    console.log(`   Status: ${battleState.battleStatus}`);
    console.log(`   Bosses Defeated: ${battleState.bossesDefeated}/${battleState.totalBosses}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log('📊 TWEET EXAMPLES');
  console.log('='.repeat(60));

  // Example 1: Daily Status Tweet (resting state)
  printSeparator('Daily Status Tweet - Resting State');
  const restingState = analyzeBattleState(4050, bossData);
  const dailyTweet = generateDailyStatusTweet(restingState);
  console.log(dailyTweet);
  console.log(`\nLength: ${dailyTweet.length}/280 characters`);

  // Example 2: Daily Status Tweet (critical battle)
  printSeparator('Daily Status Tweet - Critical Battle');
  const criticalState = analyzeBattleState(4350, bossData);
  const criticalTweet = generateDailyStatusTweet(criticalState);
  console.log(criticalTweet);
  console.log(`\nLength: ${criticalTweet.length}/280 characters`);

  // Example 3: Boss Defeat Tweet
  printSeparator('Boss Defeat Tweet');
  const defeatState = analyzeBattleState(4400, bossData);
  // Find the boss that would be defeated at this price
  const sortedBosses = [...bossData].sort((a, b) => a.high - b.high);
  const defeatedBoss = sortedBosses.find(boss => boss.high <= 4400);
  if (defeatedBoss) {
    const defeatTweet = generateBossDefeatTweet(defeatedBoss, 4400, defeatState);
    console.log(defeatTweet);
    console.log(`\nLength: ${defeatTweet.length}/280 characters`);
  }

  // Example 4: Milestone Tweet
  printSeparator('Milestone Tweet - 90%');
  const milestoneTweet = generateMilestoneTweet(criticalState, 90);
  console.log(milestoneTweet);
  console.log(`\nLength: ${milestoneTweet.length}/280 characters`);

  // Example 5: All Bosses Defeated
  printSeparator('Legendary Status Tweet');
  const legendaryState = analyzeBattleState(5000, bossData);
  const legendaryTweet = generateAllBossesDefeatedTweet(legendaryState);
  console.log(legendaryTweet);
  console.log(`\nLength: ${legendaryTweet.length}/280 characters`);

  console.log('\n' + '='.repeat(60));
  console.log('🛠️  To modify tweets, edit: lib/tweet-templates.js');
  console.log('🔄  Re-run: npm run iterate-tweets');
  console.log('🚀  Test posting: npm run test-boss-hunter');
  console.log('='.repeat(60));
}

// Allow specific tweet type testing via command line
const args = process.argv.slice(2);
if (args.length > 0) {
  const [type, price] = args;
  const testPrice = parseFloat(price) || 4100;
  const battleState = analyzeBattleState(testPrice, bossData);
  
  console.log(`🎯 Testing ${type} tweet at $${testPrice}\n`);
  
  let tweet = '';
  switch (type.toLowerCase()) {
    case 'daily':
      tweet = generateDailyStatusTweet(battleState);
      break;
    case 'defeat':
      const sortedBosses = [...bossData].sort((a, b) => a.high - b.high);
      const defeatedBoss = sortedBosses.find(boss => boss.high <= testPrice);
      if (defeatedBoss) {
        tweet = generateBossDefeatTweet(defeatedBoss, testPrice, battleState);
      } else {
        console.log('❌ No boss defeated at this price');
        return;
      }
      break;
    case 'milestone':
      const milestone = parseInt(args[2]) || 90;
      tweet = generateMilestoneTweet(battleState, milestone);
      break;
    case 'legendary':
      tweet = generateAllBossesDefeatedTweet(battleState);
      break;
    default:
      console.log('❌ Unknown tweet type. Use: daily, defeat, milestone, legendary');
      return;
  }
  
  printSeparator(`${type.toUpperCase()} TWEET`);
  console.log(tweet);
  console.log(`\nLength: ${tweet.length}/280 characters`);
  
} else {
  testTweets();
}

// Export for use in other scripts
module.exports = { testTweets };
