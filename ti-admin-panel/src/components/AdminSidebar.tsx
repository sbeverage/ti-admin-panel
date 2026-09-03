import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  HeartOutlined,
  RiseOutlined,
  GiftOutlined,
  ExclamationCircleOutlined,
  MailOutlined,
  TeamOutlined,
  GlobalOutlined,
  CalculatorOutlined,
  SettingOutlined,
  MenuOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import UserProfile from './UserProfile';

const { Sider } = Layout;

// One menu item — top-level pages have a route; group parents (children-only,
// no route) just expand/collapse to reveal sub-items.
interface MenuLeaf {
  key: string;
  icon: React.ReactNode;
  label: string;
  route: string;
  title: string;
}
interface MenuGroup {
  key: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  children: MenuLeaf[];
}
type MenuEntry = MenuLeaf | MenuGroup;
const isGroup = (entry: MenuEntry): entry is MenuGroup =>
  (entry as MenuGroup).children !== undefined;

// Canonical admin sidebar menu — single source of truth. Update this list
// (not per-page copies) when adding/renaming/reordering nav items.
const ADMIN_MENU_ITEMS: MenuEntry[] = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard', route: '/dashboard', title: 'Dashboard Overview' },
  { key: 'donors', icon: <UserOutlined />, label: 'Donors', route: '/donors', title: 'Donor Management' },
  { key: 'beneficiaries', icon: <HeartOutlined />, label: 'Beneficiaries', route: '/beneficiaries', title: 'Beneficiary Management' },
  {
    key: 'vendors-group',
    icon: <RiseOutlined />,
    label: 'Vendors',
    title: 'Vendor Management',
    children: [
      { key: 'vendor', icon: <UnorderedListOutlined />, label: 'Vendor List', route: '/vendor', title: 'All Vendors' },
      { key: 'discounts', icon: <GiftOutlined />, label: 'Discounts', route: '/discounts', title: 'Discount Management' },
    ],
  },
  { key: 'pending-approvals', icon: <ExclamationCircleOutlined />, label: 'Pending Approvals', route: '/pending-approvals', title: 'Pending Approvals' },
  { key: 'invitations', icon: <MailOutlined />, label: 'Invitations', route: '/invitations', title: 'Beneficiary & Vendor Invitations' },
  { key: 'referral-analytics', icon: <TeamOutlined />, label: 'Referral Analytics', route: '/referral-analytics', title: 'Referral Analytics & Tracking' },
  { key: 'geographic-analytics', icon: <GlobalOutlined />, label: 'Geographic Analytics', route: '/geographic-analytics', title: 'Geographic Analytics & Insights' },
  { key: 'reporting', icon: <CalculatorOutlined />, label: 'Reporting', route: '/reporting', title: 'Payouts & Financial Reporting' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Settings', route: '/settings', title: 'System Settings & Configuration' },
];

// Flatten { leaf-key → route } so the click handler can navigate without
// caring whether a leaf is top-level or nested under a group.
const ROUTE_BY_KEY: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const entry of ADMIN_MENU_ITEMS) {
    if (isGroup(entry)) {
      for (const child of entry.children) map[child.key] = child.route;
    } else {
      map[entry.key] = entry.route;
    }
  }
  return map;
})();

// Keys of group parents that contain the given leaf, so the parent submenu
// stays expanded when one of its children is the active page.
const GROUP_KEY_FOR_LEAF: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const entry of ADMIN_MENU_ITEMS) {
    if (isGroup(entry)) {
      for (const child of entry.children) map[child.key] = entry.key;
    }
  }
  return map;
})();

interface AdminSidebarProps {
  /** The menu item that should be highlighted as active (e.g. 'donors', 'discounts'). */
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

  const handleClick = ({ key }: { key: string }) => {
    const route = ROUTE_BY_KEY[key];
    if (route) navigate(route);
  };

  // Auto-open the parent submenu when the active page is one of its children.
  const groupOfActive = GROUP_KEY_FOR_LEAF[activeKey];
  const defaultOpenKeys = groupOfActive ? [groupOfActive] : [];

  const menuItems = ADMIN_MENU_ITEMS.map((entry) => {
    if (isGroup(entry)) {
      return {
        key: entry.key,
        icon: entry.icon,
        label: entry.label,
        title: entry.title,
        children: entry.children.map((child) => ({
          key: child.key,
          icon: child.icon,
          label: child.label,
          title: child.title,
        })),
      };
    }
    return {
      key: entry.key,
      icon: entry.icon,
      label: entry.label,
      title: entry.title,
    };
  });

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
          defaultOpenKeys={defaultOpenKeys}
          items={menuItems}
          className="standard-menu"
          onClick={handleClick}
        />
        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>
    </>
  );
};

export default AdminSidebar;
