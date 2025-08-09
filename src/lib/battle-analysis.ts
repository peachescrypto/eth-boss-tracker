interface BossData {
  date: string;
  high: number;
  name?: string;
  image?: string;
}

interface BattleState {
  currentBoss: BossData | null;
  nextBoss: BossData | null;
  currentPrice: number;
  progress: number;
  battleStatus: 'resting' | 'approaching' | 'heating_up' | 'critical' | 'final_assault' | 'defeated';
  bossesDefeated: number;
  totalBosses: number;
  damageDealt: number;
  remainingDamage: number;
}

export function analyzeBattleState(
  currentPrice: number,
  bossData: BossData[]
): BattleState {
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
  let battleStatus: BattleState['battleStatus'] = 'resting';
  
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

export function getBattleStatusEmoji(status: BattleState['battleStatus']): string {
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

export function getBattleStatusText(status: BattleState['battleStatus']): string {
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
