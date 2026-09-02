// A pixel-faithful mock of the discount card a donor sees in the THRIVE app.
//
// Vendors and admins used to write discounts blind and find out how they read
// only after publishing — which is how three fields ended up all saying "10%
// off all items". Showing the real card as they type makes the redundancy
// obvious while it is still cheap to fix.
//
// Mirrors app/(tabs)/(main)/discounts/[id].js. If the card there changes,
// change it here too or the preview quietly starts lying.

import React from 'react';

export const TITLE_MAX = 26;
export const TITLE_WARN = 22;
export const DESCRIPTION_MAX = 140;
export const TERMS_MAX = 200;

export const AVAILABILITY_LABELS: Record<string, string> = {
  'in-store': 'In-store',
  online: 'Online',
  both: 'In-store & online',
};

/**
 * Flags a description that just restates the headline.
 *
 * The most common failure isn't a missing field, it's three fields carrying one
 * sentence: "10% off all items" as the title, the description, and the terms.
 * The donor reads it three times and still doesn't know what's excluded.
 *
 * Deliberately a warning rather than a hard rule — the check is a heuristic,
 * and being wrong about someone's wording shouldn't stop them publishing.
 */
export function repeatsHeadline(title?: string | null, description?: string | null): boolean {
  const t = (title || '').trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const d = (description || '').trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
  if (!t || !d || t.length < 6) return false;
  return d === t || d.startsWith(t);
}

export interface DiscountCardPreviewProps {
  title?: string | null;
  description?: string | null;
  terms?: string | null;
  availability?: string | null;
  usageLimit?: string | null;
  /** Renders muted, for the side-by-side "good example" card. */
  sample?: boolean;
}

function usageText(usageLimit?: string | null): string {
  if (!usageLimit) return 'Unlimited uses';
  const v = String(usageLimit).trim().toLowerCase();
  if (v === '' || v === 'unlimited') return 'Unlimited uses';
  if (v === 'once_per_visit') return 'Once per visit';
  if (v === 'once_per_customer') return 'Once per donor';
  if (v === 'monthly') return '1 of 1 left this month';
  const n = parseInt(v, 10);
  if (!isNaN(n) && n > 0) return `${n} of ${n} left this month`;
  return 'Unlimited uses';
}

const DiscountCardPreview: React.FC<DiscountCardPreviewProps> = ({
  title,
  description,
  terms,
  availability,
  usageLimit,
  sample = false,
}) => {
  const availabilityText = availability
    ? AVAILABILITY_LABELS[String(availability).toLowerCase()] || null
    : null;

  // Empty fields show grey guidance rather than collapsing, so the vendor can
  // see what is still missing from the card instead of a card that looks done.
  const titleText = title?.trim() || 'Your offer headline';
  const titleIsPlaceholder = !title?.trim();

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 2px 10px rgba(50,78,88,0.12)',
        border: '1px solid #EEF1F3',
        opacity: sample ? 0.97 : 1,
        maxWidth: 360,
      }}
    >
      {/* Coupon band — the offer, and where it can be redeemed. */}
      <div
        style={{
          background: 'linear-gradient(90deg, #DB8633 0%, #F2A84E 100%)',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: titleIsPlaceholder ? 'rgba(255,255,255,0.6)' : '#fff',
            letterSpacing: 0.3,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
          }}
        >
          {titleText}
        </span>
        {availabilityText && (
          <span
            style={{
              background: 'rgba(255,255,255,0.22)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 20,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {availabilityText}
          </span>
        )}
      </div>

      {/* Body — what's included, then the redeem row, then the fine print. */}
      <div style={{ padding: 16 }}>
        <div
          style={{
            fontSize: 13,
            lineHeight: '19px',
            color: description?.trim() ? '#6B7280' : '#C4CBD2',
            marginBottom: 12,
            fontStyle: description?.trim() ? 'normal' : 'italic',
          }}
        >
          {description?.trim() || "What's included — the detail donors need before they walk in."}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <span
            style={{
              background: '#FDF2E6',
              color: '#B36A1F',
              fontSize: 11,
              fontWeight: 700,
              padding: '5px 12px',
              borderRadius: 20,
            }}
          >
            {usageText(usageLimit)}
          </span>
          <span
            style={{
              background: '#DB8633',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              padding: '9px 22px',
              borderRadius: 20,
            }}
          >
            Redeem
          </span>
        </div>

        {terms?.trim() && (
          <div
            style={{
              fontSize: 11,
              color: '#9CA3AF',
              fontStyle: 'italic',
              marginTop: 10,
              lineHeight: '16px',
            }}
          >
            {terms}
          </div>
        )}
      </div>
    </div>
  );
};

/** The reference card shown beside the form as the standard to aim for. */
export const SAMPLE_DISCOUNT = {
  title: '20% off your entire order',
  description:
    'Valid on all food and non-alcoholic drinks, dine-in or takeout. Show the code at the register before you pay.',
  terms: 'One per visit. Not valid with other offers or on holidays.',
  availability: 'in-store',
  usageLimit: 'monthly',
};

export default DiscountCardPreview;
