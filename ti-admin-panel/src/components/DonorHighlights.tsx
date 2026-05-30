import React from 'react';
import { Card, Col, Row, Typography, Tooltip } from 'antd';
import {
  ExclamationCircleOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  UserAddOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const BRAND_ORANGE = '#DB8633';
const BRAND_TEAL = '#324E58';
const DANGER_RED = '#ff4d4f';
const SUCCESS_GREEN = '#52c41a';

interface AtRisk {
  count: number;
  monthlyAtRisk: number;
}
interface TopDonor {
  donorId: number;
  name: string;
  lifetimeTotal: number;
}
interface NewThisMonth {
  count: number;
  growthRate: number;
}
export interface DonorHighlightsData {
  atRisk: AtRisk;
  topDonor: TopDonor | null;
  avgLifetimeValue: number;
  donorWithGivingCount: number;
  retentionRate: number | null;
  lastMonthActiveCount: number;
  newThisMonth: NewThisMonth;
}

interface Props {
  data: DonorHighlightsData | null;
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

const DonorHighlights: React.FC<Props> = ({ data }) => {
  const atRisk = data?.atRisk ?? { count: 0, monthlyAtRisk: 0 };
  const topDonor = data?.topDonor ?? null;
  const avgLtv = data?.avgLifetimeValue ?? 0;
  const ltvBaseCount = data?.donorWithGivingCount ?? 0;
  const retention = data?.retentionRate;
  const lastMonthBase = data?.lastMonthActiveCount ?? 0;
  const newMonth = data?.newThisMonth ?? { count: 0, growthRate: 0 };

  const growthArrow =
    newMonth.growthRate > 0 ? (
      <ArrowUpOutlined />
    ) : newMonth.growthRate < 0 ? (
      <ArrowDownOutlined />
    ) : null;
  const growthColor =
    newMonth.growthRate > 0
      ? SUCCESS_GREEN
      : newMonth.growthRate < 0
      ? DANGER_RED
      : '#8c8c8c';

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 12 }}>
        <Title level={4} style={{ margin: 0 }}>
          Donor Highlights
        </Title>
        <Text type="secondary">
          Quick health check on the donor base
        </Text>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <HighlightCard
            label="At-Risk Donors"
            hero={atRisk.count.toLocaleString()}
            heroSuffix={atRisk.count === 1 ? 'donor' : 'donors'}
            heroColor={atRisk.count > 0 ? DANGER_RED : undefined}
            icon={<ExclamationCircleOutlined />}
            tone={atRisk.count > 0 ? DANGER_RED : BRAND_TEAL}
            detail={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {money(atRisk.monthlyAtRisk)}/mo at risk · past_due or unpaid
              </Text>
            }
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <HighlightCard
            label="Top Donor"
            hero={topDonor ? money(topDonor.lifetimeTotal) : '—'}
            heroSuffix={topDonor ? 'lifetime' : undefined}
            icon={<TrophyOutlined />}
            tone={BRAND_ORANGE}
            detail={
              <Tooltip
                title={
                  topDonor
                    ? `Avg lifetime value across ${ltvBaseCount.toLocaleString()} giving donor${ltvBaseCount === 1 ? '' : 's'}: ${money(avgLtv)}`
                    : undefined
                }
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {topDonor ? topDonor.name : 'No donations yet'}
                  {topDonor && ` · avg ${money(avgLtv)} LTV`}
                </Text>
              </Tooltip>
            }
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <HighlightCard
            label="Retention Rate"
            hero={retention == null ? '—' : `${retention}%`}
            heroSuffix={retention != null ? 'kept' : undefined}
            heroColor={
              retention == null
                ? undefined
                : retention >= 80
                ? SUCCESS_GREEN
                : retention >= 50
                ? BRAND_ORANGE
                : DANGER_RED
            }
            icon={<CheckCircleOutlined />}
            tone={BRAND_TEAL}
            detail={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {retention == null
                  ? 'No prior-month base yet'
                  : `${lastMonthBase.toLocaleString()} donor${lastMonthBase === 1 ? '' : 's'} paying last month`}
              </Text>
            }
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <HighlightCard
            label="New This Month"
            hero={
              newMonth.count > 0 ? `+${newMonth.count}` : `${newMonth.count}`
            }
            heroSuffix={newMonth.count === 1 ? 'donor' : 'donors'}
            icon={<UserAddOutlined />}
            tone={BRAND_ORANGE}
            detail={
              <span style={{ fontSize: 12, color: growthColor }}>
                {growthArrow} {Math.abs(newMonth.growthRate)}% vs last month
              </span>
            }
          />
        </Col>
      </Row>
    </div>
  );
};

export default DonorHighlights;
