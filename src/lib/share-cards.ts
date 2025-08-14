export interface ShareCardData {
  bossName: string;
  bossLevel?: number;
  targetPrice?: string;
  currentPrice?: string;
  progress?: number;
  hp?: number;
  date?: string;
  image?: string;
  tier?: string;
}

export function getCurrentBossShareUrl(data: ShareCardData): string {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://eth-boss-tracker.vercel.app'
    : 'http://localhost:3000';
  return `${baseUrl}/api/share/boss-detail?boss=${encodeURIComponent(data.bossName)}`;
}

export function getBossDefeatedShareUrl(data: ShareCardData): string {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://eth-boss-tracker.vercel.app'
    : 'http://localhost:3000';
  return `${baseUrl}/api/share/boss-defeated?boss=${encodeURIComponent(data.bossName)}`;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function calculateProgress(currentPrice: number, prevHigh: number, targetHigh: number): number {
  if (targetHigh === prevHigh) {
    return currentPrice >= targetHigh ? 100 : 0;
  }
  
  const progress = ((currentPrice - prevHigh) / (targetHigh - prevHigh)) * 100;
  return Math.min(100, Math.max(0, progress));
}

export function calculateHP(progress: number): number {
  // HP decreases as progress increases
  return Math.max(0, 100 - progress);
}

// Generate Twitter share text with card
export function generateTwitterShareText(type: 'current' | 'defeated', data: ShareCardData): string {
  if (type === 'defeated') {
    return `🏆 BOSS DEFEATED! 🏆

${data.bossName} (Level ${data.bossLevel}) has fallen!
Target: ${data.targetPrice}
Victory Price: ${data.currentPrice}

Another boss down in the ETH Boss Hunter! 💪`;
  } else {
    return `⚔️ $ETH Boss Battle Update!

Current Boss: ${data.bossName} (Level ${data.bossLevel})
Target: ${data.targetPrice}
Current ETH: ${data.currentPrice}
Progress: ${data.progress || 0}%

Will $ETH defeat this boss? 🎯`;
  }
}

// Generate Open Graph meta tags
export function generateOpenGraphTags(type: 'current' | 'defeated', data: ShareCardData) {
  const imageUrl = type === 'current' 
    ? getCurrentBossShareUrl(data)
    : getBossDefeatedShareUrl(data);
    
  const title = type === 'current'
    ? `ETH Boss Hunter - ${data.bossName} Battle`
    : `Boss Defeated: ${data.bossName}`;
    
  const description = type === 'current'
    ? `ETH is ${data.progress || 0}% through defeating ${data.bossName} (Level ${data.bossLevel}). Target: ${data.targetPrice}`
    : `${data.bossName} (Level ${data.bossLevel}) has been defeated! Victory price: ${data.currentPrice}`;

  return {
    title,
    description,
    image: imageUrl,
    url: process.env.NODE_ENV === 'production' 
      ? 'https://eth-boss-tracker.vercel.app'
      : 'http://localhost:3000',
  };
}
