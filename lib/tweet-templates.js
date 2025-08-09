// Node.js compatible tweet generation library
// Used by both API routes and test scripts

function getBattleStatusEmoji(status) {
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

function getBattleStatusText(status) {
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

function analyzeBattleState(currentPrice, bossData) {
  // Sort bosses by price (lowest to highest)
  const sortedBosses = [...bossData].sort((a, b) => a.high - b.high);
  
  // Find current target boss (first undefeated boss)
  const currentBoss = sortedBosses.find(boss => currentPrice < boss.high);
  const currentBossIndex = currentBoss ? sortedBosses.indexOf(currentBoss) : sortedBosses.length;
  
  // Calculate previous boss price for progress calculation
  const previousBoss = currentBossIndex > 0 ? sortedBosses[currentBossIndex - 1] : null;
  const previousPrice = previousBoss ? previousBoss.high : 0;
  
  // Calculate progress and battle status
  let progress = 0;
  let battleStatus = 'resting';
  
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

function generateDailyStatusTweet(battleState, options = {}) {
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
  
  if (currentBoss.name) {
    tweet += `👹 Boss: ${bossName}\n`;
  } else {
    tweet += `👹 Boss: Level ${battleState.bossesDefeated + 1}\n`;
  }
  
  tweet += `💰 Target: ${formattedTarget}\n`;
  tweet += `📈 ETH: ${formattedPrice}\n\n`;
  
  // HP Bar visualization
  const hpBarLength = 10;
  const hpFilled = Math.round((1 - progress) * hpBarLength);
  const hpEmpty = hpBarLength - hpFilled;
  const hpBar = '█'.repeat(hpEmpty) + '░'.repeat(hpFilled);
  
  tweet += `❤️ HP: ${currentHP}/${totalHP}\n`;
  tweet += `${hpBar} ${progressPercent}%\n\n`;
  
  tweet += `⚔️ Status: ${emoji} ${statusText}\n`;
  
  if (damageDealtFormatted > 0) {
    tweet += `💥 Damage Dealt: $${damageDealtFormatted}\n`;
  }
  
  tweet += `🎯 To Victory: ${formattedRemaining}\n\n`;
  
  // Add boss-specific flavor text based on progress
  if (currentBoss.name) {
    if (progress >= 0.9) {
      tweet += `${currentBoss.name} is on the brink of defeat! 🔥\n\n`;
    } else if (progress >= 0.75) {
      tweet += `${currentBoss.name} is weakening! ⚡\n\n`;
    } else if (progress >= 0.5) {
      tweet += `${currentBoss.name} has engaged in battle! ⚔️\n\n`;
    } else if (progress >= 0.25) {
      tweet += `${currentBoss.name} stirs from slumber... 👀\n\n`;
    } else {
      tweet += `${currentBoss.name} rests, unaware of the approaching ETH army... 😴\n\n`;
    }
  }
  
  // Add hashtags
  const hashtags = options.customHashtags || ['#ETHBossHunter', '$ETH'];
  tweet += hashtags.join(' ');
  
  // Return tweet with image path for media attachment
  return {
    text: tweet,
    image: currentBoss.image || null
  };
}

function generateBossDefeatTweet(defeatedBoss, newPrice, battleState) {
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

function generateAllBossesDefeatedTweet(battleState) {
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

function generateMilestoneTweet(battleState, milestone) {
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

module.exports = {
  analyzeBattleState,
  generateDailyStatusTweet,
  generateBossDefeatTweet,
  generateAllBossesDefeatedTweet,
  generateMilestoneTweet,
  getBattleStatusEmoji,
  getBattleStatusText
};
