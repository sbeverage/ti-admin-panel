import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

// Brand gradient blue used throughout the mobile app
// (see app/signup.js, app/donorInvitationVerify.js).
const GRADIENT_FROM = '#2C3E50';
const GRADIENT_TO = '#4CA1AF';

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Visual frame for a top-level Dashboard section. Renders a gradient header
 * banner (brand teal/navy) with title + subtitle, then a white content panel
 * below for the section's KPI cards and charts. Inspired by the panelled
 * layout at jensaiscore.com/portal — each section is clearly delimited and
 * easy to scan.
 *
 * The data + cards inside `children` are unchanged; this only adds chrome.
 */
const DashboardSection: React.FC<Props> = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  return (
    <div
      style={{
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(44, 62, 80, 0.08)',
        background: '#ffffff',
        border: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${GRADIENT_FROM} 0%, ${GRADIENT_TO} 100%)`,
          padding: '20px 24px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <Title level={4} style={{ margin: 0, color: '#ffffff' }}>
            {title}
          </Title>
          {subtitle && (
            <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 13 }}>
              {subtitle}
            </Text>
          )}
        </div>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
};

export default DashboardSection;
