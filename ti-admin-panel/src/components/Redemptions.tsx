import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layout, Typography, Card, Table, Tag, Select, Spin, Alert, Row, Col,
  Statistic, Empty, Tooltip, message,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import AdminSidebar from './AdminSidebar';
import { redemptionsAPI, RedemptionRow, RedemptionSummary } from '../services/api';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

/**
 * Redemptions.
 *
 * Two things on this page are easy to misread, so both are labelled in the UI
 * rather than left for someone to discover later.
 *
 * The money is optional. A redemption is recorded when the code is revealed;
 * the amounts come from a savings form the donor can skip. So every money
 * figure here is computed over the subset that has amounts, never over all
 * redemptions, and the capture rate is shown beside them so nobody reads an
 * average as if it covered everyone.
 *
 * Attribution starts on 13 Nov 2026. Rows older than the column have no
 * source and never will. Without saying so, a small notification share reads
 * as "reminders do not work" rather than "most of these predate the column".
 */

/** Before this, the redeem endpoint dropped failures silently and the table
 *  captured a fraction of real redemptions. Any trend crossing it is fiction. */
const UNDERCOUNT_UNTIL = new Date('2026-09-30T00:00:00Z');
/** The migration that added redemptions.source. */
const ATTRIBUTION_FROM = new Date('2026-11-13T00:00:00Z');

const PERIODS = [
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
];

const money = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : `$${n.toFixed(2)}`;

const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Redemptions: React.FC = () => {
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<RedemptionRow[]>([]);
  const [summary, setSummary] = useState<RedemptionSummary | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState('90');
  const [source, setSource] = useState<string | undefined>(undefined);
  const [vendorId, setVendorId] = useState<number | undefined>(undefined);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (period !== 'all') {
        const d = new Date();
        d.setDate(d.getDate() - Number(period));
        params.from = d.toISOString().slice(0, 10);
      }
      if (source) params.source = source;
      if (vendorId != null) params.vendorId = vendorId;

      const data = await redemptionsAPI.getAll(params);
      setRows(data.redemptions || []);
      setSummary(data.summary || null);
      setTruncated(!!data.truncated);
    } catch (e: any) {
      setError(e?.message || 'Could not load redemptions.');
      message.error('Could not load redemptions.');
    } finally {
      setLoading(false);
    }
  }, [period, source, vendorId]);

  useEffect(() => { load(); }, [load]);

  // Vendor filter options come from the rows themselves. One fewer request,
  // and it can only ever offer vendors that actually have a redemption.
  const vendorOptions = useMemo(() => {
    const m = new Map<number, string>();
    rows.forEach((r) => {
      if (r.vendor.id != null && r.vendor.name) m.set(r.vendor.id, r.vendor.name);
    });
    // Array.from rather than spreading the iterator: this project's TS target
    // predates ES2015 iteration and rejects [...map.entries()].
    return Array.from(m.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rows]);

  const sourceOptions = useMemo(
    () => (summary?.by_source || []).map((s) => ({ value: s.key, label: s.key })),
    [summary]
  );

  const spansUndercount = useMemo(
    () => rows.some((r) => new Date(r.redeemed_at) < UNDERCOUNT_UNTIL),
    [rows]
  );
  const spansPreAttribution = useMemo(
    () => rows.some((r) => new Date(r.redeemed_at) < ATTRIBUTION_FROM),
    [rows]
  );

  const columns = [
    {
      title: 'When',
      dataIndex: 'redeemed_at',
      key: 'redeemed_at',
      width: 150,
      sorter: (a: RedemptionRow, b: RedemptionRow) =>
        new Date(a.redeemed_at).getTime() - new Date(b.redeemed_at).getTime(),
      defaultSortOrder: 'descend' as const,
      render: (v: string, r: RedemptionRow) => {
        const d = new Date(v);
        return (
          <div style={{ fontSize: 12, lineHeight: '18px' }}>
            <div>{d.toLocaleDateString()}</div>
            <div style={{ color: '#8C8C8C' }}>
              {d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              {' · '}{DOW[r.day_of_week].slice(0, 3)}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Donor',
      key: 'donor',
      render: (_: any, r: RedemptionRow) => (
        <div style={{ fontSize: 12, lineHeight: '18px' }}>
          <div>{r.donor.name || <Text type="secondary">Unknown</Text>}</div>
          <div style={{ color: '#8C8C8C' }}>{r.donor.email || ''}</div>
          {r.donor.days_since_signup !== null && (
            <div style={{ color: '#8C8C8C' }}>
              {r.donor.days_since_signup === 0
                ? 'Signed up that day'
                : `Day ${r.donor.days_since_signup} as a member`}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Business',
      key: 'vendor',
      render: (_: any, r: RedemptionRow) => (
        <div style={{ fontSize: 12, lineHeight: '18px' }}>
          <div>{r.vendor.name || <Text type="secondary">Unknown</Text>}</div>
          <div style={{ color: '#8C8C8C' }}>{r.discount.title || ''}</div>
        </div>
      ),
    },
    {
      title: 'Bill',
      dataIndex: 'total_bill',
      key: 'total_bill',
      width: 90,
      align: 'right' as const,
      sorter: (a: RedemptionRow, b: RedemptionRow) => (a.total_bill ?? -1) - (b.total_bill ?? -1),
      render: (v: number | null) =>
        v === null ? <Text type="secondary">—</Text> : money(v),
    },
    {
      title: 'Saved',
      dataIndex: 'total_savings',
      key: 'total_savings',
      width: 120,
      align: 'right' as const,
      sorter: (a: RedemptionRow, b: RedemptionRow) =>
        (a.total_savings ?? -1) - (b.total_savings ?? -1),
      render: (v: number | null, r: RedemptionRow) => {
        if (v === null) {
          return (
            <Tooltip title="This donor skipped the savings form, so we never learned the amount.">
              <Text type="secondary">Not told</Text>
            </Tooltip>
          );
        }
        return (
          <div style={{ fontSize: 12, lineHeight: '18px' }}>
            <div style={{ color: '#389E0D', fontWeight: 600 }}>{money(v)}</div>
            {r.savings_rate !== null && (
              <div style={{ color: '#8C8C8C' }}>{r.savings_rate}% of bill</div>
            )}
            {r.pairing === 'inferred' && (
              <Tooltip title="Matched to this redemption by donor and discount within an hour, because it predates the link between the two tables. Treat as approximate.">
                <Tag color="warning" style={{ marginTop: 2, fontSize: 10 }}>approx</Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: 'Came from',
      key: 'source',
      width: 150,
      render: (_: any, r: RedemptionRow) => {
        if (!r.source) {
          return (
            <Tooltip title="Recorded before we started tracking where redemptions come from.">
              <Text type="secondary" style={{ fontSize: 12 }}>Not tracked</Text>
            </Tooltip>
          );
        }
        const isNotification = r.source === 'notification';
        return (
          <div style={{ fontSize: 12, lineHeight: '18px' }}>
            <Tag color={isNotification ? 'green' : 'default'}>{r.source_label}</Tag>
            {r.minutes_from_reminder !== null && (
              <div style={{ color: '#8C8C8C', marginTop: 2 }}>
                {r.minutes_from_reminder} min after the nudge
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const capture = summary?.savings_capture_rate;

  return (
    <Layout className="redemptions-layout">
      <AdminSidebar
        activeKey="redemptions"
        mobileVisible={mobileSidebarVisible}
        onMobileToggle={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      <Layout className="standard-main-content">
        <Header className="discounts-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Redemptions</Title>
            <Text type="secondary">
              {loading ? 'Loading…' : `${summary?.redemptions ?? 0} redemptions`}
            </Text>
          </div>
        </Header>

        <Content className="discounts-content">
          <div className="content-wrapper" style={{ padding: 16 }}>

            {error && (
              <Alert type="error" showIcon style={{ marginBottom: 16 }}
                message="Could not load redemptions" description={error} />
            )}

            {truncated && (
              <Alert type="warning" showIcon style={{ marginBottom: 16 }}
                message="Showing the most recent rows only"
                description="This period has more redemptions than the page fetches at once. Narrow the period for exact totals." />
            )}

            {/* Filters */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[12, 12]} align="middle">
                <Col>
                  <Select value={period} onChange={setPeriod} options={PERIODS} style={{ width: 170 }} />
                </Col>
                <Col>
                  <Select
                    allowClear placeholder="Any business" value={vendorId}
                    onChange={(v) => setVendorId(v)} options={vendorOptions}
                    style={{ width: 210 }} showSearch optionFilterProp="label"
                  />
                </Col>
                <Col>
                  <Select
                    allowClear placeholder="Any source" value={source}
                    onChange={(v) => setSource(v)} options={sourceOptions}
                    style={{ width: 180 }}
                  />
                </Col>
              </Row>
            </Card>

            <Spin spinning={loading}>
              {/* Headline numbers */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} md={6}>
                  <Card size="small">
                    <Statistic title="Redemptions" value={summary?.redemptions ?? 0} />
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small">
                    <Statistic title="Donors who redeemed" value={summary?.distinct_donors ?? 0} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {summary?.repeat_donors ?? 0} came back
                      {summary?.repeat_rate !== null && summary?.repeat_rate !== undefined
                        ? ` (${summary.repeat_rate}%)` : ''}
                    </Text>
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small">
                    <Statistic
                      title={<>Told us what they saved <Tooltip title="The savings form after redeeming is optional. Every money figure on this page covers only these redemptions."><InfoCircleOutlined /></Tooltip></>}
                      value={capture ?? 0}
                      suffix="%"
                      valueStyle={{ color: capture !== null && capture !== undefined && capture < 50 ? '#CF1322' : '#389E0D' }}
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {summary?.with_savings ?? 0} of {summary?.redemptions ?? 0}
                    </Text>
                  </Card>
                </Col>
                <Col xs={12} md={6}>
                  <Card size="small">
                    <Statistic title="Saved, where known" value={summary?.total_savings ?? 0} prefix="$" precision={2} />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {money(summary?.average_savings ?? null)} average
                    </Text>
                  </Card>
                </Col>
              </Row>

              {/* Caveats, shown only when they actually apply to what is on screen */}
              {spansUndercount && (
                <Alert type="warning" showIcon style={{ marginBottom: 12 }}
                  message="This period reaches back before October 2026"
                  description="Until the end of September 2026 the redeem endpoint logged failures silently and recorded only a fraction of real redemptions. Counts before that date are undercounts, so a trend line crossing it is not real growth." />
              )}
              {spansPreAttribution && (
                <Alert type="info" showIcon style={{ marginBottom: 16 }}
                  message="Where redemptions come from has only been tracked since 13 November 2026"
                  description={`${summary?.attributed ?? 0} of ${summary?.redemptions ?? 0} rows here carry a source. The rest are older than the tracking, not untracked journeys. Compare sources against each other, not against the total.`} />
              )}

              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} md={8}>
                  <Card size="small" title="Where they came from">
                    {summary?.by_source?.length ? summary.by_source.map((s) => (
                      <Row key={s.key} justify="space-between" style={{ fontSize: 13, padding: '3px 0' }}>
                        <Col>{s.key}</Col>
                        <Col><b>{s.count}</b></Col>
                      </Row>
                    )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nothing tracked yet" />}
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small" title="Busiest businesses">
                    {summary?.by_vendor?.length ? summary.by_vendor.map((s) => (
                      <Row key={s.key} justify="space-between" style={{ fontSize: 13, padding: '3px 0' }}>
                        <Col>{s.key}</Col>
                        <Col><b>{s.count}</b></Col>
                      </Row>
                    )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No redemptions" />}
                  </Card>
                </Col>
                <Col xs={24} md={8}>
                  <Card size="small" title="Busiest days">
                    {summary?.by_day_of_week?.length ? [...summary.by_day_of_week]
                      .sort((a, b) => Number(a.key) - Number(b.key))
                      .map((s) => (
                        <Row key={s.key} justify="space-between" style={{ fontSize: 13, padding: '3px 0' }}>
                          <Col>{DOW[Number(s.key)]}</Col>
                          <Col><b>{s.count}</b></Col>
                        </Row>
                      )) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No redemptions" />}
                  </Card>
                </Col>
              </Row>

              <Card size="small">
                <Table
                  rowKey="id"
                  dataSource={rows}
                  columns={columns as any}
                  size="small"
                  pagination={{ pageSize: 25, showSizeChanger: true, showTotal: (t) => `${t} redemptions` }}
                  locale={{ emptyText: <Empty description="No redemptions in this period" /> }}
                  scroll={{ x: 900 }}
                />
              </Card>
            </Spin>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Redemptions;
