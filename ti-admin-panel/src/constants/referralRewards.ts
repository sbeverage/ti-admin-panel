/**
 * Referral recognition tiers — align with mobile `app/constants/referralRewards.js`
 * and Edge `REFERRAL_TIERS` in `supabase/functions/api/index.ts`.
 * Counts are **paid** referrals (`status === 'paid'`).
 */
export const REFERRAL_RECOGNITION_TIERS = [
  { paidFriends: 1, key: 'supporter', label: 'Supporter Badge' },
  { paidFriends: 3, key: 'champion', label: 'Champion Badge' },
  { paidFriends: 5, key: 'website_spotlight', label: 'Website spotlight' },
] as const;

export const REFERRAL_TIER_COUNT = REFERRAL_RECOGNITION_TIERS.length;

export const PAID_FRIEND_THRESHOLDS = REFERRAL_RECOGNITION_TIERS.map((t) => t.paidFriends);

/** How many of the three recognition tiers are unlocked for a paid-friend count. */
export function paidRecognitionTiersUnlockedCount(paidCount: number): number {
  return PAID_FRIEND_THRESHOLDS.filter((t) => paidCount >= t).length;
}

/** Map badge / milestone metadata to a display threshold (1, 3, or 5) when possible. */
export function milestoneToPaidFriendsThreshold(m: Record<string, unknown>): number | null {
  const mc = m.milestone_count;
  if (typeof mc === 'number' && PAID_FRIEND_THRESHOLDS.includes(mc as 1 | 3 | 5)) {
    return mc;
  }

  const badge = String(m.badge_name || '').toLowerCase();
  if (badge.includes('supporter')) return 1;
  if (badge.includes('champion')) return 3;
  if (badge.includes('website') || badge.includes('spotlight')) return 5;

  const t = String(m.milestone_type || '');
  const match = t.match(/^(\d+)_friend/);
  if (match) {
    const n = parseInt(match[1], 10);
    if (PAID_FRIEND_THRESHOLDS.includes(n as 1 | 3 | 5)) return n;
  }

  return null;
}

/** Human-readable label for a milestone row (admin / reporting). */
export function recognitionLabelForThreshold(threshold: number): string {
  const tier = REFERRAL_RECOGNITION_TIERS.find((x) => x.paidFriends === threshold);
  return tier?.label ?? `${threshold} paid referrals`;
}

export function formatMilestoneSummary(m: Record<string, unknown>): string {
  const th = milestoneToPaidFriendsThreshold(m);
  if (th != null) {
    const base = recognitionLabelForThreshold(th);
    const extra = m.reward_description ? String(m.reward_description) : '';
    return extra ? `${base} — ${extra}` : base;
  }
  const raw = String(m.milestone_type || 'milestone');
  return raw.replace(/_/g, ' ');
}
