import { BattleState, BossData, getBattleStatusEmoji, getBattleStatusText } from './battle-analysis';

// Note: For Node.js compatibility, the main tweet generation logic 
// is now in /lib/tweet-templates.js. This file provides TypeScript 
// interfaces and imports the Node.js functions.

interface TweetOptions {
  includeImage?: boolean;
  customHashtags?: string[];
}

export function generateDailyStatusTweet(
  battleState: BattleState,
  options: TweetOptions = {}
): { text: string; image?: string } {
  const { currentBoss, currentPrice, progress, battleStatus, remainingDamage, damageDealt } = battleState;
  
  if (!currentBoss) {
    // All bosses defeated - legendary status
    const legendaryTweet = generateAllBossesDefeatedTweet(battleState);
    return { text: legendaryTweet, image: undefined };
  }
  
  // Use the Node.js version for consistency - import the logic
  const nodeJsTweetLib = require('../../lib/tweet-templates');
  return nodeJsTweetLib.generateDailyStatusTweet(battleState, options);
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
