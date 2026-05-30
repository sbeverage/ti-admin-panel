import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import {
  BankOutlined,
  TrophyOutlined,
  HeartOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const BRAND_ORANGE = '#DB8633';
const BRAND_TEAL = '#324E58';
const DANGER_RED = '#ff4d4f';

interface ActiveStats {
  count: number;
  receivingCount: number;
}
interface TopByDonations {
  beneficiaryId: number;
  name: string;
  lifetimeTotal: number;
}
interface MostSelected {
  beneficiaryId: number;
  name: string;
  count: number;
}
export interface BeneficiaryHighlightsData {
  active: ActiveStats;
  awaitingBankInfo: number;
  topByDonations: TopByDonations | null;
  mostSelected: MostSelected | null;
}

interface Props {
  data: BeneficiaryHighlightsData | null;
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

const BeneficiaryHighlights: React.FC<Props> = ({ data }) => {
  const active = data?.active ?? { count: 0, receivingCount: 0 };
  const awaitingBankInfo = data?.awaitingBankInfo ?? 0;
  const top = data?.topByDonations ?? null;
  const mostSelected = data?.mostSelected ?? null;
  const dormantCount = Math.max(0, active.count - active.receivingCount);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Active Beneficiaries"
          hero={active.count.toLocaleString()}
          heroSuffix={active.count === 1 ? 'charity' : 'charities'}
          icon={<TeamOutlined />}
          tone={BRAND_TEAL}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {active.receivingCount.toLocaleString()} receiving donations
              {dormantCount > 0 &&
                ` · ${dormantCount.toLocaleString()} dormant`}
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Awaiting Bank Info"
          hero={awaitingBankInfo.toLocaleString()}
          heroSuffix={awaitingBankInfo === 1 ? 'charity' : 'charities'}
          heroColor={awaitingBankInfo > 0 ? DANGER_RED : undefined}
          icon={<BankOutlined />}
          tone={awaitingBankInfo > 0 ? DANGER_RED : BRAND_TEAL}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {awaitingBankInfo > 0
                ? "Can't receive payouts yet — chase for bank account info"
                : 'All active beneficiaries can be paid out'}
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Top by Donations"
          hero={top ? money(top.lifetimeTotal) : '—'}
          heroSuffix={top ? 'lifetime' : undefined}
          icon={<TrophyOutlined />}
          tone={BRAND_ORANGE}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {top ? top.name : 'No donations yet'}
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Most Selected"
          hero={
            mostSelected
              ? mostSelected.count.toLocaleString()
              : '—'
          }
          heroSuffix={
            mostSelected
              ? mostSelected.count === 1
                ? 'donor'
                : 'donors'
              : undefined
          }
          icon={<HeartOutlined />}
          tone={BRAND_ORANGE}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {mostSelected
                ? `${mostSelected.name} · picked as primary`
                : 'No donor selections yet'}
            </Text>
          }
        />
      </Col>
    </Row>
  );
};

export default BeneficiaryHighlights;
