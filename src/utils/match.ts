export interface MatchTier {
  label: string;
  // how many of the 5 signal bars are filled
  bars: number;
}

// same tiers as the legend on the results screen
export function getMatchTier(score: number): MatchTier {
  if (score >= 0.9) return { label: 'Strong', bars: 5 };
  if (score >= 0.8) return { label: 'Good', bars: 4 };
  if (score >= 0.7) return { label: 'Fair', bars: 3 };
  return { label: 'Weak', bars: 2 };
}
