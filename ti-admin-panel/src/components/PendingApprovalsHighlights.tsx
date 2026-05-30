import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import {
  ExclamationCircleOutlined,
  HeartOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const BRAND_ORANGE = '#DB8633';
const BRAND_TEAL = '#324E58';
const DANGER_RED = '#ff4d4f';

interface ApprovalLike {
  itemType: 'vendor' | 'beneficiary';
  createdAt?: number | null;
}

interface Props {
  approvals: ApprovalLike[];
}

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

const PendingApprovalsHighlights: React.FC<Props> = ({ approvals }) => {
  const total = approvals.length;
  const beneficiariesPending = approvals.filter(
    (a) => a.itemType === 'beneficiary',
  ).length;
  const vendorsPending = approvals.filter((a) => a.itemType === 'vendor')
    .length;

  // Days since oldest pending — surfaces how stale the queue is.
  let oldestAgeDays: number | null = null;
  for (const a of approvals) {
    if (a.createdAt != null) {
      const ageMs = Date.now() - a.createdAt;
      const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
      if (oldestAgeDays == null || ageDays > oldestAgeDays) {
        oldestAgeDays = ageDays;
      }
    }
  }

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={8}>
        <HighlightCard
          label="Total Pending"
          hero={total.toLocaleString()}
          heroSuffix={total === 1 ? 'awaiting review' : 'awaiting review'}
          heroColor={total > 0 ? DANGER_RED : undefined}
          icon={<ExclamationCircleOutlined />}
          tone={total > 0 ? DANGER_RED : BRAND_TEAL}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {oldestAgeDays != null
                ? `Oldest is ${oldestAgeDays} day${oldestAgeDays === 1 ? '' : 's'} old`
                : 'Queue is clear'}
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={8}>
        <HighlightCard
          label="Pending Beneficiaries"
          hero={beneficiariesPending.toLocaleString()}
          heroSuffix={
            beneficiariesPending === 1 ? 'charity' : 'charities'
          }
          icon={<HeartOutlined />}
          tone={BRAND_TEAL}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {beneficiariesPending > 0
                ? 'Verify 501(c)(3) status + bank info'
                : 'No charities waiting'}
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={8}>
        <HighlightCard
          label="Pending Vendors"
          hero={vendorsPending.toLocaleString()}
          heroSuffix={vendorsPending === 1 ? 'vendor' : 'vendors'}
          icon={<ShoppingOutlined />}
          tone={BRAND_ORANGE}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {vendorsPending > 0
                ? 'Review business + sample discounts'
                : 'No vendors waiting'}
            </Text>
          }
        />
      </Col>
    </Row>
  );
};

export default PendingApprovalsHighlights;
