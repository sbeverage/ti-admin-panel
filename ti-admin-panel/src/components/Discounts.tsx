import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Input,
  Button,
  Avatar,
  Space,
  Pagination,
  Select,
  Card,
  Row,
  Col
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  SettingOutlined,
  MenuOutlined,
  MoreOutlined,
  SearchOutlined,
  GiftOutlined,
  BankOutlined,
  UserAddOutlined,
  RiseOutlined,
  CalendarOutlined,
  CrownOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import './Discounts.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const { Sider, Content } = Layout;

const Discounts: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Discounts component mounted');
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    console.log('Menu clicked:', key); // Debug log
    if (key === 'dashboard') {
      navigate('/dashboard');
    } else if (key === 'donors') {
      navigate('/donors');
    } else if (key === 'beneficiaries') {
      navigate('/beneficiaries');
    } else if (key === 'vendor') {
      navigate('/vendor');
    } else if (key === 'tenants') {
      navigate('/tenants');
    } else if (key === 'pending-approvals') {
      navigate('/pending-approvals');
    } else if (key === 'referral-analytics') {
      navigate('/referral-analytics');
    } else if (key === 'geographic-analytics') {
      navigate('/geographic-analytics');
    } else if (key === 'discounts') {
      console.log('Navigating to discounts...'); // Debug log
      navigate('/discounts');
    } else if (key === 'events') {
      navigate('/events');
    } else if (key === 'leaderboard') {
      navigate('/leaderboard');
    } else if (key === 'settings') {
      navigate('/settings');
       }
  };

  // No hardcoded data - use API data only

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      title: 'Dashboard Overview'
    },
    {
      key: 'donors',
      icon: <UserOutlined />,
      label: 'Donors',
      title: 'Donor Management'
    },
    {
      key: 'beneficiaries',
      icon: <StarOutlined />,
      label: 'Beneficiaries',
      title: 'Beneficiary Management'
    },
    {
      key: 'vendor',
      icon: <RiseOutlined />,
      label: 'Vendor',
      title: 'Vendor Management'
    },
    {
      key: 'discounts',
      icon: <GiftOutlined />,
      label: 'Discounts',
      title: 'Discount Management'
    },
    {
      key: 'tenants',
      icon: <BankOutlined />,
      label: 'Tenants',
      title: 'Tenant Management'
    },
    {
      key: 'events',
      icon: <CalendarOutlined />,
      label: 'Events',
      title: 'Event Management'
    },
    {
      key: 'leaderboard',
      icon: <CrownOutlined />,
      label: 'Leaderboard',
      title: 'Leaderboard & Rankings'
    },
    {
      key: 'pending-approvals',
      icon: <ExclamationCircleOutlined />,
      label: 'Pending Approvals',
      title: 'Pending Approvals'
    },
    {
      key: 'referral-analytics',
      icon: <TeamOutlined />,
      label: 'Referral Analytics',
      title: 'Referral Analytics & Tracking'
    },
    {
      key: 'geographic-analytics',
      icon: <GlobalOutlined />,
      label: 'Geographic Analytics',
      title: 'Geographic Analytics & Insights'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      title: 'System Settings & Configuration'
    },
  ];

  return (
    <Layout className="discounts-layout">
      {/* Mobile Menu Button - Right Side */}
      <Button
        className="mobile-menu-btn-right"
        icon={<MenuOutlined />}
        onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      {/* Sidebar */}
      <Sider
        className={`discounts-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
        width={280}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div className="logo-section" style={{
          padding: '20px 16px 12px 16px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'transparent'
        }}>
          {/* Simplified logo section with large centered logo */}
          <div className="logo-container" style={{
            position: 'relative',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img
              src="/white-logo.png"
              alt="Thrive Initiative Logo"
              className="logo-image"
              style={{
                width: '180px',
                height: 'auto',
                maxWidth: '100%',
                display: 'block',
                margin: '0 auto'
              }}
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
          className="discounts-menu"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      <Layout className="main-content">
        <div className="discounts-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Discounts</Title>
            <Text type="secondary" className="discounts-count">200 Discounts Found</Text>
          </div>
        </div>

        <Content className="discounts-content">
          <div className="content-wrapper">
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-section">
                <Search
                  placeholder="Search Discount Name"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="discount-search"
                />
              </div>
              <div className="filter-section">
                <Text strong className="filter-label">Filters</Text>
                <div className="filter-dropdowns">
                  <Select
                    placeholder="Select Discount vendor"
                    size="large"
                    className="filter-dropdown"
                  >
                    <Option value="nike">Nike</Option>
                    <Option value="apple">Apple</Option>
                    <Option value="samsung">Samsung</Option>
                    <Option value="amazon">Amazon</Option>
                  </Select>
                  <Select
                    placeholder="Select Discount Options"
                    size="large"
                    className="filter-dropdown"
                  >
                    <Option value="percentage">Percentage</Option>
                    <Option value="fixed">Fixed Amount</Option>
                    <Option value="bogo">Buy 1 Get 1</Option>
                    <Option value="free">Free Product/Service</Option>
                  </Select>
                  <Select
                    placeholder="Select Frequency"
                    size="large"
                    className="filter-dropdown"
                  >
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="yearly">Yearly</Option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Discounts Grid */}
            <div className="discounts-grid-section">
              <Row gutter={[16, 16]} className="discounts-grid">
                {/* No data available */}
              </Row>
            </div>

            {/* Pagination */}
            <div className="pagination-section">
              <Pagination
                current={currentPage}
                total={200}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showQuickJumper
                className="discounts-pagination"
              />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Discounts; 