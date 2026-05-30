import React from 'react';
import { Card, Col, Row, Typography } from 'antd';
import {
  MailOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PercentageOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const BRAND_ORANGE = '#DB8633';
const BRAND_TEAL = '#324E58';
const SUCCESS_GREEN = '#52c41a';

interface InvitationLike {
  status?: string;
}

interface Props {
  invitations: InvitationLike[];
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

const InvitationsHighlights: React.FC<Props> = ({ invitations }) => {
  const total = invitations.length;
  const pending = invitations.filter(
    (i) => (i.status || '').toLowerCase() === 'pending',
  ).length;
  const approved = invitations.filter(
    (i) => (i.status || '').toLowerCase() === 'approved',
  ).length;
  // Acceptance rate = approved / total, in percent. 0 when no invitations exist.
  const acceptanceRate =
    total === 0 ? 0 : Math.round((approved / total) * 1000) / 10;

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Total Sent"
          hero={total.toLocaleString()}
          heroSuffix={total === 1 ? 'invite' : 'invites'}
          icon={<MailOutlined />}
          tone={BRAND_TEAL}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              Beneficiary + vendor invitations, lifetime
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Pending"
          hero={pending.toLocaleString()}
          heroSuffix={pending === 1 ? 'invite' : 'invites'}
          icon={<ClockCircleOutlined />}
          tone={pending > 0 ? BRAND_ORANGE : BRAND_TEAL}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {pending > 0 ? 'Awaiting recipient response' : 'No invites waiting'}
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Accepted"
          hero={approved.toLocaleString()}
          heroSuffix={approved === 1 ? 'invite' : 'invites'}
          icon={<CheckCircleOutlined />}
          tone={SUCCESS_GREEN}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              Turned into active accounts
            </Text>
          }
        />
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <HighlightCard
          label="Acceptance Rate"
          hero={total === 0 ? '—' : `${acceptanceRate}%`}
          heroSuffix={total === 0 ? undefined : 'accepted'}
          icon={<PercentageOutlined />}
          tone={BRAND_ORANGE}
          detail={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {total === 0
                ? 'No invitations sent yet'
                : `${approved} of ${total} accepted overall`}
            </Text>
          }
        />
      </Col>
    </Row>
  );
};

export default InvitationsHighlights;
