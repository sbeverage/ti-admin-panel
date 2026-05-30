import React from 'react';
import { Card, Col, Row, Typography, Empty } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import DashboardSection from './DashboardSection';

const { Title, Text } = Typography;

const BRAND_ORANGE = '#DB8633';
const BRAND_TEAL = '#324E58';

interface DonorCountPoint {
  month: string; // YYYY-MM
  new: number;
  lost: number;
  net: number;
}
interface SourceBucket {
  label: string;
  count: number;
}
interface LocationCount {
  city: string;
  count: number;
}
interface LocationGrowth {
  city: string;
  recent?: number;
  prior?: number;
  growthRate: number;
}
export interface DonorChartsData {
  donorCountSeries: DonorCountPoint[];
  donorSources: SourceBucket[];
  donorsByLocation: LocationCount[];
  growthByLocation: LocationGrowth[];
}

interface Props {
  data: DonorChartsData | null;
}

// ---------------- GROUPED BAR CHART ----------------
// Two bars per month (New / Lost), side by side. Net shown as a small label
// above each month group. This avoids the overlap problem the 3-line version
// had when two series have identical values (e.g. Net == New when no losses).
const DonorCountBarChart: React.FC<{ series: DonorCountPoint[] }> = ({
  series,
}) => {
  const w = 600;
  const h = 240;
  const pad = { t: 32, r: 16, b: 32, l: 32 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  if (!series.length) {
    return <Empty description="No donor activity yet" />;
  }

  const allVals = series.flatMap((p) => [p.new, p.lost]);
  const rawMax = Math.max(...allVals, 1);
  const max = rawMax + Math.max(1, Math.round(rawMax * 0.15));
  const groupCount = series.length;
  const groupWidth = innerW / groupCount;
  const barGap = 2;
  const barWidth = Math.max(4, (groupWidth - barGap) / 2 - 2);

  const yForVal = (v: number) => pad.t + innerH - (v / max) * innerH;

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((max * i) / yTicks),
  );

  const xLabels = series.map((p) => {
    const [y, m] = p.month.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleString('en-US', { month: 'short' });
  });

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {/* Y gridlines + labels */}
        {ticks.map((tick, i) => {
          const y = yForVal(tick);
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
                {tick}
              </text>
            </g>
          );
        })}

        {/* Bars + Net labels */}
        {series.map((p, i) => {
          const groupX = pad.l + i * groupWidth;
          const newX = groupX + groupWidth / 2 - barWidth - barGap / 2;
          const lostX = groupX + groupWidth / 2 + barGap / 2;
          const newY = yForVal(p.new);
          const lostY = yForVal(p.lost);
          const newHeight = pad.t + innerH - newY;
          const lostHeight = pad.t + innerH - lostY;
          const netLabel =
            p.net === 0 ? '' : p.net > 0 ? `+${p.net}` : `${p.net}`;
          const netColor =
            p.net > 0 ? BRAND_ORANGE : p.net < 0 ? BRAND_TEAL : '#bfbfbf';
          return (
            <g key={`g-${i}`}>
              {/* New bar */}
              {p.new > 0 && (
                <rect
                  x={newX}
                  y={newY}
                  width={barWidth}
                  height={newHeight}
                  rx={2}
                  fill={BRAND_ORANGE}
                />
              )}
              {/* Lost bar */}
              {p.lost > 0 && (
                <rect
                  x={lostX}
                  y={lostY}
                  width={barWidth}
                  height={lostHeight}
                  rx={2}
                  fill={BRAND_TEAL}
                />
              )}
              {/* Net label above the bars */}
              {netLabel && (
                <text
                  x={groupX + groupWidth / 2}
                  y={pad.t - 12}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill={netColor}
                >
                  {netLabel}
                </text>
              )}
            </g>
          );
        })}

        {/* X labels */}
        {xLabels.map((label, i) => {
          const groupX = pad.l + i * groupWidth + groupWidth / 2;
          return (
            <text
              key={`x-${i}`}
              x={groupX}
              y={h - 8}
              textAnchor="middle"
              fontSize={10}
              fill="#8c8c8c"
            >
              {label}
            </text>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span
            style={{ width: 10, height: 10, borderRadius: 2, background: BRAND_ORANGE }}
          />
          <Text style={{ fontSize: 12 }}>New</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span
            style={{ width: 10, height: 10, borderRadius: 2, background: BRAND_TEAL }}
          />
          <Text style={{ fontSize: 12 }}>Lost</Text>
        </div>
        <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
          Net change shown above each month
        </Text>
      </div>
    </div>
  );
};

// ---------------- HORIZONTAL BAR CHART ----------------
const HBarChart: React.FC<{
  data: { label: string; value: number; rawValue?: string }[];
  color: string;
  /** When true, the value rendered next to each bar shows a "%" suffix. */
  asPercent?: boolean;
  /** Optional override max — defaults to max(data) for proportional scaling. */
  maxOverride?: number;
}> = ({ data, color, asPercent, maxOverride }) => {
  if (!data.length) {
    return <Empty description="Not enough data yet" />;
  }
  const max = Math.max(maxOverride ?? 0, ...data.map((d) => Math.abs(d.value)), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((d, i) => {
        const widthPct = Math.max(2, (Math.abs(d.value) / max) * 100);
        const display =
          d.rawValue ??
          (asPercent
            ? `${d.value > 0 ? '+' : ''}${d.value}%`
            : d.value.toLocaleString());
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
                {display}
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

// ---------------- SECTION ----------------
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

const DonorChartsSection: React.FC<Props> = ({ data }) => {
  const countSeries = data?.donorCountSeries ?? [];
  const sources = data?.donorSources ?? [];
  const byLocation = data?.donorsByLocation ?? [];
  const growthByLocation = data?.growthByLocation ?? [];

  return (
    <DashboardSection
      title="Donor Trends &amp; Reach"
      subtitle="Where donors come from and how the base is growing across cities"
      icon={<BarChartOutlined />}
    >
      <Row gutter={[16, 16]}>
        {/* Donor Count line chart */}
        <Col xs={24} lg={12}>
          <ChartCard
            title="Donor Count"
            subtitle="Month-over-month new, lost, and net donors"
          >
            <DonorCountBarChart series={countSeries} />
          </ChartCard>
        </Col>

        {/* Donor Sources bar chart */}
        <Col xs={24} lg={12}>
          <ChartCard
            title="Donor Sources"
            subtitle="Where donors come from · Finer attribution (social) coming soon"
          >
            <HBarChart
              data={sources.map((s) => ({ label: s.label, value: s.count }))}
              color={BRAND_ORANGE}
            />
          </ChartCard>
        </Col>

        {/* Donor Count by Location */}
        <Col xs={24} lg={12}>
          <ChartCard
            title="Donor Count by Location"
            subtitle="Top cities by total donors"
          >
            <HBarChart
              data={byLocation.map((l) => ({
                label: l.city,
                value: l.count,
              }))}
              color={BRAND_ORANGE}
            />
          </ChartCard>
        </Col>

        {/* Donor Growth by Location */}
        <Col xs={24} lg={12}>
          <ChartCard
            title="Donor Growth by Location"
            subtitle="% change in signups · last 90 days vs prior 90"
          >
            <HBarChart
              data={growthByLocation.map((l) => ({
                label: l.city,
                value: l.growthRate,
              }))}
              color={BRAND_TEAL}
              asPercent
            />
          </ChartCard>
        </Col>
      </Row>
    </DashboardSection>
  );
};

export default DonorChartsSection;
