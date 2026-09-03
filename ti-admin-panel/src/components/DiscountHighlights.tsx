import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import {
  GiftOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const BRAND_ORANGE = '#DB8633';
const BRAND_TEAL = '#324E58';
const SUCCESS_GREEN = '#52c41a';
const DANGER_RED = '#ff4d4f';

interface ActiveDiscounts {
  count: number;
  vendorCount: number;
}
interface RedemptionsMonth {
  count: number;
  growthRate: number;
}
interface TopPerforming {
  discountId: number;
  title: string;
  vendorName: string | null;
  totalSavings: number;
}
export interface DiscountHighlightsData {
  activeDiscounts: ActiveDiscounts;
  redemptionsMonth: RedemptionsMonth;
  topPerforming: TopPerforming | null;
}

interface Props {
  data: DiscountHighlightsData | null;
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

const DiscountHighlights: React.FC<Props> = ({ data }) => {
  const active = data?.activeDiscounts ?? { count: 0, vendorCount: 0 };
  const monthly = data?.redemptionsMonth ?? { count: 0, growthRate: 0 };
  const top = data?.topPerforming ?? null;

  const growthArrow =
    monthly.growthRate > 0 ? (
      <ArrowUpOutlined />
    ) : monthly.growthRate < 0 ? (
      <ArrowDownOutlined />
    ) : null;
  const growthColor =
    monthly.growthRate > 0
      ? SUCCESS_GREEN
      : monthly.growthRate < 0
      ? DANGER_RED
      : '#8c8c8c';

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={8}>
        <HighlightCard
          label="Active Discounts"
          hero={active.count.toLocaleString()}
          heroSuffix={active.count === 1 ? 'offer' : 'offers'}
          icon={<GiftOutlined />}
          tone={BRAND_TEAL}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              From {active.vendorCount.toLocaleString()} vendor
              {active.vendorCount === 1 ? '' : 's'}
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={8}>
        <HighlightCard
          label="Redemptions This Month"
          hero={monthly.count.toLocaleString()}
          heroSuffix={monthly.count === 1 ? 'redemption' : 'redemptions'}
          icon={<ThunderboltOutlined />}
          tone={BRAND_ORANGE}
          detail={
            <span style={{ fontSize: 12, color: growthColor }}>
              {growthArrow} {Math.abs(monthly.growthRate)}% vs last month
            </span>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={8}>
        <HighlightCard
          label="Top Performing Discount"
          hero={top ? money(top.totalSavings) : '—'}
          heroSuffix={top ? 'saved' : undefined}
          icon={<TrophyOutlined />}
          tone={BRAND_ORANGE}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {top
                ? `${top.title}${top.vendorName ? ` · ${top.vendorName}` : ''}`
                : 'No redemptions yet'}
            </Text>
          }
        />
      </Col>
    </Row>
  );
};

export default DiscountHighlights;
