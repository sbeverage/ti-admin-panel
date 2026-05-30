import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const BRAND_ORANGE = '#DB8633';

interface Props {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Visual frame for a top-level Dashboard section. A subtle gray-tinted header
 * with a brand-orange accent stripe on the left edge delimits each section
 * without overpowering the cards inside. Inspired by the panelled layout at
 * jensaiscore.com/portal — clearly labeled but neutral.
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
        boxShadow: '0 2px 8px rgba(44, 62, 80, 0.06)',
        background: '#ffffff',
        border: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          background: '#fafafa',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        {/* Brand-orange left accent stripe */}
        <div style={{ width: 4, background: BRAND_ORANGE, flexShrink: 0 }} />
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            flex: 1,
          }}
        >
          {icon && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                background: `${BRAND_ORANGE}1A`,
                color: BRAND_ORANGE,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}
          <div>
            <Title level={4} style={{ margin: 0, color: '#262626' }}>
              {title}
            </Title>
            {subtitle && (
              <Text type="secondary" style={{ fontSize: 13 }}>
                {subtitle}
              </Text>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  );
};

export default DashboardSection;
