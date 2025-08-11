import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {
  analyzeBattleState,
  generateDailyStatusTweet,
  generateBossDefeatTweet,
  generateAllBossesDefeatedTweet,
  generateMilestoneTweet,
  type BattleState,
  type BossData
} from '../../../src/lib/tweet-templates.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Load boss data
const bossDataPath = path.join(process.cwd(), 'public', 'eth-weekly-highs.json');
const bossData: BossData[] = JSON.parse(fs.readFileSync(bossDataPath, 'utf8'));

function printSeparator(title = ''): void {
  console.log('='.repeat(60));
  if (title) console.log(`📝 ${title}`);
  console.log('='.repeat(60));
}

function testTweets(): void {
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
  console.log(dailyTweet.text);
  console.log(`\nLength: ${dailyTweet.text.length}/280 characters`);
  if (dailyTweet.image) console.log(`Image: ${dailyTweet.image}`);

  // Example 2: Daily Status Tweet (critical battle)
  printSeparator('Daily Status Tweet - Critical Battle');
  const criticalState = analyzeBattleState(4350, bossData);
  const criticalTweet = generateDailyStatusTweet(criticalState);
  console.log(criticalTweet.text);
  console.log(`\nLength: ${criticalTweet.text.length}/280 characters`);
  if (criticalTweet.image) console.log(`Image: ${criticalTweet.image}`);

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
  console.log(legendaryTweet.text);
  console.log(`\nLength: ${legendaryTweet.text.length}/280 characters`);
}

// Command line argument handling
function main(): void {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Default: show all examples
    testTweets();
    return;
  }

  const command = args[0];
  const price = args[1] ? parseFloat(args[1]) : 4200;
  const milestone = args[2] ? parseInt(args[2]) : 90;

  console.log('🎯 ETH Boss Hunter Tweet Generator\n');

  switch (command) {
    case 'defeat':
      if (args[1]) {
        // Specific defeat scenario
        const defeatState = analyzeBattleState(price, bossData);
        const sortedBosses = [...bossData].sort((a, b) => a.high - b.high);
        const defeatedBoss = sortedBosses.find(boss => boss.high <= price);
        if (defeatedBoss) {
          printSeparator(`Boss Defeat Tweet at $${price.toLocaleString()}`);
          const defeatTweet = generateBossDefeatTweet(defeatedBoss, price, defeatState);
          console.log(defeatTweet);
          console.log(`\nLength: ${defeatTweet.length}/280 characters`);
        } else {
          console.log('❌ No boss would be defeated at this price');
        }
      } else {
        // Show all defeat scenarios
        printSeparator('Boss Defeat Scenarios');
        const defeatScenarios = [4100, 4200, 4300, 4400, 4500];
        defeatScenarios.forEach(p => {
          const state = analyzeBattleState(p, bossData);
          const sortedBosses = [...bossData].sort((a, b) => a.high - b.high);
          const defeatedBoss = sortedBosses.find(boss => boss.high <= p);
          if (defeatedBoss) {
            console.log(`\n💰 Price: $${p.toLocaleString()}`);
            const tweet = generateBossDefeatTweet(defeatedBoss, p, state);
            console.log(tweet.substring(0, 100) + '...');
          }
        });
      }
      break;

    case 'daily':
      printSeparator(`Daily Status Tweet at $${price.toLocaleString()}`);
      const dailyState = analyzeBattleState(price, bossData);
      const dailyTweet = generateDailyStatusTweet(dailyState);
      console.log(dailyTweet.text);
      console.log(`\nLength: ${dailyTweet.text.length}/280 characters`);
      if (dailyTweet.image) console.log(`Image: ${dailyTweet.image}`);
      break;

    case 'milestone':
      printSeparator(`Milestone Tweet (${milestone}%) at $${price.toLocaleString()}`);
      const milestoneState = analyzeBattleState(price, bossData);
      const milestoneTweet = generateMilestoneTweet(milestoneState, milestone);
      if (milestoneTweet) {
        console.log(milestoneTweet);
        console.log(`\nLength: ${milestoneTweet.length}/280 characters`);
      } else {
        console.log('❌ No milestone tweet generated for this scenario');
      }
      break;

    default:
      console.log('❌ Unknown command. Available commands:');
      console.log('  defeat [price]     - Boss defeat tweet');
      console.log('  daily [price]      - Daily status tweet');
      console.log('  milestone [price] [percent] - Milestone tweet');
      console.log('  (no args)          - Show all examples');
      break;
  }
}

// Run the script
main();
