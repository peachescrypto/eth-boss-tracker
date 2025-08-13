// TypeScript tweet generation library
// Used by both API routes and test scripts

export type BattleStatus = 'resting' | 'approaching' | 'heating_up' | 'critical' | 'final_assault' | 'defeated';

export interface BossData {
  date: string;
  high: number;
  tier: string;
  name?: string;
  image?: string;
  lore?: string;
}

export interface BattleState {
  currentBoss: BossData | null;
  nextBoss: BossData | null;
  currentPrice: number;
  progress: number;
  battleStatus: BattleStatus;
  bossesDefeated: number;
  totalBosses: number;
  damageDealt: number;
  remainingDamage: number;
}

export interface TweetOptions {
  customHashtags?: string[];
}

export interface TweetWithImage {
  text: string;
  image?: string | null;
}

export function getBattleStatusEmoji(status: BattleStatus): string {
  switch (status) {
    case 'resting': return '😴';
    case 'approaching': return '⚡';
    case 'heating_up': return '🔥';
    case 'critical': return '🚨';
    case 'final_assault': return '⚔️';
    case 'defeated': return '🏆';
    default: return '🎯';
  }
}

export function getBattleStatusText(status: BattleStatus): string {
  switch (status) {
    case 'resting': return 'Boss is resting';
    case 'approaching': return 'Battle begins!';
    case 'heating_up': return 'HEATING UP';
    case 'critical': return 'CRITICAL BATTLE';
    case 'final_assault': return 'FINAL ASSAULT';
    case 'defeated': return 'ALL BOSSES DEFEATED!';
    default: return 'Preparing for battle';
  }
}

export function analyzeBattleState(currentPrice: number, bossData: BossData[]): BattleState {
  // Sort bosses by price (lowest to highest)
  const sortedBosses = [...bossData].sort((a, b) => a.high - b.high);
  
  // Find current target boss (first undefeated boss)
  const currentBoss = sortedBosses.find(boss => currentPrice < boss.high) || null;
  const currentBossIndex = currentBoss ? sortedBosses.indexOf(currentBoss) : sortedBosses.length;
  
  // Calculate previous boss price for progress calculation
  const previousBoss = currentBossIndex > 0 ? sortedBosses[currentBossIndex - 1] : null;
  const previousPrice = previousBoss ? previousBoss.high : 0;
  
  // Calculate progress and battle status
  let progress = 0;
  let battleStatus: BattleStatus = 'resting';
  
  if (currentBoss) {
    const targetPrice = currentBoss.high;
    progress = (currentPrice - previousPrice) / (targetPrice - previousPrice);
    progress = Math.max(0, Math.min(1, progress));
    
    // Determine battle status based on progress
    if (progress < 0.25) {
      battleStatus = 'resting';
    } else if (progress < 0.5) {
      battleStatus = 'approaching';
    } else if (progress < 0.75) {
      battleStatus = 'heating_up';
    } else if (progress < 0.9) {
      battleStatus = 'critical';
    } else {
      battleStatus = 'final_assault';
    }
  } else {
    // All bosses defeated!
    progress = 1;
    battleStatus = 'defeated';
  }
  
  // Find next boss after current
  const nextBoss = currentBossIndex < sortedBosses.length - 1 
    ? sortedBosses[currentBossIndex + 1] 
    : null;
  
  // Calculate damage metrics
  const damageDealt = currentPrice - previousPrice;
  const remainingDamage = currentBoss ? currentBoss.high - currentPrice : 0;
  
  return {
    currentBoss,
    nextBoss,
    currentPrice,
    progress,
    battleStatus,
    bossesDefeated: currentBossIndex,
    totalBosses: sortedBosses.length,
    damageDealt: Math.max(0, damageDealt),
    remainingDamage: Math.max(0, remainingDamage)
  };
}

export function generateDailyStatusTweet(battleState: BattleState, options: TweetOptions = {}): TweetWithImage {
  const { currentBoss, currentPrice, progress, battleStatus, remainingDamage, damageDealt } = battleState;
  
  if (!currentBoss) {
    // All bosses defeated - legendary status
    return generateAllBossesDefeatedTweet(battleState);
  }
  
  const emoji = getBattleStatusEmoji(battleStatus);
  const statusText = getBattleStatusText(battleStatus);
  const progressPercent = Math.round(progress * 100);
  
  const bossName = currentBoss.name || `Boss Level ${battleState.bossesDefeated + 1}`;
  const formattedPrice = `$${currentPrice.toLocaleString()}`;
  const formattedTarget = `$${currentBoss.high.toLocaleString()}`;
  const formattedRemaining = `$${remainingDamage.toFixed(0)}`;
  
  // Calculate HP mechanics
  const totalHP = Math.round(currentBoss.high - (battleState.bossesDefeated > 0 ? 
    battleState.currentPrice - remainingDamage - damageDealt : 0));
  const currentHP = Math.max(0, Math.round(remainingDamage));
  const damageDealtFormatted = Math.round(damageDealt);
  
  // Build the enhanced tweet with boss personality
  let tweet = `⚔️ Daily Boss Battle Report\n\n`;
  
  // Add boss-specific flavor text based on progress
  if (currentBoss.name) {
    if (battleState.battleStatus === 'final_assault') {
      tweet += `${currentBoss.tier} Boss ${currentBoss.name} is on the brink of defeat! 🔥\n\n`;
    } else if (battleState.battleStatus === 'critical') {
      tweet += `${currentBoss.tier} Boss ${currentBoss.name} is on the ropes! 🥊\n\n`;
    } else if (battleState.battleStatus === 'heating_up') {
      tweet += `${currentBoss.tier} Boss ${currentBoss.name} is showing signs of damage! ⚔️\n\n`;
    } else if (battleState.battleStatus === 'approaching') {
      tweet += `${currentBoss.tier} Boss ${currentBoss.name} stands strong, barely wounded! 👀\n\n`;
    } else {
      tweet += `${currentBoss.tier} Boss ${currentBoss.name} rests, unaware of what is about to happen... 😴\n\n`;
    }
  }

  tweet += `${bossName} will be defeated when ETH reaches $${currentBoss.high.toLocaleString()}\n`;
  tweet += `📈 Current $ETH Price: ${formattedPrice}\n`;
  tweet += `🎯 only $${formattedRemaining} to go!\n\n`;
  
  // HP Bar visualization
  const hpBarLength = 10;
  const hpFilled = Math.round((1 - progress) * hpBarLength);
  const hpEmpty = hpBarLength - hpFilled;
  const hpBar = '█'.repeat(hpEmpty) + '░'.repeat(hpFilled);
  tweet += `🚨 ${hpBar} ${progressPercent}%\n\n`;

  tweet += `https://eth-boss-tracker.vercel.app/`
    
  // Return tweet with image path for media attachment
  return {
    text: tweet,
    image: currentBoss.image || null
  };
}

export function generateBossDefeatTweet(defeatedBoss: BossData, newPrice: number, battleState: BattleState, bossData?: BossData[]): string {
  const bossName = defeatedBoss.name || `Boss Level ${battleState.bossesDefeated}`;
  const levelNumber = battleState.bossesDefeated;

  let tweet = `💀 BOSS DEFEATED! 💀\n\n`;
  tweet += `${bossName} has fallen!\n`;
  tweet += `Level ${levelNumber}/${battleState.totalBosses} Achieved ✅\n`;
  tweet += `One step closer to defeating #Athion\n\n`;
  tweet += `But wait, a new boss is stirring...\n\n`;

  let nextBoss = battleState.nextBoss;

  if (bossData) {
    const sortedBosses = [...bossData].sort((a, b) => a.high - b.high);
    const defeatedBossIndex = sortedBosses.findIndex(boss => boss.high === defeatedBoss.high);
    if (defeatedBossIndex >= 0 && defeatedBossIndex < sortedBosses.length - 1) {
      nextBoss = sortedBosses[defeatedBossIndex + 1];
    }
  }

  if (nextBoss) {
    const nextBossName = nextBoss.name?.toLocaleUpperCase() || `Boss Level ${levelNumber + 1}`;
    const nextBossTier = nextBoss.tier;
    const nextBossDate = nextBoss.date;
    const date = new Date(nextBossDate);
    const prettyDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    tweet += `${nextBossName} is coming and is ${nextBossTier}, they spawned on ${prettyDate} \n\n`;

    // if (nextBoss.lore) {
    //   tweet += `${nextBoss.lore}\n\n`;
    // } else {
    //   console.log('No lore available for next boss');
    // }
  }

  tweet += `https://eth-boss-tracker.vercel.app/`;

  return tweet;
}

export function generateBossSwitchTweet(
  newTargetBoss: BossData, 
  currentPrice: number, 
  lastCheckedPrice: number, 
  battleState: BattleState
): string {
  const bossName = newTargetBoss.name || `Boss Level ${battleState.bossesDefeated + 1}`;
  const priceDrop = lastCheckedPrice - currentPrice;
  const priceDropPercent = ((priceDrop / lastCheckedPrice) * 100).toFixed(1);
  
  let tweet = `↔️ BOSS SWITCH OUT! ↔️\n\n`;
  tweet += `Back to level ${battleState.bossesDefeated} 😤\n`;
  
  if (newTargetBoss) {
    const nextBossName = newTargetBoss.name?.toLocaleUpperCase() || `Boss Level ${battleState.bossesDefeated}`;
    const nextBossTier = newTargetBoss.tier;
    const nextBossDate = newTargetBoss.date;
    const date = new Date(nextBossDate);
    const prettyDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    tweet += `${nextBossName} is coming and is ${nextBossTier}, they spawned on ${prettyDate} \n\n`;

    // if (newTargetBoss.lore) {
    //   tweet += `${newTargetBoss.lore}\n\n`;
    // } else {
    //   console.log('No lore available for next boss');
    // }
  }
  
  tweet += `https://eth-boss-tracker.vercel.app/`;
  
  return tweet;
}

export function generateAllBossesDefeatedTweet(battleState: BattleState): TweetWithImage {
  const formattedPrice = `$${battleState.currentPrice.toLocaleString()}`;
  
  let tweet = `🏆 LEGENDARY STATUS ACHIEVED! 🏆\n\n`;
  tweet += `ALL ${battleState.totalBosses} BOSSES DEFEATED!\n\n`;
  tweet += `$ETH Price: ${formattedPrice}\n`;
  tweet += `Status: 👑 LEGENDARY WARRIOR\n\n`;
  tweet += `The ETH Army has conquered every boss!\n`;
  tweet += `New all-time highs = NEW BOSSES! 📈\n\n`;
  
  return {
    text: tweet,
    image: null
  };
}

export function generateMilestoneTweet(battleState: BattleState, milestone: number): string {
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
