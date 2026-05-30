import React from 'react';
import { Card, Col, Row, Typography, Empty } from 'antd';

const { Title, Text } = Typography;

const BRAND_ORANGE = '#DB8633';
const BRAND_TEAL = '#324E58';
const BRAND_ORANGE_LIGHT = '#F2B97A';

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

// ---------------- LINE CHART (multi-series) ----------------
// Inline SVG line chart with axis labels + legend. Three series: new, lost, net.
const DonorCountLineChart: React.FC<{ series: DonorCountPoint[] }> = ({
  series,
}) => {
  const w = 600;
  const h = 240;
  const pad = { t: 16, r: 16, b: 32, l: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  if (!series.length) {
    return <Empty description="No donor activity yet" />;
  }

  const allVals = series.flatMap((p) => [p.new, p.lost, p.net]);
  const rawMax = Math.max(...allVals, 1);
  const rawMin = Math.min(...allVals, 0);
  const max = rawMax + Math.max(1, Math.round(rawMax * 0.1));
  const min = rawMin < 0 ? rawMin - Math.max(1, Math.abs(Math.round(rawMin * 0.1))) : 0;
  const range = max - min || 1;
  const stepX = series.length > 1 ? innerW / (series.length - 1) : innerW;
  const xy = (i: number, v: number): [number, number] => [
    pad.l + i * stepX,
    pad.t + innerH - ((v - min) / range) * innerH,
  ];
  const path = (values: number[]) =>
    values
      .map((v, i) => {
        const [x, y] = xy(i, v);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

  const ySteps = 4;
  const yTicks = Array.from({ length: ySteps + 1 }, (_, i) => {
    const v = min + (range * i) / ySteps;
    return Math.round(v);
  });
  const xLabels = series.map((p) => {
    // Show "Apr", "May", etc.
    const [y, m] = p.month.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleString('en-US', { month: 'short' });
  });

  const series_specs = [
    { key: 'new', label: 'New', color: BRAND_ORANGE, vals: series.map((p) => p.new) },
    { key: 'lost', label: 'Lost', color: BRAND_TEAL, vals: series.map((p) => p.lost) },
    { key: 'net', label: 'Net', color: BRAND_ORANGE_LIGHT, vals: series.map((p) => p.net) },
  ];

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {/* Y gridlines + labels */}
        {yTicks.map((tick, i) => {
          const y = pad.t + innerH - ((tick - min) / range) * innerH;
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
        {/* X labels — every other month if cramped */}
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
        {/* Lines */}
        {series_specs.map((s) => (
          <path
            key={s.key}
            d={path(s.vals)}
            fill="none"
            stroke={s.color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {/* Dots */}
        {series_specs.map((s) =>
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
        {series_specs.map((s) => (
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
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {/* Donor Count line chart */}
        <Col xs={24} lg={12}>
          <ChartCard
            title="Donor Count"
            subtitle="Month-over-month new, lost, and net donors"
          >
            <DonorCountLineChart series={countSeries} />
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
    </div>
  );
};

export default DonorChartsSection;
