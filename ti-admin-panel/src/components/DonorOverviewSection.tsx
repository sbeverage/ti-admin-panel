import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface PeriodBlock {
  count: number;
  growthRate: number | null;
  lossRate?: number | null;
}

interface DonorOverview {
  totalActive: number;
  totalInactive: number;
  weekly: { new: PeriodBlock; lost: PeriodBlock; net: PeriodBlock };
  monthly: { new: PeriodBlock; lost: PeriodBlock; net: PeriodBlock };
  quarterly: { new: PeriodBlock; lost: PeriodBlock; net: PeriodBlock };
}

interface Props {
  overview: DonorOverview | null;
}

// One column inside the Weekly/Monthly/Quarterly breakdown row of each KPI card.
// `direction` controls the arrow + color shown next to the percentage.
const PeriodColumn: React.FC<{
  label: string;
  count: number;
  rate: number | null | undefined;
  direction: 'up' | 'down';
}> = ({ label, count, rate, direction }) => {
  const arrow = direction === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const color = '#52c41a'; // green throughout — matches reference design
  const displayCount =
    count === 0 ? '0' : (count > 0 ? `+${count}` : `${count}`);
  return (
    <div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Text>
      <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>
        {displayCount}
      </div>
      <div style={{ color, fontSize: 12, marginTop: 2 }}>
        {arrow}{' '}
        {rate == null ? '—' : `${rate}%`}
      </div>
    </div>
  );
};

// Render a circular icon "chip" in the top-right of a card. Color is tinted
// per card (donors, growth, churn, net) so the section reads at a glance.
const CardIcon: React.FC<{ icon: React.ReactNode; tone: string }> = ({
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

const KpiCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  iconTone: string;
  heroValue: string;
  heroLabel: string;
  weekly: { count: number; rate: number | null | undefined };
  monthly: { count: number; rate: number | null | undefined };
  quarterly: { count: number; rate: number | null | undefined };
  trendDirection: 'up' | 'down';
}> = ({
  title,
  icon,
  iconTone,
  heroValue,
  heroLabel,
  weekly,
  monthly,
  quarterly,
  trendDirection,
}) => (
  <Card style={{ position: 'relative', minHeight: 220 }}>
    <CardIcon icon={icon} tone={iconTone} />
    <Text
      type="secondary"
      style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}
    >
      {title}
    </Text>
    <div style={{ marginTop: 12, marginBottom: 16 }}>
      <span style={{ fontSize: 36, fontWeight: 700 }}>{heroValue}</span>
      <Text type="secondary" style={{ marginLeft: 8 }}>
        {heroLabel}
      </Text>
    </div>
    <div
      style={{
        borderTop: '1px solid #f0f0f0',
        paddingTop: 12,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8,
      }}
    >
      <PeriodColumn
        label="Weekly"
        count={weekly.count}
        rate={weekly.rate}
        direction={trendDirection}
      />
      <PeriodColumn
        label="Monthly"
        count={monthly.count}
        rate={monthly.rate}
        direction={trendDirection}
      />
      <PeriodColumn
        label="Quarterly"
        count={quarterly.count}
        rate={quarterly.rate}
        direction={trendDirection}
      />
    </div>
  </Card>
);

const DonorOverviewSection: React.FC<Props> = ({ overview }) => {
  const totalActive = overview?.totalActive ?? 0;
  const totalInactive = overview?.totalInactive ?? 0;

  // Hero values use the monthly window ("this month" in the screenshot).
  const newMonthly = overview?.monthly?.new?.count ?? 0;
  const lostMonthly = overview?.monthly?.lost?.count ?? 0;
  const netMonthly = overview?.monthly?.net?.count ?? 0;

  const sign = (n: number) =>
    n === 0 ? '0' : n > 0 ? `+${n}` : `${n}`;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          Welcome back 👋
        </Title>
        <Text type="secondary">
          Here's how generosity is moving across the THRIVE network.
        </Text>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Title level={4} style={{ margin: 0 }}>
          Donor Overview
        </Title>
        <Text type="secondary">Acquisition, retention and growth</Text>
      </div>

      <Row gutter={[16, 16]}>
        {/* Total Donors — snapshot card */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ position: 'relative', minHeight: 220 }}>
            <CardIcon icon={<TeamOutlined />} tone="#DB8633" />
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Total Donors
            </Text>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 36, fontWeight: 700 }}>
                {totalActive.toLocaleString()}
              </span>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                active · {totalInactive.toLocaleString()} inactive
              </Text>
            </div>
          </Card>
        </Col>

        {/* New Donors */}
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="New Donors"
            icon={<UserAddOutlined />}
            iconTone="#52c41a"
            heroValue={sign(newMonthly)}
            heroLabel="this month"
            trendDirection="up"
            weekly={{
              count: overview?.weekly?.new?.count ?? 0,
              rate: overview?.weekly?.new?.growthRate,
            }}
            monthly={{
              count: overview?.monthly?.new?.count ?? 0,
              rate: overview?.monthly?.new?.growthRate,
            }}
            quarterly={{
              count: overview?.quarterly?.new?.count ?? 0,
              rate: overview?.quarterly?.new?.growthRate,
            }}
          />
        </Col>

        {/* Lost Donors */}
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Lost Donors"
            icon={<UserDeleteOutlined />}
            iconTone="#DB8633"
            heroValue={`-${lostMonthly}`}
            heroLabel="this month"
            trendDirection="down"
            weekly={{
              count: -(overview?.weekly?.lost?.count ?? 0),
              rate: overview?.weekly?.lost?.lossRate,
            }}
            monthly={{
              count: -(overview?.monthly?.lost?.count ?? 0),
              rate: overview?.monthly?.lost?.lossRate,
            }}
            quarterly={{
              count: -(overview?.quarterly?.lost?.count ?? 0),
              rate: overview?.quarterly?.lost?.lossRate,
            }}
          />
        </Col>

        {/* Net Donor Change */}
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Net Donor Change"
            icon={<RiseOutlined />}
            iconTone="#1890ff"
            heroValue={sign(netMonthly)}
            heroLabel="this month"
            trendDirection={netMonthly >= 0 ? 'up' : 'down'}
            weekly={{
              count: overview?.weekly?.net?.count ?? 0,
              rate: overview?.weekly?.net?.growthRate,
            }}
            monthly={{
              count: overview?.monthly?.net?.count ?? 0,
              rate: overview?.monthly?.net?.growthRate,
            }}
            quarterly={{
              count: overview?.quarterly?.net?.count ?? 0,
              rate: overview?.quarterly?.net?.growthRate,
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default DonorOverviewSection;
