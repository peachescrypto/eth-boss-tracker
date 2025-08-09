import { BattleState, BossData } from './battle-analysis';

// Note: For Node.js compatibility, the main tweet generation logic 
// is now in /lib/tweet-templates.js. This file provides TypeScript 
// interfaces and imports the Node.js functions.

interface TweetOptions {
  includeImage?: boolean;
  customHashtags?: string[];
}

export function generateDailyStatusTweet(
  battleState: BattleState,
  _options: TweetOptions = {}
): { text: string; image?: string } {
  if (!battleState.currentBoss) {
    // All bosses defeated - legendary status
    const legendaryTweet = generateAllBossesDefeatedTweet(battleState);
    return { text: legendaryTweet, image: undefined };
  }
  
  // Reimplemented logic to avoid Node.js require() in TypeScript build
  const { 
    currentBoss, 
    nextBoss, 
    bossesDefeated, 
    totalBosses, 
    currentPrice 
  } = battleState;

  // Calculate HP metrics
  const maxHP = Math.round(currentBoss.high / 100);
  const currentHP = Math.max(0, Math.round((currentBoss.high - currentPrice) / 100));
  const damageDealt = maxHP - currentHP;
  const hpPercentage = Math.round((currentHP / maxHP) * 100);

  // Create HP bar visualization (10 segments)
  const filledSegments = Math.floor((1 - currentHP / maxHP) * 10);
  const hpBar = '█'.repeat(filledSegments) + '░'.repeat(10 - filledSegments);

  // Determine battle phase and flavor text
  let flavorText = "";
  let battlePhase = "";

  if (hpPercentage >= 80) {
    battlePhase = "Epic Battle";
    flavorText = currentBoss.name ? 
      `${currentBoss.name} stands strong, barely wounded!` :
      "The boss stands strong, barely wounded!";
  } else if (hpPercentage >= 50) {
    battlePhase = "Fierce Combat";
    flavorText = currentBoss.name ?
      `${currentBoss.name} is showing signs of damage!` :
      "The boss is showing signs of damage!";
  } else if (hpPercentage >= 20) {
    battlePhase = "Final Push";
    flavorText = currentBoss.name ?
      `${currentBoss.name} is on the ropes!` :
      "The boss is on the ropes!";
  } else {
    battlePhase = "Victory Imminent";
    flavorText = currentBoss.name ?
      `${currentBoss.name} is almost defeated!` :
      "The boss is almost defeated!";
  }

  // Format price
  const formattedPrice = `$${currentPrice.toLocaleString()}`;
  const formattedTarget = `$${currentBoss.high.toLocaleString()}`;
  const formattedRemaining = `$${Math.max(0, currentBoss.high - currentPrice).toLocaleString()}`;

  // Build the tweet
  const bossName = currentBoss.name || `Boss ${bossesDefeated + 1}`;
  
  let tweet = `🏹 ETH Boss Hunter - Daily Report\n\n`;
  tweet += `⚔️ ${battlePhase}: ${bossName}\n`;
  tweet += `💰 Current Price: ${formattedPrice}\n`;
  tweet += `🎯 Target: ${formattedTarget}\n\n`;
  tweet += `❤️ Boss HP: ${currentHP}/${maxHP} (${hpPercentage}%)\n`;
  tweet += `📊 ${hpBar}\n\n`;
  tweet += `💥 Damage Dealt: ${damageDealt}\n`;
  tweet += `🛡️ To Victory: ${formattedRemaining}\n\n`;
  tweet += `${flavorText}\n\n`;
  tweet += `📈 Bosses Defeated: ${bossesDefeated}/${totalBosses}\n`;
  
  if (nextBoss) {
    tweet += `🔮 Next Boss: $${nextBoss.high.toLocaleString()}\n`;
  }
  
  tweet += `\n#ETH #BossHunter #Crypto`;

  return { 
    text: tweet, 
    image: currentBoss.image || undefined 
  };
}

export function generateBossDefeatTweet(
  defeatedBoss: BossData,
  newPrice: number,
  battleState: BattleState
): string {
  const bossName = defeatedBoss.name || `Boss Level ${battleState.bossesDefeated}`;
  const damageDealt = Math.round(newPrice - defeatedBoss.high);
  const formattedTarget = `$${defeatedBoss.high.toLocaleString()}`;
  
  let tweet = `💀 BOSS DEFEATED! 💀\n\n`;
  tweet += `${bossName} has fallen!\n`;
  tweet += `Level ${battleState.bossesDefeated} ✅ (${formattedTarget})\n\n`;
  tweet += `ETH Army dealt $${damageDealt} damage!\n\n`;
  
  if (battleState.nextBoss) {
    const nextBossName = battleState.nextBoss.name || `Boss Level ${battleState.bossesDefeated + 1}`;
    const nextTarget = `$${battleState.nextBoss.high.toLocaleString()}`;
    tweet += `Next Target: ${nextBossName} (${nextTarget})\n`;
  }
  
  tweet += `🏆 Progress: ${battleState.bossesDefeated}/${battleState.totalBosses} bosses defeated\n\n`;
  tweet += `#ETHBossHunter #BossDefeated $ETH`;
  
  return tweet;
}

export function generateAllBossesDefeatedTweet(battleState: BattleState): string {
  const formattedPrice = `$${battleState.currentPrice.toLocaleString()}`;
  
  let tweet = `🏆 LEGENDARY STATUS ACHIEVED! 🏆\n\n`;
  tweet += `ALL ${battleState.totalBosses} BOSSES DEFEATED!\n\n`;
  tweet += `ETH Price: ${formattedPrice}\n`;
  tweet += `Status: 👑 LEGENDARY WARRIOR\n\n`;
  tweet += `The ETH Army has conquered every boss!\n`;
  tweet += `New all-time highs = NEW BOSSES! 📈\n\n`;
  tweet += `#ETHBossHunter #AllBossesDefeated #Legendary $ETH`;
  
  return tweet;
}

export function generateMilestoneTweet(
  battleState: BattleState,
  milestone: number
): string {
  const { currentBoss, currentPrice, progress } = battleState;
  
  if (!currentBoss) return '';
  
  const bossName = currentBoss.name || `Boss Level ${battleState.bossesDefeated + 1}`;
  const formattedPrice = `$${currentPrice.toLocaleString()}`;
  const formattedTarget = `$${currentBoss.high.toLocaleString()}`;
  const progressPercent = Math.round(progress * 100);
  
  let tweet = '';
  
  if (milestone === 90) {
    tweet = `🚨 CRITICAL BATTLE ALERT! 🚨\n\n`;
    tweet += `ETH has pushed ${bossName} to ${progressPercent}% defeated!\n`;
    tweet += `Current: ${formattedPrice} | Target: ${formattedTarget}\n\n`;
    tweet += `The ETH Army is ${100 - progressPercent}% away from VICTORY!\n`;
    tweet += `Rally the troops! ⚔️\n\n`;
    tweet += `#CriticalBattle #ETHArmy #AlmostThere $ETH`;
  } else if (milestone === 75) {
    tweet = `🔥 BATTLE INTENSIFIES! 🔥\n\n`;
    tweet += `${bossName} is ${progressPercent}% defeated!\n`;
    tweet += `Current: ${formattedPrice}\n`;
    tweet += `Target: ${formattedTarget}\n\n`;
    tweet += `The battle rages on! ⚔️\n\n`;
    tweet += `#BattleIntensifies #ETHBossHunter $ETH`;
  } else if (milestone === 50) {
    tweet = `⚡ BATTLE ENGAGED! ⚡\n\n`;
    tweet += `${bossName} fight has begun!\n`;
    tweet += `Progress: ${progressPercent}%\n`;
    tweet += `Current: ${formattedPrice}\n\n`;
    tweet += `The ETH Army marches forward! 🪖\n\n`;
    tweet += `#BattleEngaged #ETHBossHunter $ETH`;
  }
  
  return tweet;
}

export function formatTweetWithImage(tweet: string, imagePath?: string): { text: string; media?: string } {
  return {
    text: tweet,
    media: imagePath
  };
}
