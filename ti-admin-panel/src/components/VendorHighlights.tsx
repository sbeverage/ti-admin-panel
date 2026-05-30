import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import {
  ShoppingOutlined,
  TagOutlined,
  TrophyOutlined,
  FireOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const BRAND_ORANGE = '#DB8633';
const BRAND_TEAL = '#324E58';
const DANGER_RED = '#ff4d4f';

interface ActiveStats {
  count: number;
  withLiveDiscount: number;
}
interface TopBySavings {
  vendorId: number;
  name: string;
  totalSavings: number;
}
interface TopByRedemptions {
  vendorId: number;
  name: string;
  count: number;
}
export interface VendorHighlightsData {
  active: ActiveStats;
  withoutActiveDiscount: number;
  topBySavings: TopBySavings | null;
  topByRedemptions: TopByRedemptions | null;
}

interface Props {
  data: VendorHighlightsData | null;
}

const money = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
};

const IconChip: React.FC<{ icon: React.ReactNode; tone: string }> = ({
  icon,
  tone,
}) => (
  <div
    style={{
      position: 'absolute',
      top: 20,
      right: 20,
      width: 36,
      height: 36,
      borderRadius: 18,
      background: `${tone}1A`,
      color: tone,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
    }}
  >
    {icon}
  </div>
);

const HighlightCard: React.FC<{
  label: string;
  hero: string;
  heroSuffix?: string;
  detail?: React.ReactNode;
  icon: React.ReactNode;
  tone: string;
  heroColor?: string;
}> = ({ label, hero, heroSuffix, detail, icon, tone, heroColor }) => (
  <Card style={{ position: 'relative', minHeight: 160 }}>
    <IconChip icon={icon} tone={tone} />
    <Text
      type="secondary"
      style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}
    >
      {label}
    </Text>
    <div style={{ marginTop: 12 }}>
      <span style={{ fontSize: 32, fontWeight: 700, color: heroColor }}>
        {hero}
      </span>
      {heroSuffix && (
        <Text type="secondary" style={{ marginLeft: 8 }}>
          {heroSuffix}
        </Text>
      )}
    </div>
    <div style={{ marginTop: 8 }}>{detail}</div>
  </Card>
);

const VendorHighlights: React.FC<Props> = ({ data }) => {
  const active = data?.active ?? { count: 0, withLiveDiscount: 0 };
  const withoutDiscount = data?.withoutActiveDiscount ?? 0;
  const topSavings = data?.topBySavings ?? null;
  const topRedemptions = data?.topByRedemptions ?? null;
  const dormantCount = Math.max(0, active.count - active.withLiveDiscount);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Active Vendors"
          hero={active.count.toLocaleString()}
          heroSuffix={active.count === 1 ? 'vendor' : 'vendors'}
          icon={<ShoppingOutlined />}
          tone={BRAND_TEAL}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {active.withLiveDiscount.toLocaleString()} offering live discounts
              {dormantCount > 0 &&
                ` · ${dormantCount.toLocaleString()} dormant`}
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Without Discounts"
          hero={withoutDiscount.toLocaleString()}
          heroSuffix={withoutDiscount === 1 ? 'vendor' : 'vendors'}
          heroColor={withoutDiscount > 0 ? DANGER_RED : undefined}
          icon={<TagOutlined />}
          tone={withoutDiscount > 0 ? DANGER_RED : BRAND_TEAL}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {withoutDiscount > 0
                ? 'Signed up but no live offer — chase to publish'
                : 'Every active vendor has at least one live discount'}
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Top by Savings"
          hero={topSavings ? money(topSavings.totalSavings) : '—'}
          heroSuffix={topSavings ? 'saved' : undefined}
          icon={<TrophyOutlined />}
          tone={BRAND_ORANGE}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {topSavings ? topSavings.name : 'No redemptions yet'}
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Top by Redemptions"
          hero={
            topRedemptions ? topRedemptions.count.toLocaleString() : '—'
          }
          heroSuffix={
            topRedemptions
              ? topRedemptions.count === 1
                ? 'redemption'
                : 'redemptions'
              : undefined
          }
          icon={<FireOutlined />}
          tone={BRAND_ORANGE}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {topRedemptions
                ? topRedemptions.name
                : 'No redemptions yet'}
            </Text>
          }
        />
      </Col>
    </Row>
  );
};

export default VendorHighlights;
