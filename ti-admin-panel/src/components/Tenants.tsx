import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Input,
  Button,
  Table,
  Avatar,
  Space,
  Pagination,
  Select
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  SettingOutlined,
  MenuOutlined,
  MoreOutlined,
  SearchOutlined,
  EditOutlined,
  CheckCircleFilled,
  BankOutlined,
  UserAddOutlined,
  RiseOutlined,
  GiftOutlined,
  CalendarOutlined,
  CrownOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import './Tenants.css';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Tenants: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleChange = (key: string, field: 'active') => {
    // This would typically update the backend
    console.log(`Toggling ${field} for tenant ${key}`);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
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
      navigate('/discounts');
    } else if (key === 'leaderboard') {
      navigate('/leaderboard');
    } else if (key === 'settings') {
      navigate('/settings');
       }
  };

  // No hardcoded data - use API data only

  const columns = [
    {
      title: 'Tenant name',
      dataIndex: 'tenantName',
      key: 'tenantName',
      render: (text: string, record: any) => (
        <Space>
          <Avatar size={32} style={{ backgroundColor: '#DB8633', color: '#ffffff' }}>
            {record.avatar}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
      fixed: 'left' as const,
      width: 200
    },
    {
      title: 'Contact name',
      dataIndex: 'contactName',
      key: 'contactName',
      render: (text: string) => <Text>{text}</Text>,
      width: 150
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 200
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 130
    },
    {
      title: 'Users',
      dataIndex: 'users',
      key: 'users',
      render: (text: number) => <Text strong>{text}</Text>,
      width: 100
    },
    {
      title: 'Charities',
      dataIndex: 'charities',
      key: 'charities',
      render: (text: number) => <Text strong>{text}</Text>,
      width: 100
    },
    {
      title: 'Vendors',
      dataIndex: 'vendors',
      key: 'vendors',
      render: (text: number) => <Text strong>{text}</Text>,
      width: 100
    },
    {
      title: 'Active/De-active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: any) => (
        <div className="toggle-switch">
          <div 
            className={`toggle ${active ? 'active' : 'inactive'}`}
            onClick={() => handleToggleChange(record.key, 'active')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 120
    }
  ];

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
    <Layout className="tenants-layout">
      {/* Mobile Menu Button - Right Side */}
      <Button
        className="mobile-menu-btn-right"
        icon={<MenuOutlined />}
        onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      {/* Sidebar */}
      <Sider
        className={`tenants-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
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
          className="tenants-menu"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      <Layout className="main-content">
        <div className="tenants-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Tenants</Title>
            <Text type="secondary" className="tenants-count">20 Tenants Found</Text>
          </div>
          <div className="header-right">
            <Button 
              type="primary" 
              icon={<UserAddOutlined />}
              size="large"
              className="invite-tenant-btn"
            >
              + Invite A Tenant
            </Button>
          </div>
        </div>

        <Content className="tenants-content">
          <div className="content-wrapper">
            {/* Search and Action Bar */}
            <div className="search-action-bar">
              <div className="search-section">
                <Search
                  placeholder="Search Tenant Name"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="tenant-search"
                />
              </div>
            </div>

            {/* Tenants Table */}
            <div className="tenants-table-section">
              <Table
                columns={columns}
                dataSource={[]}
                pagination={false}
                size="middle"
                className="tenants-table"
                rowClassName="tenant-row"
                scroll={{ x: 1200 }}
                bordered={false}
              />
            </div>

            {/* Pagination */}
            <div className="pagination-section">
              <Pagination
                current={currentPage}
                total={20}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showQuickJumper
                className="tenants-pagination"
              />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Tenants; 