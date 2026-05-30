import React, { useState } from 'react';
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

interface PeriodCounts {
  new: { count: number; growthRate?: number | null };
  lost: { count: number; lossRate?: number | null };
  net: { count: number; growthRate?: number | null };
}
interface PrevCounts {
  new: { count: number };
  lost: { count: number };
  net: { count: number };
}
interface WeekPoint {
  weekStart: string;
  new: number;
  lost: number;
  net: number;
}
interface DonorOverview {
  totalActive: number;
  totalInactive: number;
  current?: { weekly: PeriodCounts; monthly: PeriodCounts; quarterly: PeriodCounts };
  previous?: { weekly: PrevCounts; monthly: PrevCounts; quarterly: PrevCounts };
  weeklySeries?: WeekPoint[];
  // Legacy top-level (kept for graceful fallback)
  weekly?: PeriodCounts;
  monthly?: PeriodCounts;
  quarterly?: PeriodCounts;
}

interface Props {
  overview: DonorOverview | null;
}

type PeriodKey = 'weekly' | 'monthly' | 'quarterly';
const PERIOD_LABELS: Record<PeriodKey, { chip: string; vsPrev: string }> = {
  weekly: { chip: 'Week', vsPrev: 'vs last week' },
  monthly: { chip: 'Month', vsPrev: 'vs last month' },
  quarterly: { chip: 'Quarter', vsPrev: 'vs last quarter' },
};

// Cumulative active-donor count at the end of each week, derived from the
// weekly series. Anchored so the most recent week ends at the current
// totalActive — earlier weeks are reconstructed by undoing each week's net.
const buildTotalActiveSeries = (
  series: WeekPoint[],
  currentActive: number,
): number[] => {
  if (!series.length) return [];
  const values: number[] = new Array(series.length).fill(0);
  values[series.length - 1] = currentActive;
  for (let i = series.length - 2; i >= 0; i--) {
    values[i] = values[i + 1] - series[i + 1].net;
  }
  return values;
};

// Tiny inline SVG sparkline — no chart library needed for 12 datapoints.
const Sparkline: React.FC<{
  values: number[];
  color: string;
  height?: number;
}> = ({ values, color, height = 28 }) => {
  if (!values.length) return null;
  const width = 100; // viewBox units; scales via CSS
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block' }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// Pill rendering the delta vs previous period. Color sentiment depends on
// whether "more = better" (new, net) or "more = worse" (lost).
const DeltaPill: React.FC<{
  current: number;
  previous: number;
  moreIsBetter: boolean;
}> = ({ current, previous, moreIsBetter }) => {
  const diff = current - previous;
  if (diff === 0 && previous === 0 && current === 0) {
    return (
      <span style={{ color: '#8c8c8c', fontSize: 12 }}>— no change</span>
    );
  }
  if (diff === 0) {
    return (
      <span style={{ color: '#8c8c8c', fontSize: 12 }}>— no change</span>
    );
  }
  const up = diff > 0;
  const good = moreIsBetter ? up : !up;
  const color = good ? '#52c41a' : '#ff4d4f';
  const arrow = up ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  const percent =
    previous === 0
      ? `${up ? '+' : ''}${diff}`
      : `${up ? '+' : ''}${Math.round((diff / Math.abs(previous)) * 1000) / 10}%`;
  return (
    <span style={{ color, fontSize: 12, fontWeight: 500 }}>
      {arrow} {percent}{' '}
      <Text type="secondary" style={{ fontSize: 12 }}>
        {/* show "vs prev" label is handled outside */}
      </Text>
    </span>
  );
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

// Period chip selector ("Week | Month | Quarter").
const PeriodTabs: React.FC<{
  value: PeriodKey;
  onChange: (k: PeriodKey) => void;
}> = ({ value, onChange }) => {
  const keys: PeriodKey[] = ['weekly', 'monthly', 'quarterly'];
  return (
    <div
      style={{
        display: 'inline-flex',
        background: '#f5f5f5',
        borderRadius: 8,
        padding: 3,
        gap: 2,
      }}
    >
      {keys.map((k) => {
        const active = k === value;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            style={{
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              background: active ? '#fff' : 'transparent',
              color: active ? '#262626' : '#595959',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {PERIOD_LABELS[k].chip}
          </button>
        );
      })}
    </div>
  );
};

const TrioCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  iconTone: string;
  currentCount: number;
  prevCount: number;
  vsPrevLabel: string;
  sparklineValues: number[];
  sparklineColor: string;
  moreIsBetter: boolean;
  /** Format the hero number — e.g. add a "+" prefix or invert sign for losses. */
  formatHero: (n: number) => string;
}> = ({
  title,
  icon,
  iconTone,
  currentCount,
  prevCount,
  vsPrevLabel,
  sparklineValues,
  sparklineColor,
  moreIsBetter,
  formatHero,
}) => (
  <Card style={{ position: 'relative', minHeight: 200 }}>
    <CardIcon icon={icon} tone={iconTone} />
    <Text
      type="secondary"
      style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}
    >
      {title}
    </Text>
    <div style={{ marginTop: 12, marginBottom: 4 }}>
      <span style={{ fontSize: 36, fontWeight: 700 }}>
        {formatHero(currentCount)}
      </span>
    </div>
    <div style={{ marginBottom: 16 }}>
      <DeltaPill
        current={currentCount}
        previous={prevCount}
        moreIsBetter={moreIsBetter}
      />{' '}
      <Text type="secondary" style={{ fontSize: 12 }}>
        {vsPrevLabel}
      </Text>
    </div>
    <Sparkline values={sparklineValues} color={sparklineColor} />
  </Card>
);

const DonorOverviewSection: React.FC<Props> = ({ overview }) => {
  const [period, setPeriod] = useState<PeriodKey>('monthly');

  const totalActive = overview?.totalActive ?? 0;
  const totalInactive = overview?.totalInactive ?? 0;

  // Pick current + previous blocks based on selected period. Fall back to
  // legacy top-level fields if the deployment hasn't shipped the new shape yet.
  const currentBlock =
    overview?.current?.[period] ?? overview?.[period] ?? null;
  const prevBlock = overview?.previous?.[period] ?? null;

  const series = overview?.weeklySeries ?? [];
  const totalActiveSeries = buildTotalActiveSeries(series, totalActive);
  const newSeries = series.map((p) => p.new);
  const lostSeries = series.map((p) => p.lost);
  const netSeries = series.map((p) => p.net);

  const sign = (n: number) =>
    n === 0 ? '0' : n > 0 ? `+${n}` : `${n}`;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Donor Overview
        </Title>
        <Text type="secondary">Acquisition, retention and growth</Text>
      </div>

      {/* Hero — Total Donors spans full width */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card style={{ position: 'relative', minHeight: 140 }}>
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
            <Row gutter={24} align="middle" style={{ marginTop: 12 }}>
              <Col xs={24} md={10}>
                <span style={{ fontSize: 44, fontWeight: 700 }}>
                  {totalActive.toLocaleString()}
                </span>
                <Text type="secondary" style={{ marginLeft: 12 }}>
                  active · {totalInactive.toLocaleString()} inactive
                </Text>
              </Col>
              <Col xs={24} md={14}>
                <Sparkline
                  values={totalActiveSeries}
                  color="#DB8633"
                  height={48}
                />
                <Text
                  type="secondary"
                  style={{ fontSize: 11, display: 'block', marginTop: 4 }}
                >
                  last 12 weeks
                </Text>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Period selector controls the trio below */}
      <div style={{ marginBottom: 12 }}>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      {/* Trio — New / Lost / Net */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <TrioCard
            title="New Donors"
            icon={<UserAddOutlined />}
            iconTone="#52c41a"
            currentCount={currentBlock?.new?.count ?? 0}
            prevCount={prevBlock?.new?.count ?? 0}
            vsPrevLabel={PERIOD_LABELS[period].vsPrev}
            sparklineValues={newSeries}
            sparklineColor="#52c41a"
            moreIsBetter={true}
            formatHero={sign}
          />
        </Col>
        <Col xs={24} md={8}>
          <TrioCard
            title="Lost Donors"
            icon={<UserDeleteOutlined />}
            iconTone="#ff4d4f"
            currentCount={currentBlock?.lost?.count ?? 0}
            prevCount={prevBlock?.lost?.count ?? 0}
            vsPrevLabel={PERIOD_LABELS[period].vsPrev}
            sparklineValues={lostSeries}
            sparklineColor="#ff4d4f"
            moreIsBetter={false}
            formatHero={(n) => (n === 0 ? '0' : `-${n}`)}
          />
        </Col>
        <Col xs={24} md={8}>
          <TrioCard
            title="Net Donor Change"
            icon={<RiseOutlined />}
            iconTone="#1890ff"
            currentCount={currentBlock?.net?.count ?? 0}
            prevCount={prevBlock?.net?.count ?? 0}
            vsPrevLabel={PERIOD_LABELS[period].vsPrev}
            sparklineValues={netSeries}
            sparklineColor="#1890ff"
            moreIsBetter={true}
            formatHero={sign}
          />
        </Col>
      </Row>
    </div>
  );
};

export default DonorOverviewSection;
