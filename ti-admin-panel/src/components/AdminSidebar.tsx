import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  RiseOutlined,
  GiftOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  TeamOutlined,
  GlobalOutlined,
  CalculatorOutlined,
  SettingOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import UserProfile from './UserProfile';

const { Sider } = Layout;

// Canonical admin sidebar menu — single source of truth. Update this list
// (not per-page copies) when adding/renaming/reordering nav items.
const ADMIN_MENU_ITEMS = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', route: '/dashboard', title: 'Dashboard Overview' },
  { key: 'donors', icon: <UserOutlined />, label: 'Donors', route: '/donors', title: 'Donor Management' },
  { key: 'beneficiaries', icon: <StarOutlined />, label: 'Beneficiaries', route: '/beneficiaries', title: 'Beneficiary Management' },
  { key: 'vendor', icon: <RiseOutlined />, label: 'Vendor', route: '/vendor', title: 'Vendor Management' },
  { key: 'discounts', icon: <GiftOutlined />, label: 'Discounts', route: '/discounts', title: 'Discount Management' },
  { key: 'pending-approvals', icon: <ExclamationCircleOutlined />, label: 'Pending Approvals', route: '/pending-approvals', title: 'Pending Approvals' },
  { key: 'invitations', icon: <MailOutlined />, label: 'Invitations', route: '/invitations', title: 'Beneficiary & Vendor Invitations' },
  { key: 'referral-analytics', icon: <TeamOutlined />, label: 'Referral Analytics', route: '/referral-analytics', title: 'Referral Analytics & Tracking' },
  { key: 'geographic-analytics', icon: <GlobalOutlined />, label: 'Geographic Analytics', route: '/geographic-analytics', title: 'Geographic Analytics & Insights' },
  { key: 'reporting', icon: <CalculatorOutlined />, label: 'Reporting', route: '/reporting', title: 'Payouts & Financial Reporting' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Settings', route: '/settings', title: 'System Settings & Configuration' },
];

interface AdminSidebarProps {
  /** The menu item that should be highlighted as active (e.g. 'donors'). */
  activeKey: string;
  /** Mobile sidebar open/closed state — owned by parent so parent can also dismiss after navigation if desired. */
  mobileVisible: boolean;
  /** Toggle handler for the mobile menu button rendered next to the sidebar. */
  onMobileToggle: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeKey,
  mobileVisible,
  onMobileToggle,
}) => {
  const navigate = useNavigate();
  const routeByKey: Record<string, string> = Object.fromEntries(
    ADMIN_MENU_ITEMS.map((item) => [item.key, item.route])
  );

  const handleClick = ({ key }: { key: string }) => {
    const route = routeByKey[key];
    if (route) navigate(route);
  };

  return (
    <>
      <Button
        className="mobile-menu-btn-right"
        icon={<MenuOutlined />}
        onClick={onMobileToggle}
      />
      <Sider
        width={280}
        className={`standard-sider ${mobileVisible ? 'mobile-visible' : ''}`}
        trigger={null}
      >
        <div className="standard-logo-section">
          <div className="standard-logo-container">
            <img
              src="/white-logo.png"
              alt="THRIVE Logo"
              className="standard-logo-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="logo-fallback" style={{ display: 'none' }}>
              <div className="fallback-text">THRIVE</div>
            </div>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          items={ADMIN_MENU_ITEMS.map(({ key, icon, label, title }) => ({
            key,
            icon,
            label,
            title,
          }))}
          className="standard-menu"
          onClick={handleClick}
        />
        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>
    </>
  );
};

export default AdminSidebar;
