import React, { useState } from 'react';
import { Card, Col, Modal, Row, Spin, Table, Tag, Typography, Empty } from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  RiseOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import DashboardSection from './DashboardSection';
import { dashboardAPI } from '../services/api';

const { Title, Text } = Typography;

/**
 * One place that decides how a membership is worded and coloured, so the
 * quick-preview on the card and the tag in the New Donors table can never
 * drift apart. "General" rather than "standard": standard is the database's
 * word, general is the one Stephanie uses for donors who pay THRIVE directly.
 */
const MembershipTag: React.FC<{ value?: string }> = ({ value }) => {
  const v = String(value || '').toLowerCase();
  // Same three labels and colours the Donors table uses, so a donor never
  // looks like one thing on one screen and another elsewhere.
  if (v === 'team') return <Tag color="orange">Team</Tag>;
  if (v === 'coworking') return <Tag color="blue">Coworking</Tag>;
  return <Tag color="default">General</Tag>;
};

interface PeriodCounts {
  new: { count: number; growthRate?: number | null };
  lost: { count: number; lossRate?: number | null };
  net: { count: number; growthRate?: number | null };
  platformFee?: { count: number; total: number };
}
interface PrevCounts {
  new: { count: number };
  lost: { count: number };
  net: { count: number };
  platformFee?: { count: number; total: number };
}
interface WeekPoint {
  weekStart: string;
  new: number;
  lost: number;
  net: number;
}
/** Where each half of the donor base pays its $3 platform fee. */
interface MembershipSplit {
  coworking: number;
  general: number;
  generalActive: number;
}

interface CohortMeta {
  count?: number;
  countExcludingTeam?: number;
  teamCount?: number;
}

interface DonorOverview {
  totalActive: number;
  totalInactive: number;
  membership?: MembershipSplit;
  /** Monthly run-rate, not windowed — coworking spaces bill on their own cycle. */
  platformFeeCoworking?: { count: number; monthlyTotal: number };
  current?: {
    weekly: PeriodCounts;
    monthly: PeriodCounts;
    quarterly: PeriodCounts;
    yearly?: PeriodCounts;
  };
  previous?: {
    weekly: PrevCounts;
    monthly: PrevCounts;
    quarterly: PrevCounts;
    yearly?: PrevCounts;
  };
  weeklySeries?: WeekPoint[];
  // Legacy top-level (kept for graceful fallback)
  weekly?: PeriodCounts;
  monthly?: PeriodCounts;
  quarterly?: PeriodCounts;
  yearly?: PeriodCounts;
}

interface Props {
  overview: DonorOverview | null;
}

type PeriodKey = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
const PERIOD_LABELS: Record<PeriodKey, { chip: string; vsPrev: string }> = {
  weekly: { chip: 'Week', vsPrev: 'vs last week' },
  monthly: { chip: 'Month', vsPrev: 'vs last month' },
  quarterly: { chip: 'Quarter', vsPrev: 'vs last quarter' },
  yearly: { chip: 'Year', vsPrev: 'vs last year' },
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
  const keys: PeriodKey[] = ['weekly', 'monthly', 'quarterly', 'yearly'];
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
  /** Supplied only for cards that can drill into a list of the donors. */
  onClick?: () => void;
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
  onClick,
}) => (
  <Card
    // Only the cards that drill through advertise themselves as clickable.
    // Making every card look interactive would promise detail that three of
    // them do not have.
    hoverable={!!onClick}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={
      onClick
        ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }
        : undefined
    }
    style={{
      position: 'relative',
      minHeight: 200,
      cursor: onClick ? 'pointer' : undefined,
    }}
  >
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

  // Drill-through for the New / Lost cards. Fetched on open rather than with
  // the section: most visits never open it, and the query walks every donor's
  // whole donation history to find their first gift.
  const [cohort, setCohort] = useState<null | 'new' | 'lost'>(null);
  const [cohortRows, setCohortRows] = useState<any[]>([]);
  const [cohortLoading, setCohortLoading] = useState(false);
  const [cohortTeamCount, setCohortTeamCount] = useState(0);

  const openCohort = async (type: 'new' | 'lost') => {
    setCohort(type);
    setCohortLoading(true);
    setCohortRows([]);
    try {
      const res = await dashboardAPI.getDonorCohort(type, period);
      setCohortRows(res?.success ? res.data?.donors || [] : []);
      setCohortTeamCount(res?.success ? res.data?.teamCount || 0 : 0);
    } catch {
      setCohortRows([]);
    } finally {
      setCohortLoading(false);
    }
  };

  const totalActive = overview?.totalActive ?? 0;
  const totalInactive = overview?.totalInactive ?? 0;
  const membership = overview?.membership ?? null;
  const coworkingFee = overview?.platformFeeCoworking ?? null;

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
    <DashboardSection
      title="Donor Overview & Revenue"
      subtitle="Acquisition, retention, growth, and platform fee revenue"
      icon={<TeamOutlined />}
    >
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

      {/* Membership breakdown. Its own row because these are totals about the
          donor base, not period-scoped like the quartet below, and because the
          coworking count is the number that makes the $3 platform fee add up. */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={12}>
          <Card style={{ position: 'relative', minHeight: 132 }}>
            <CardIcon icon={<TeamOutlined />} tone="#722ed1" />
            <Text
              type="secondary"
              style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}
            >
              Coworking Donors
            </Text>
            <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.1, marginTop: 8 }}>
              {(membership?.coworking ?? 0).toLocaleString()}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              billed by their space, not through Stripe
            </Text>
            {!!coworkingFee && coworkingFee.count > 0 && (
              <div style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 12 }}>
                  ${coworkingFee.monthlyTotal.toFixed(2)}/mo in platform fees
                </Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={12}>
          <Card style={{ position: 'relative', minHeight: 132 }}>
            <CardIcon icon={<TeamOutlined />} tone="#DB8633" />
            <Text
              type="secondary"
              style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}
            >
              General Donors
            </Text>
            <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.1, marginTop: 8 }}>
              {(membership?.general ?? 0).toLocaleString()}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              pay THRIVE directly by card
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 12 }}>
                {(membership?.generalActive ?? 0).toLocaleString()} active
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Period selector controls the trio below */}
      <div style={{ marginBottom: 12 }}>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      {/* Quartet — New / Lost / Net / Platform Fee */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <TrioCard
            title="New Donors"
            icon={<UserAddOutlined />}
            iconTone="#DB8633"
            currentCount={currentBlock?.new?.count ?? 0}
            prevCount={prevBlock?.new?.count ?? 0}
            vsPrevLabel={PERIOD_LABELS[period].vsPrev}
            sparklineValues={newSeries}
            sparklineColor="#DB8633"
            moreIsBetter={true}
            formatHero={sign}
            onClick={() => openCohort('new')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <TrioCard
            title="Lost Donors"
            icon={<UserDeleteOutlined />}
            iconTone="#324E58"
            currentCount={currentBlock?.lost?.count ?? 0}
            prevCount={prevBlock?.lost?.count ?? 0}
            vsPrevLabel={PERIOD_LABELS[period].vsPrev}
            sparklineValues={lostSeries}
            sparklineColor="#324E58"
            moreIsBetter={false}
            formatHero={(n) => (n === 0 ? '0' : `-${n}`)}
            onClick={() => openCohort('lost')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <TrioCard
            title="Net Donor Change"
            icon={<RiseOutlined />}
            iconTone="#DB8633"
            currentCount={currentBlock?.net?.count ?? 0}
            prevCount={prevBlock?.net?.count ?? 0}
            vsPrevLabel={PERIOD_LABELS[period].vsPrev}
            sparklineValues={netSeries}
            sparklineColor="#DB8633"
            moreIsBetter={true}
            formatHero={sign}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <PlatformFeeCard
            currentTotal={currentBlock?.platformFee?.total ?? 0}
            currentCount={currentBlock?.platformFee?.count ?? 0}
            prevTotal={prevBlock?.platformFee?.total ?? 0}
            vsPrevLabel={PERIOD_LABELS[period].vsPrev}
          />
        </Col>
      </Row>

      {/* Drill-through for the New / Lost cards. The row count always equals
          the number on the card because the endpoint reuses the same
          predicates as the counts — verified across all four periods. */}
      <Modal
        open={cohort !== null}
        onCancel={() => setCohort(null)}
        footer={null}
        width={760}
        title={
          cohort === 'lost'
            ? `Donors lost — ${PERIOD_LABELS[period].chip.toLowerCase()}`
            : `New donors — ${PERIOD_LABELS[period].chip.toLowerCase()}`
        }
      >
        {cohort === 'new' && cohortTeamCount > 0 && (
          <Text
            type="secondary"
            style={{ fontSize: 12, display: 'block', marginBottom: 10 }}
          >
            Includes {cohortTeamCount} team{' '}
            {cohortTeamCount === 1 ? 'account' : 'accounts'}, listed here but
            not counted in the New Donors figure.
          </Text>
        )}
        {cohortLoading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : cohortRows.length === 0 ? (
          <Empty
            description={
              cohort === 'lost'
                ? 'No donors lapsed in this period.'
                : 'No first-time donations in this period.'
            }
          />
        ) : (
          <Table
            dataSource={cohortRows}
            rowKey="user_id"
            size="small"
            pagination={cohortRows.length > 10 ? { pageSize: 10 } : false}
            columns={
              cohort === 'lost'
                ? [
                    {
                      title: 'Donor',
                      dataIndex: 'name',
                      render: (v: string, r: any) => v || r.email,
                    },
                    { title: 'Email', dataIndex: 'email' },
                    {
                      title: 'Membership',
                      dataIndex: 'membership',
                      render: (v: string) => <MembershipTag value={v} />,
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      render: (v: string) => {
                        const label =
                          v === 'unpaid'
                            ? 'Paused'
                            : v === 'past_due'
                              ? 'Payment failing'
                              : 'Cancelled';
                        const colour =
                          v === 'cancelled' ? 'default' : 'warning';
                        return <Tag color={colour}>{label}</Tag>;
                      },
                    },
                    {
                      title: 'Lapsed',
                      dataIndex: 'lost_at',
                      render: (v: string) =>
                        v ? new Date(v).toLocaleDateString('en-US') : '—',
                    },
                  ]
                : [
                    {
                      title: 'Donor',
                      dataIndex: 'name',
                      render: (v: string, r: any) => v || r.email,
                    },
                    { title: 'Email', dataIndex: 'email' },
                    {
                      title: 'Membership',
                      dataIndex: 'membership',
                      render: (v: string) => <MembershipTag value={v} />,
                    },
                    {
                      title: 'First donation',
                      dataIndex: 'first_donation_at',
                      render: (v: string) =>
                        v ? new Date(v).toLocaleDateString('en-US') : '—',
                    },
                    {
                      title: 'Signed up',
                      dataIndex: 'joined_at',
                      render: (v: string) =>
                        v ? new Date(v).toLocaleDateString('en-US') : '—',
                    },
                  ]
            }
          />
        )}
      </Modal>
    </DashboardSection>
  );
};

// Platform Fee revenue card — hero shows total \$ collected for the selected
// period, supporting line shows donation count × \$3 breakdown. Sparkline is
// omitted because we don't have a weekly platform-fee series (yet) — the
// donation-count weekly series uses net change, not paid-invoice counts.
const PlatformFeeCard: React.FC<{
  currentTotal: number;
  currentCount: number;
  prevTotal: number;
  vsPrevLabel: string;
}> = ({ currentTotal, currentCount, prevTotal, vsPrevLabel }) => {
  const money = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : n >= 10_000
      ? `$${(n / 1_000).toFixed(1)}K`
      : `$${Math.round(n).toLocaleString()}`;
  return (
    <Card style={{ position: 'relative', minHeight: 200 }}>
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 36,
          height: 36,
          borderRadius: 18,
          background: `#DB86331A`,
          color: '#DB8633',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
      >
        <DollarOutlined />
      </div>
      <Text
        type="secondary"
        style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}
      >
        Platform Fee ($3/donation)
      </Text>
      <div style={{ marginTop: 12, marginBottom: 4 }}>
        <span style={{ fontSize: 36, fontWeight: 700 }}>
          {money(currentTotal)}
        </span>
      </div>
      <div style={{ marginBottom: 16 }}>
        <DeltaPill
          current={currentTotal}
          previous={prevTotal}
          moreIsBetter={true}
        />{' '}
        <Text type="secondary" style={{ fontSize: 12 }}>
          {vsPrevLabel}
        </Text>
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {currentCount} paid donation{currentCount === 1 ? '' : 's'} × $3
      </Text>
    </Card>
  );
};

export default DonorOverviewSection;
