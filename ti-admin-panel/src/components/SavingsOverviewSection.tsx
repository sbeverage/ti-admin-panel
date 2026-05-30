import React from 'react';
import { Card, Col, Row, Typography, Empty } from 'antd';
import {
  TagOutlined,
  ShoppingOutlined,
  PercentageOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const BRAND_ORANGE = '#DB8633';
const BRAND_TEAL = '#324E58';

interface MonthlySavings {
  count: number;
  total: number;
  avgPerDonor: number;
  uniqueDonors: number;
}
interface TotalSavings {
  count: number;
  total: number;
}
interface SavingsTrend {
  month: string;
  total: number;
  count: number;
}
interface VendorDollars {
  vendorId?: number;
  name: string;
  total: number;
}
interface VendorCount {
  vendorId?: number;
  name: string;
  count: number;
}
interface CityTotal {
  city: string;
  total: number;
}
export interface SavingsOverviewData {
  totalVendors: number;
  monthlySavings: MonthlySavings;
  totalSavings: TotalSavings;
  savingsTrends: SavingsTrend[];
  topVendorsByDollars: VendorDollars[];
  savingsByLocation: CityTotal[];
  topVendorsByCount: VendorCount[];
}

interface Props {
  data: SavingsOverviewData | null;
}

const money = (n: number): string => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
};

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

// Single-series line chart for savings trends ($ saved per month).
const SavingsTrendsChart: React.FC<{ series: SavingsTrend[] }> = ({
  series,
}) => {
  const w = 600;
  const h = 240;
  const pad = { t: 16, r: 16, b: 32, l: 48 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  if (!series.length) return <Empty description="No redemptions yet" />;

  const totals = series.map((p) => p.total);
  const max =
    Math.max(1, ...totals) +
    Math.max(1, Math.round(Math.max(1, ...totals) * 0.15));

  const stepX = series.length > 1 ? innerW / (series.length - 1) : innerW;
  const xy = (i: number, v: number): [number, number] => [
    pad.l + i * stepX,
    pad.t + innerH - (v / max) * innerH,
  ];
  const linePath = totals
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
        <path
          d={linePath}
          fill="none"
          stroke={BRAND_ORANGE}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {totals.map((v, i) => {
          const [x, y] = xy(i, v);
          return (
            <circle key={`d-${i}`} cx={x} cy={y} r={2.5} fill={BRAND_ORANGE} />
          );
        })}
      </svg>
    </div>
  );
};

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

const SavingsOverviewSection: React.FC<Props> = ({ data }) => {
  const monthly = data?.monthlySavings;
  const total = data?.totalSavings;
  const trends = data?.savingsTrends ?? [];
  const byDollars = data?.topVendorsByDollars ?? [];
  const byLocation = data?.savingsByLocation ?? [];
  const byCount = data?.topVendorsByCount ?? [];
  const totalVendors = data?.totalVendors ?? 0;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Savings &amp; Vendor Overview
        </Title>
        <Text type="secondary">
          What donors are saving and which vendors are getting used
        </Text>
      </div>

      {/* KPI cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={8}>
          <Card style={{ position: 'relative', minHeight: 160 }}>
            <CardIcon icon={<PercentageOutlined />} tone={BRAND_ORANGE} />
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Monthly Savings
            </Text>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 36, fontWeight: 700 }}>
                {money(monthly?.total ?? 0)}
              </span>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                last 30 days
              </Text>
            </div>
            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'block', marginTop: 8 }}
            >
              {monthly?.count ?? 0} redemptions · avg{' '}
              {money(monthly?.avgPerDonor ?? 0)} / donor
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ position: 'relative', minHeight: 160 }}>
            <CardIcon icon={<TagOutlined />} tone={BRAND_ORANGE} />
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Total Savings
            </Text>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 36, fontWeight: 700 }}>
                {money(total?.total ?? 0)}
              </span>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                lifetime
              </Text>
            </div>
            <Text
              type="secondary"
              style={{ fontSize: 12, display: 'block', marginTop: 8 }}
            >
              {(total?.count ?? 0).toLocaleString()} total redemptions
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ position: 'relative', minHeight: 160 }}>
            <CardIcon icon={<ShoppingOutlined />} tone={BRAND_TEAL} />
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              Total Vendors
            </Text>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 36, fontWeight: 700 }}>
                {totalVendors.toLocaleString()}
              </span>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                active partners
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Savings Trends"
            subtitle="Month-over-month total $ saved through vendor discounts"
          >
            <SavingsTrendsChart series={trends} />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Top Vendors by Savings"
            subtitle="Vendors driving the most $ saved for donors"
          >
            <HBarChart
              data={byDollars.map((v) => ({
                label: v.name,
                value: v.total,
                rawValue: money(v.total),
              }))}
              color={BRAND_ORANGE}
            />
          </ChartCard>
        </Col>
        <Col xs={24} lg={12}>
          <ChartCard
            title="Savings by Location"
            subtitle="Total $ saved by city"
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
            title="Most Redeemed Vendors"
            subtitle="Vendors with the most redemptions"
          >
            <HBarChart
              data={byCount.map((v) => ({
                label: v.name,
                value: v.count,
              }))}
              color={BRAND_TEAL}
            />
          </ChartCard>
        </Col>
      </Row>
    </div>
  );
};

export default SavingsOverviewSection;
