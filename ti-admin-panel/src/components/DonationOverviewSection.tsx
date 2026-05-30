import React from 'react';
import { Card, Col, Row, Typography, Empty } from 'antd';
import {
  DollarOutlined,
  HeartOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const BRAND_ORANGE = '#DB8633';
const BRAND_TEAL = '#324E58';

interface MonthlyRecurring {
  total: number;
  avg: number;
  activeSubCount: number;
}
interface DonationsLifetime {
  lifetimeTotal: number;
  recurring: { total: number; pct: number };
  oneTime: { total: number; pct: number };
}
interface TrendPoint {
  month: string;
  recurring: number;
  oneTime: number;
  total: number;
}
interface NameCount {
  beneficiaryId?: number;
  name: string;
  count: number;
}
interface CityTotal {
  city: string;
  total: number;
}
interface NameTotal {
  beneficiaryId?: number;
  name: string;
  total: number;
}
export interface DonationOverviewData {
  totalBeneficiaries: number;
  monthlyRecurring: MonthlyRecurring;
  donations: DonationsLifetime;
  donationTrends: TrendPoint[];
  mostSelectedBeneficiaries: NameCount[];
  donationsByLocation: CityTotal[];
  topBeneficiariesByDonations: NameTotal[];
}

interface Props {
  data: DonationOverviewData | null;
}

const money = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
};

// ---------- Reusable bits (mirroring DonorChartsSection patterns) ----------
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

// Two-series stacked-by-month line chart (Recurring + One-Time + Total).
// Same inline-SVG approach as the Donor Count chart, but with two stacked
// areas + a total line, so it reads as "what was donated each month".
const DonationTrendsChart: React.FC<{ series: TrendPoint[] }> = ({
  series,
}) => {
  const w = 600;
  const h = 240;
  const pad = { t: 16, r: 16, b: 32, l: 48 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  if (!series.length) return <Empty description="No donations yet" />;

  const totals = series.map((p) => p.total);
  const max =
    Math.max(1, ...totals) +
    Math.max(1, Math.round(Math.max(1, ...totals) * 0.15));

  const stepX = series.length > 1 ? innerW / (series.length - 1) : innerW;
  const xy = (i: number, v: number): [number, number] => [
    pad.l + i * stepX,
    pad.t + innerH - (v / max) * innerH,
  ];

  const linePath = (vals: number[]) =>
    vals
      .map((v, i) => {
        const [x, y] = xy(i, v);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) =>
    Math.round((max * i) / ticks),
  );

  const xLabels = series.map((p) => {
    const [y, m] = p.month.split('-');
    return new Date(Number(y), Number(m) - 1, 1).toLocaleString('en-US', {
      month: 'short',
    });
  });

  const seriesSpecs = [
    {
      key: 'recurring',
      label: 'Recurring',
      color: BRAND_ORANGE,
      vals: series.map((p) => p.recurring),
    },
    {
      key: 'oneTime',
      label: 'One-Time',
      color: BRAND_TEAL,
      vals: series.map((p) => p.oneTime),
    },
  ];

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {yTicks.map((tick, i) => {
          const y = pad.t + innerH - (tick / max) * innerH;
          return (
            <g key={`y-${i}`}>
              <line
                x1={pad.l}
                x2={w - pad.r}
                y1={y}
                y2={y}
                stroke="#f0f0f0"
                strokeWidth={1}
              />
              <text
                x={pad.l - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={10}
                fill="#8c8c8c"
              >
                {money(tick)}
              </text>
            </g>
          );
        })}
        {xLabels.map((label, i) => {
          if (series.length > 8 && i % 2 !== 0 && i !== series.length - 1)
            return null;
          const x = pad.l + i * stepX;
          return (
            <text
              key={`x-${i}`}
              x={x}
              y={h - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#8c8c8c"
            >
              {label}
            </text>
          );
        })}
        {seriesSpecs.map((s) => (
          <path
            key={s.key}
            d={linePath(s.vals)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {seriesSpecs.map((s) =>
          s.vals.map((v, i) => {
            const [x, y] = xy(i, v);
            return (
              <circle
                key={`${s.key}-${i}`}
                cx={x}
                cy={y}
                r={2.5}
                fill={s.color}
              />
            );
          }),
        )}
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        {seriesSpecs.map((s) => (
          <div
            key={s.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
            }}
          >
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: s.color,
              }}
            />
            <Text style={{ fontSize: 12 }}>{s.label}</Text>
          </div>
        ))}
      </div>
    </div>
  );
};

// Horizontal bar chart (reused pattern).
const HBarChart: React.FC<{
  data: { label: string; value: number; rawValue?: string }[];
  color: string;
}> = ({ data, color }) => {
  if (!data.length) return <Empty description="Not enough data yet" />;
  const max = Math.max(...data.map((d) => Math.abs(d.value)), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((d, i) => {
        const widthPct = Math.max(2, (Math.abs(d.value) / max) * 100);
        return (
          <div key={`${d.label}-${i}`}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              <Text>{d.label}</Text>
              <Text strong style={{ color }}>
                {d.rawValue ?? d.value.toLocaleString()}
              </Text>
            </div>
            <div
              style={{
                height: 8,
                background: '#f5f5f5',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${widthPct}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 4,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ChartCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <Card style={{ height: '100%' }}>
    <div style={{ marginBottom: 16 }}>
      <Title level={5} style={{ margin: 0 }}>
        {title}
      </Title>
      {subtitle && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {subtitle}
        </Text>
      )}
    </div>
    {children}
  </Card>
);

const DonationOverviewSection: React.FC<Props> = ({ data }) => {
  const monthly = data?.monthlyRecurring;
  const totals = data?.donations;
  const trends = data?.donationTrends ?? [];
  const selected = data?.mostSelectedBeneficiaries ?? [];
  const byLocation = data?.donationsByLocation ?? [];
  const topBeneficiaries = data?.topBeneficiariesByDonations ?? [];
  const totalBeneficiaries = data?.totalBeneficiaries ?? 0;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Donation &amp; Beneficiary Overview
        </Title>
        <Text type="secondary">
          What's being given and where it's going
        </Text>
      </div>

      {/* KPI cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card style={{ position: 'relative', minHeight: 160 }}>
            <CardIcon icon={<CalendarOutlined />} tone={BRAND_ORANGE} />
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Monthly Donations
            </Text>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 36, fontWeight: 700 }}>
                {money(monthly?.total ?? 0)}
              </span>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                /month recurring
              </Text>
            </div>
            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'block', marginTop: 8 }}
            >
              {monthly?.activeSubCount ?? 0} active subscriptions · avg{' '}
              {money(monthly?.avg ?? 0)} / donor
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ position: 'relative', minHeight: 160 }}>
            <CardIcon icon={<DollarOutlined />} tone={BRAND_ORANGE} />
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Total Donations
            </Text>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 36, fontWeight: 700 }}>
                {money(totals?.lifetimeTotal ?? 0)}
              </span>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                lifetime
              </Text>
            </div>
            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'block', marginTop: 8 }}
            >
              Recurring: {money(totals?.recurring?.total ?? 0)} (
              {totals?.recurring?.pct ?? 0}%) · One-time:{' '}
              {money(totals?.oneTime?.total ?? 0)} (
              {totals?.oneTime?.pct ?? 0}%)
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ position: 'relative', minHeight: 160 }}>
            <CardIcon icon={<HeartOutlined />} tone={BRAND_TEAL} />
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Total Beneficiaries
            </Text>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 36, fontWeight: 700 }}>
                {totalBeneficiaries.toLocaleString()}
              </span>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                active charities
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Donation Trends"
            subtitle="Month-over-month recurring + one-time donations"
          >
            <DonationTrendsChart series={trends} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Most Selected Beneficiary"
            subtitle="Donors' primary beneficiary preference"
          >
            <HBarChart
              data={selected.map((s) => ({ label: s.name, value: s.count }))}
              color={BRAND_ORANGE}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Donations by Location"
            subtitle="Total $ donated, top cities"
          >
            <HBarChart
              data={byLocation.map((l) => ({
                label: l.city,
                value: l.total,
                rawValue: money(l.total),
              }))}
              color={BRAND_ORANGE}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Most Total Donations by Beneficiary"
            subtitle="Lifetime $ received per charity"
          >
            <HBarChart
              data={topBeneficiaries.map((b) => ({
                label: b.name,
                value: b.total,
                rawValue: money(b.total),
              }))}
              color={BRAND_TEAL}
            />
          </ChartCard>
        </Col>
      </Row>
    </div>
  );
};

export default DonationOverviewSection;
