# 📚 Admin Panel Referral System Documentation

## 🎯 Overview

This comprehensive guide documents the complete referral system implementation for the admin panel. It covers database schema, API endpoints, business logic, milestone system, and admin panel features.

---

## 📊 Table of Contents

1. [Database Schema](#database-schema)
2. [Referral Flow & Status Transitions](#referral-flow--status-transitions)
3. [Milestone System](#milestone-system)
4. [API Endpoints](#api-endpoints)
5. [Admin Panel Features](#admin-panel-features)
6. [Webhook Integration](#webhook-integration)
7. [Business Rules](#business-rules)
8. [SQL Queries](#sql-queries)
9. [Edge Cases & Error Handling](#edge-cases--error-handling)

---

## 🗄️ Database Schema

### 1. `referrals` Table

Tracks referral relationships and their status throughout the lifecycle.

```sql
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  referral_code VARCHAR(50) UNIQUE NOT NULL,
  referral_link VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'payment_setup', 'paid', 'cancelled')),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  signed_up_at TIMESTAMP,
  payment_setup_at TIMESTAMP,
  paid_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancelled_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX idx_referrals_created_at ON referrals(created_at);
```

**Key Fields:**
- `referrer_id`: User who made the referral
- `referred_user_id`: User who was referred (null until signup)
- `referral_code`: Unique code for tracking
- `status`: Current status in the referral lifecycle
- `metadata`: Flexible JSON field for additional tracking data

---

### 2. `referral_milestones` Table

Tracks unlocked milestones for referrers.

```sql
CREATE TABLE referral_milestones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_type VARCHAR(20) NOT NULL CHECK (milestone_type IN ('1_friend', '5_friends', '10_friends', '25_friends')),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  reward_type VARCHAR(50) NOT NULL CHECK (reward_type IN ('credits', 'badge', 'vip_access', 'recognition')),
  reward_value DECIMAL(10, 2),
  reward_description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, milestone_type)
);

-- Indexes
CREATE INDEX idx_referral_milestones_user_id ON referral_milestones(user_id);
CREATE INDEX idx_referral_milestones_milestone_type ON referral_milestones(milestone_type);
CREATE INDEX idx_referral_milestones_unlocked_at ON referral_milestones(unlocked_at);
```

**Milestone Types:**
- `1_friend`: First successful referral
- `5_friends`: 5 successful referrals
- `10_friends`: 10 successful referrals
- `25_friends`: 25 successful referrals

---

### 3. `user_credits` Table

Tracks credits earned and applied by users.

```sql
CREATE TABLE user_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  source VARCHAR(50) NOT NULL CHECK (source IN ('referral', 'milestone', 'manual', 'promotion')),
  source_reference_id INTEGER, -- References referral_id, milestone_id, etc.
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'applied', 'expired')),
  expires_at TIMESTAMP,
  applied_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_user_credits_status ON user_credits(status);
CREATE INDEX idx_user_credits_expires_at ON user_credits(expires_at);
CREATE INDEX idx_user_credits_source ON user_credits(source);
```

**Credit Lifecycle:**
- Credits expire after 90 days if not applied
- Status transitions: `active` → `applied` or `expired`

---

### 4. `user_badges` Table

Tracks badges earned by users.

```sql
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  earned_at TIMESTAMP DEFAULT NOW(),
  source VARCHAR(50) NOT NULL CHECK (source IN ('referral', 'milestone', 'manual', 'achievement')),
  source_reference_id INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(user_id, badge_type)
);

-- Indexes
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_type ON user_badges(badge_type);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at);
```

**Badge Types:**
- `referral_pioneer`: First referral milestone
- `referral_champion`: 5 referrals milestone
- `referral_ambassador`: 10 referrals milestone
- `referral_legend`: 25 referrals milestone

---

## 🔄 Referral Flow & Status Transitions

### Status Flow Diagram

```
pending → signed_up → payment_setup → paid
                              ↓
                         cancelled
```

### Status Definitions

1. **`pending`** (Initial State)
   - Referral link created/shared
   - No action taken by referred user yet
   - **Trigger**: User shares referral link

2. **`signed_up`**
   - Referred user created an account
   - **Trigger**: User completes signup with referral code
   - **Action**: Update `referred_user_id`, set `signed_up_at`

3. **`payment_setup`**
   - Referred user added payment method
   - **Trigger**: Stripe webhook `payment_method.attached`
   - **Action**: Set `payment_setup_at`

4. **`paid`** (Success State)
   - Referred user made first payment
   - **Trigger**: Stripe webhook `invoice.payment_succeeded` (first payment)
   - **Action**: 
     - Set `paid_at`
     - Award credits to referrer
     - Check for milestone unlocks
     - Only `paid` referrals count toward milestones

5. **`cancelled`**
   - Referral was cancelled (subscription cancelled, account deleted, etc.)
   - **Trigger**: Stripe webhook `customer.subscription.deleted` or manual cancellation
   - **Action**: Set `cancelled_at`, record `cancelled_reason`

### Status Transition Logic

```sql
-- Example: Update referral status to signed_up
UPDATE referrals
SET 
  status = 'signed_up',
  referred_user_id = $1,
  signed_up_at = NOW(),
  updated_at = NOW()
WHERE referral_code = $2 AND status = 'pending';

-- Example: Update referral status to paid
UPDATE referrals
SET 
  status = 'paid',
  paid_at = NOW(),
  updated_at = NOW()
WHERE referred_user_id = $1 AND status = 'payment_setup';
```

---

## 🏆 Milestone System

### Milestone Definitions

| Milestone | Friends Required | Reward Type | Reward Value | Badge Awarded |
|-----------|-----------------|-------------|--------------|---------------|
| 1 Friend | 1 | Credits | $10 | referral_pioneer |
| 5 Friends | 5 | Credits + Badge | $50 | referral_champion |
| 10 Friends | 10 | Credits + VIP Access | $100 | referral_ambassador |
| 25 Friends | 25 | Credits + Recognition | $250 | referral_legend |

### Milestone Check Logic

**Important**: Only referrals with `status = 'paid'` count toward milestones.

```sql
-- Function to check and unlock milestones
CREATE OR REPLACE FUNCTION check_referral_milestones(p_user_id INTEGER)
RETURNS TABLE(milestone_type VARCHAR, unlocked BOOLEAN) AS $$
DECLARE
  paid_count INTEGER;
BEGIN
  -- Count paid referrals
  SELECT COUNT(*) INTO paid_count
  FROM referrals
  WHERE referrer_id = p_user_id AND status = 'paid';
  
  -- Check each milestone
  -- 1 Friend
  IF paid_count >= 1 THEN
    INSERT INTO referral_milestones (user_id, milestone_type, reward_type, reward_value, reward_description)
    VALUES (p_user_id, '1_friend', 'credits', 10.00, 'First referral milestone')
    ON CONFLICT (user_id, milestone_type) DO NOTHING;
    
    -- Award credits
    INSERT INTO user_credits (user_id, amount, source, source_reference_id, expires_at, description)
    VALUES (p_user_id, 10.00, 'milestone', 
            (SELECT id FROM referral_milestones WHERE user_id = p_user_id AND milestone_type = '1_friend'),
            NOW() + INTERVAL '90 days', '1 Friend Milestone Reward');
    
    -- Award badge
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, source, source_reference_id)
    VALUES (p_user_id, 'referral_pioneer', 'Referral Pioneer', 'Successfully referred your first friend!', 'milestone',
            (SELECT id FROM referral_milestones WHERE user_id = p_user_id AND milestone_type = '1_friend'))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- 5 Friends
  IF paid_count >= 5 THEN
    INSERT INTO referral_milestones (user_id, milestone_type, reward_type, reward_value, reward_description)
    VALUES (p_user_id, '5_friends', 'credits', 50.00, '5 referrals milestone')
    ON CONFLICT (user_id, milestone_type) DO NOTHING;
    
    INSERT INTO user_credits (user_id, amount, source, source_reference_id, expires_at, description)
    VALUES (p_user_id, 50.00, 'milestone', 
            (SELECT id FROM referral_milestones WHERE user_id = p_user_id AND milestone_type = '5_friends'),
            NOW() + INTERVAL '90 days', '5 Friends Milestone Reward')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, source, source_reference_id)
    VALUES (p_user_id, 'referral_champion', 'Referral Champion', 'Referred 5 friends!', 'milestone',
            (SELECT id FROM referral_milestones WHERE user_id = p_user_id AND milestone_type = '5_friends'))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- 10 Friends
  IF paid_count >= 10 THEN
    INSERT INTO referral_milestones (user_id, milestone_type, reward_type, reward_value, reward_description)
    VALUES (p_user_id, '10_friends', 'vip_access', 100.00, '10 referrals milestone')
    ON CONFLICT (user_id, milestone_type) DO NOTHING;
    
    INSERT INTO user_credits (user_id, amount, source, source_reference_id, expires_at, description)
    VALUES (p_user_id, 100.00, 'milestone', 
            (SELECT id FROM referral_milestones WHERE user_id = p_user_id AND milestone_type = '10_friends'),
            NOW() + INTERVAL '90 days', '10 Friends Milestone Reward')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, source, source_reference_id)
    VALUES (p_user_id, 'referral_ambassador', 'Referral Ambassador', 'Referred 10 friends!', 'milestone',
            (SELECT id FROM referral_milestones WHERE user_id = p_user_id AND milestone_type = '10_friends'))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- 25 Friends
  IF paid_count >= 25 THEN
    INSERT INTO referral_milestones (user_id, milestone_type, reward_type, reward_value, reward_description)
    VALUES (p_user_id, '25_friends', 'recognition', 250.00, '25 referrals milestone')
    ON CONFLICT (user_id, milestone_type) DO NOTHING;
    
    INSERT INTO user_credits (user_id, amount, source, source_reference_id, expires_at, description)
    VALUES (p_user_id, 250.00, 'milestone', 
            (SELECT id FROM referral_milestones WHERE user_id = p_user_id AND milestone_type = '25_friends'),
            NOW() + INTERVAL '90 days', '25 Friends Milestone Reward')
    ON CONFLICT DO NOTHING;
    
    INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, source, source_reference_id)
    VALUES (p_user_id, 'referral_legend', 'Referral Legend', 'Referred 25 friends!', 'milestone',
            (SELECT id FROM referral_milestones WHERE user_id = p_user_id AND milestone_type = '25_friends'))
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN QUERY
  SELECT rm.milestone_type, TRUE as unlocked
  FROM referral_milestones rm
  WHERE rm.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

### When to Check Milestones

Milestones should be checked:
1. When a referral status changes to `paid`
2. Manually via admin panel
3. Via scheduled job (daily check for missed milestones)

---

## 🔌 API Endpoints

### 1. Get Referral Analytics

**Endpoint**: `GET /api/admin/analytics/referrals?period=30d`

**Query Parameters:**
- `period`: Time period (`7d`, `30d`, `90d`, `1y`, `all`)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_referrals": 1250,
      "successful_referrals": 890,
      "pending_referrals": 120,
      "conversion_rate": 71.2,
      "total_revenue": 44500.00,
      "average_referral_value": 50.00
    },
    "top_referrers": [
      {
        "user_id": 123,
        "name": "John Doe",
        "email": "john@example.com",
        "total_referrals": 45,
        "successful_referrals": 32,
        "conversion_rate": 71.1,
        "points_earned": 3200,
        "total_value": 1600.00,
        "rank": 1
      }
    ],
    "status_breakdown": {
      "pending": 120,
      "signed_up": 180,
      "payment_setup": 60,
      "paid": 890,
      "cancelled": 0
    },
    "monthly_trends": [
      {
        "month": "2024-01",
        "referrals": 150,
        "successful": 110,
        "revenue": 5500.00
      }
    ]
  }
}
```

**SQL Query:**
```sql
-- Get referral overview
SELECT 
  COUNT(*) as total_referrals,
  COUNT(*) FILTER (WHERE status = 'paid') as successful_referrals,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_referrals,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'paid')::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE status != 'pending'), 0) * 100, 
    2
  ) as conversion_rate
FROM referrals
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Get top referrers
SELECT 
  u.id as user_id,
  u.name,
  u.email,
  COUNT(r.id) as total_referrals,
  COUNT(r.id) FILTER (WHERE r.status = 'paid') as successful_referrals,
  ROUND(
    COUNT(r.id) FILTER (WHERE r.status = 'paid')::NUMERIC / 
    NULLIF(COUNT(r.id) FILTER (WHERE r.status != 'pending'), 0) * 100, 
    2
  ) as conversion_rate,
  COALESCE(SUM(uc.amount) FILTER (WHERE uc.status = 'active'), 0) as points_earned,
  COUNT(r.id) FILTER (WHERE r.status = 'paid') * 50.00 as total_value
FROM users u
LEFT JOIN referrals r ON r.referrer_id = u.id
LEFT JOIN user_credits uc ON uc.user_id = u.id AND uc.source = 'referral'
WHERE r.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.name, u.email
ORDER BY successful_referrals DESC
LIMIT 10;
```

---

### 2. Get User Referral Details

**Endpoint**: `GET /api/admin/users/:userId/referrals`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "referral_stats": {
      "total_referrals": 45,
      "successful_referrals": 32,
      "pending": 5,
      "signed_up": 3,
      "payment_setup": 2,
      "paid": 32,
      "cancelled": 3,
      "conversion_rate": 71.1,
      "total_credits_earned": 320.00,
      "active_credits": 250.00,
      "expired_credits": 70.00
    },
    "milestones": [
      {
        "milestone_type": "1_friend",
        "unlocked_at": "2024-01-15T10:30:00Z",
        "reward_type": "credits",
        "reward_value": 10.00
      },
      {
        "milestone_type": "5_friends",
        "unlocked_at": "2024-02-20T14:20:00Z",
        "reward_type": "credits",
        "reward_value": 50.00
      }
    ],
    "badges": [
      {
        "badge_type": "referral_pioneer",
        "badge_name": "Referral Pioneer",
        "earned_at": "2024-01-15T10:30:00Z"
      }
    ],
    "referrals": [
      {
        "id": 1,
        "referred_user_id": 456,
        "referred_user_name": "Jane Smith",
        "referral_code": "JOHN123",
        "status": "paid",
        "created_at": "2024-01-15T10:00:00Z",
        "paid_at": "2024-01-20T15:30:00Z"
      }
    ]
  }
}
```

**SQL Query:**
```sql
-- Get user referral details
SELECT 
  r.id,
  r.referred_user_id,
  u2.name as referred_user_name,
  r.referral_code,
  r.status,
  r.created_at,
  r.signed_up_at,
  r.payment_setup_at,
  r.paid_at,
  r.cancelled_at
FROM referrals r
LEFT JOIN users u2 ON r.referred_user_id = u2.id
WHERE r.referrer_id = $1
ORDER BY r.created_at DESC;
```

---

### 3. Manual Credit Grant

**Endpoint**: `POST /api/admin/users/:userId/credits`

**Request Body:**
```json
{
  "amount": 50.00,
  "description": "Manual credit adjustment",
  "expires_in_days": 90,
  "source": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "credit_id": 789,
    "user_id": 123,
    "amount": 50.00,
    "status": "active",
    "expires_at": "2024-04-20T10:00:00Z"
  }
}
```

**SQL Query:**
```sql
INSERT INTO user_credits (user_id, amount, source, description, expires_at, status)
VALUES ($1, $2, 'manual', $3, NOW() + ($4 || ' days')::INTERVAL, 'active')
RETURNING *;
```

---

### 4. Manual Badge Grant

**Endpoint**: `POST /api/admin/users/:userId/badges`

**Request Body:**
```json
{
  "badge_type": "referral_champion",
  "badge_name": "Referral Champion",
  "badge_description": "Manually awarded",
  "source": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "badge_id": 456,
    "user_id": 123,
    "badge_type": "referral_champion",
    "earned_at": "2024-03-15T10:00:00Z"
  }
}
```

---

### 5. Check Milestones for User

**Endpoint**: `POST /api/admin/users/:userId/check-milestones`

**Response:**
```json
{
  "success": true,
  "data": {
    "milestones_unlocked": [
      {
        "milestone_type": "10_friends",
        "unlocked_at": "2024-03-15T10:00:00Z"
      }
    ],
    "credits_awarded": 100.00,
    "badges_awarded": ["referral_ambassador"]
  }
}
```

---

## 🎛️ Admin Panel Features

### Dashboard Metrics

The admin panel should display:

1. **Referral Overview Cards:**
   - Total Referrals
   - Successful Referrals
   - Conversion Rate
   - Total Revenue from Referrals
   - Average Referral Value
   - Pending Referrals

2. **User Referral Details Page** (4 Tabs):

   **Tab 1: Overview**
   - User information
   - Referral statistics
   - Current milestone progress
   - Active credits balance
   - Badges earned

   **Tab 2: Referrals List**
   - Table of all referrals
   - Status filters
   - Date range filters
   - Export functionality

   **Tab 3: Credits History**
   - All credits earned/applied/expired
   - Filter by source (referral, milestone, manual)
   - Credit expiration warnings

   **Tab 4: Badges**
   - All badges earned
   - Badge details and descriptions
   - Achievement timeline

### Management Actions

1. **Manual Credit Grant**
   - Amount input
   - Description field
   - Expiration date picker
   - Source selection

2. **Manual Badge Grant**
   - Badge type selector
   - Custom badge creation
   - Badge removal (if needed)

3. **Milestone Check**
   - Trigger manual milestone check
   - View milestone progress
   - Unlock milestones manually (if needed)

4. **Referral Status Adjustment**
   - Change referral status manually
   - Add cancellation reason
   - Update referral metadata

### Analytics & Reporting

1. **Top Referrers Leaderboard**
   - Rank by successful referrals
   - Conversion rates
   - Points earned
   - Total value generated

2. **Conversion Funnel**
   - pending → signed_up → payment_setup → paid
   - Drop-off analysis
   - Time-to-conversion metrics

3. **Revenue Reporting**
   - Revenue by referrer
   - Revenue by time period
   - Average referral value trends

4. **Milestone Analytics**
   - Users at each milestone level
   - Milestone unlock rates
   - Reward distribution

---

## 🔗 Webhook Integration

### Stripe Webhook Handlers

#### 1. Payment Method Attached

**Event**: `payment_method.attached`

**Handler Logic:**
```typescript
// When a user adds a payment method
async function handlePaymentMethodAttached(event) {
  const customerId = event.data.object.customer;
  
  // Find user by Stripe customer ID
  const user = await findUserByStripeCustomerId(customerId);
  
  if (!user) return;
  
  // Update referral status to payment_setup
  await updateReferralStatus({
    referred_user_id: user.id,
    status: 'payment_setup',
    payment_setup_at: new Date()
  });
}
```

**SQL:**
```sql
UPDATE referrals
SET 
  status = 'payment_setup',
  payment_setup_at = NOW(),
  updated_at = NOW()
WHERE referred_user_id = $1 
  AND status = 'signed_up';
```

---

#### 2. Invoice Payment Succeeded (First Payment)

**Event**: `invoice.payment_succeeded`

**Handler Logic:**
```typescript
// When a user makes their first payment
async function handleInvoicePaymentSucceeded(event) {
  const customerId = event.data.object.customer;
  const invoice = event.data.object;
  
  // Check if this is the first payment
  const isFirstPayment = await checkIfFirstPayment(customerId);
  
  if (!isFirstPayment) return;
  
  const user = await findUserByStripeCustomerId(customerId);
  
  if (!user) return;
  
  // Update referral status to paid
  await updateReferralStatus({
    referred_user_id: user.id,
    status: 'paid',
    paid_at: new Date()
  });
  
  // Award credits to referrer
  const referral = await getReferralByReferredUserId(user.id);
  if (referral) {
    await awardReferralCredits(referral.referrer_id, 10.00);
    
    // Check for milestone unlocks
    await checkReferralMilestones(referral.referrer_id);
  }
}
```

**SQL:**
```sql
-- Update referral to paid
UPDATE referrals
SET 
  status = 'paid',
  paid_at = NOW(),
  updated_at = NOW()
WHERE referred_user_id = $1 
  AND status = 'payment_setup';

-- Award credits to referrer
INSERT INTO user_credits (user_id, amount, source, source_reference_id, expires_at, description)
SELECT 
  referrer_id,
  10.00,
  'referral',
  id,
  NOW() + INTERVAL '90 days',
  'Referral reward for ' || (SELECT email FROM users WHERE id = referred_user_id)
FROM referrals
WHERE referred_user_id = $1 AND status = 'paid';

-- Check milestones
SELECT check_referral_milestones(referrer_id)
FROM referrals
WHERE referred_user_id = $1 AND status = 'paid';
```

---

#### 3. Subscription Deleted

**Event**: `customer.subscription.deleted`

**Handler Logic:**
```typescript
// When a subscription is cancelled
async function handleSubscriptionDeleted(event) {
  const customerId = event.data.object.customer;
  
  const user = await findUserByStripeCustomerId(customerId);
  
  if (!user) return;
  
  // Update referral status to cancelled
  await updateReferralStatus({
    referred_user_id: user.id,
    status: 'cancelled',
    cancelled_at: new Date(),
    cancelled_reason: 'Subscription cancelled'
  });
  
  // Note: Credits already awarded are not revoked
  // Milestone counts remain (only paid referrals count)
}
```

**SQL:**
```sql
UPDATE referrals
SET 
  status = 'cancelled',
  cancelled_at = NOW(),
  cancelled_reason = 'Subscription cancelled',
  updated_at = NOW()
WHERE referred_user_id = $1 
  AND status IN ('paid', 'payment_setup');
```

---

## 📋 Business Rules

### 1. Only Paid Referrals Count

- **Rule**: Only referrals with `status = 'paid'` count toward milestones
- **Rationale**: Ensures quality referrals and prevents gaming
- **Implementation**: Milestone check function filters by `status = 'paid'`

### 2. Milestones Are One-Time

- **Rule**: Each milestone can only be unlocked once per user
- **Implementation**: `UNIQUE(user_id, milestone_type)` constraint
- **Note**: Use `ON CONFLICT DO NOTHING` when inserting

### 3. Credits Expire After 90 Days

- **Rule**: Credits expire 90 days after being awarded if not applied
- **Implementation**: `expires_at = NOW() + INTERVAL '90 days'`
- **Cleanup**: Run daily job to update expired credits

```sql
-- Daily job to expire credits
UPDATE user_credits
SET status = 'expired'
WHERE status = 'active' 
  AND expires_at < NOW();
```

### 4. Badges Are Permanent

- **Rule**: Badges cannot be revoked (except manual admin action)
- **Implementation**: No automatic badge removal
- **Note**: Badges represent achievements and should persist

### 5. Referral Code Uniqueness

- **Rule**: Each referral code must be unique
- **Implementation**: `UNIQUE` constraint on `referral_code`
- **Generation**: Use UUID or user-specific code format

### 6. Self-Referral Prevention

- **Rule**: Users cannot refer themselves
- **Implementation**: Check `referrer_id != referred_user_id` before creating referral

### 7. One Referral Per User

- **Rule**: Each referred user can only be associated with one referral
- **Implementation**: `UNIQUE(referred_user_id)` constraint (with NULL handling)

---

## 📊 SQL Queries

### Referral Statistics

```sql
-- Overall referral statistics
SELECT 
  COUNT(*) as total_referrals,
  COUNT(*) FILTER (WHERE status = 'paid') as successful,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'paid')::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE status != 'pending'), 0) * 100, 
    2
  ) as conversion_rate
FROM referrals;
```

### Top Referrers

```sql
-- Top 10 referrers by successful referrals
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(r.id) FILTER (WHERE r.status = 'paid') as successful_referrals,
  COUNT(r.id) as total_referrals,
  ROUND(
    COUNT(r.id) FILTER (WHERE r.status = 'paid')::NUMERIC / 
    NULLIF(COUNT(r.id) FILTER (WHERE r.status != 'pending'), 0) * 100, 
    2
  ) as conversion_rate,
  COALESCE(SUM(uc.amount) FILTER (WHERE uc.status = 'active'), 0) as active_credits
FROM users u
LEFT JOIN referrals r ON r.referrer_id = u.id
LEFT JOIN user_credits uc ON uc.user_id = u.id AND uc.source = 'referral'
GROUP BY u.id, u.name, u.email
HAVING COUNT(r.id) FILTER (WHERE r.status = 'paid') > 0
ORDER BY successful_referrals DESC
LIMIT 10;
```

### Conversion Funnel

```sql
-- Referral conversion funnel
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM referrals
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY status
ORDER BY 
  CASE status
    WHEN 'pending' THEN 1
    WHEN 'signed_up' THEN 2
    WHEN 'payment_setup' THEN 3
    WHEN 'paid' THEN 4
    WHEN 'cancelled' THEN 5
  END;
```

### Revenue Reporting

```sql
-- Revenue from referrals (estimated)
SELECT 
  DATE_TRUNC('month', r.paid_at) as month,
  COUNT(*) as paid_referrals,
  COUNT(*) * 50.00 as estimated_revenue, -- Adjust based on actual subscription value
  COUNT(DISTINCT r.referrer_id) as active_referrers
FROM referrals r
WHERE r.status = 'paid'
  AND r.paid_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', r.paid_at)
ORDER BY month DESC;
```

### Milestone Distribution

```sql
-- Users at each milestone level
SELECT 
  rm.milestone_type,
  COUNT(DISTINCT rm.user_id) as users_count,
  SUM(rm.reward_value) as total_rewards_awarded
FROM referral_milestones rm
GROUP BY rm.milestone_type
ORDER BY 
  CASE rm.milestone_type
    WHEN '1_friend' THEN 1
    WHEN '5_friends' THEN 2
    WHEN '10_friends' THEN 3
    WHEN '25_friends' THEN 4
  END;
```

### Credit Analytics

```sql
-- Credit status breakdown
SELECT 
  source,
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount
FROM user_credits
GROUP BY source, status
ORDER BY source, status;

-- Credits expiring soon (next 7 days)
SELECT 
  uc.user_id,
  u.name,
  u.email,
  SUM(uc.amount) as expiring_credits,
  MIN(uc.expires_at) as earliest_expiry
FROM user_credits uc
JOIN users u ON u.id = uc.user_id
WHERE uc.status = 'active'
  AND uc.expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
GROUP BY uc.user_id, u.name, u.email
ORDER BY earliest_expiry;
```

### User Referral Details

```sql
-- Complete user referral profile
SELECT 
  u.id,
  u.name,
  u.email,
  COUNT(r.id) as total_referrals,
  COUNT(r.id) FILTER (WHERE r.status = 'paid') as successful_referrals,
  COUNT(rm.id) as milestones_unlocked,
  COALESCE(SUM(uc.amount) FILTER (WHERE uc.status = 'active'), 0) as active_credits,
  COUNT(ub.id) as badges_earned
FROM users u
LEFT JOIN referrals r ON r.referrer_id = u.id
LEFT JOIN referral_milestones rm ON rm.user_id = u.id
LEFT JOIN user_credits uc ON uc.user_id = u.id AND uc.status = 'active'
LEFT JOIN user_badges ub ON ub.user_id = u.id
WHERE u.id = $1
GROUP BY u.id, u.name, u.email;
```

---

## ⚠️ Edge Cases & Error Handling

### 1. Cancelled Subscriptions

**Scenario**: User cancels subscription after being marked as `paid`

**Handling:**
- Update referral status to `cancelled`
- Do NOT revoke credits already awarded
- Do NOT reduce milestone counts (milestones are based on paid referrals at time of payment)
- Record cancellation reason

```sql
UPDATE referrals
SET 
  status = 'cancelled',
  cancelled_at = NOW(),
  cancelled_reason = 'Subscription cancelled',
  updated_at = NOW()
WHERE referred_user_id = $1 AND status = 'paid';
```

### 2. Multiple Referral Attempts

**Scenario**: Same user tries to use multiple referral codes

**Handling:**
- Only the first referral code used counts
- Subsequent attempts are ignored
- Log attempts in metadata for audit

```sql
-- Check if user already has a referral
SELECT id FROM referrals WHERE referred_user_id = $1;

-- If exists, don't create new referral
```

### 3. Account Deletions

**Scenario**: Referred user deletes their account

**Handling:**
- Set `referred_user_id` to NULL (ON DELETE SET NULL)
- Keep referral record for analytics
- Update status to `cancelled` if not already
- Preserve referrer credits and milestones

### 4. Credit Expiration

**Scenario**: Credits expire before being used

**Handling:**
- Daily job updates status to `expired`
- Send notification to user before expiration (7 days prior)
- Show expired credits in history (don't delete)

```sql
-- Daily expiration job
UPDATE user_credits
SET status = 'expired'
WHERE status = 'active' 
  AND expires_at < NOW();

-- Notification query (7 days before expiration)
SELECT 
  uc.user_id,
  u.email,
  SUM(uc.amount) as expiring_amount,
  MIN(uc.expires_at) as earliest_expiry
FROM user_credits uc
JOIN users u ON u.id = uc.user_id
WHERE uc.status = 'active'
  AND uc.expires_at BETWEEN NOW() AND NOW() + INTERVAL '7 days'
GROUP BY uc.user_id, u.email;
```

### 5. Duplicate Milestone Unlocks

**Scenario**: System tries to unlock same milestone twice

**Handling:**
- `UNIQUE(user_id, milestone_type)` constraint prevents duplicates
- Use `ON CONFLICT DO NOTHING` in insert statements
- Log attempts for debugging

### 6. Webhook Failures

**Scenario**: Stripe webhook fails or is delayed

**Handling:**
- Implement idempotency keys
- Retry failed webhooks
- Manual status updates via admin panel
- Scheduled job to check for missed status updates

```sql
-- Find referrals that might need status update
SELECT r.*
FROM referrals r
JOIN users u ON r.referred_user_id = u.id
WHERE r.status = 'payment_setup'
  AND EXISTS (
    SELECT 1 FROM stripe_payments sp
    WHERE sp.user_id = u.id
      AND sp.status = 'succeeded'
      AND sp.created_at > r.payment_setup_at
  );
```

### 7. Invalid Referral Codes

**Scenario**: User signs up with invalid/non-existent referral code

**Handling:**
- Validate referral code exists before creating referral
- Return error message to user
- Log invalid attempts for fraud detection

### 8. Self-Referrals

**Scenario**: User tries to refer themselves

**Handling:**
- Check `referrer_id != referred_user_id` before creating
- Return error: "You cannot refer yourself"
- Log attempt for audit

---

## 🚀 Implementation Checklist

### Backend Tasks

- [ ] Create database tables (referrals, referral_milestones, user_credits, user_badges)
- [ ] Implement referral code generation
- [ ] Create referral creation endpoint
- [ ] Implement status update logic
- [ ] Create milestone check function
- [ ] Set up Stripe webhook handlers
- [ ] Implement credit expiration job
- [ ] Create admin API endpoints
- [ ] Add error handling and logging

### Admin Panel Tasks

- [ ] Build referral analytics dashboard
- [ ] Create user referral details page (4 tabs)
- [ ] Implement manual credit grant UI
- [ ] Implement manual badge grant UI
- [ ] Add milestone check button
- [ ] Build top referrers leaderboard
- [ ] Create conversion funnel visualization
- [ ] Add export functionality
- [ ] Implement filters and date ranges

### Testing Tasks

- [ ] Test referral creation flow
- [ ] Test status transitions
- [ ] Test milestone unlocking
- [ ] Test credit expiration
- [ ] Test webhook handlers
- [ ] Test edge cases
- [ ] Test admin panel features
- [ ] Load testing for analytics queries

---

## 📝 Notes

- All timestamps should be stored in UTC
- Use transactions for multi-step operations (status update + credit award)
- Implement proper logging for audit trails
- Consider rate limiting on referral creation
- Monitor for fraud patterns (rapid referrals, self-referrals, etc.)
- Regularly backup referral data for analytics

---

## 🔗 Related Documentation

- [Backend Connection Guide](./BACKEND_CONNECTION_GUIDE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Database Schema Updates](./DATABASE_SCHEMA_UPDATE.sql)

---

**Last Updated**: 2024-03-15
**Version**: 1.0.0







