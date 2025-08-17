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
  UserAddOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
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
    }
  };

  const tenantsData = [
    {
      key: '1',
      tenantName: 'Coca-Cola',
      contactName: 'Stephanie Lewis',
      email: 'stephanielewis@gmail.com',
      createdDate: 'July 17, 2023',
      users: 4,
      charities: 4,
      vendors: 4,
      active: false,
      avatar: 'C'
    },
    {
      key: '2',
      tenantName: 'Apple',
      contactName: 'Sarah Thompson',
      email: 'sarahthompson@gmail.com',
      createdDate: 'July 17, 2023',
      users: 5,
      charities: 5,
      vendors: 5,
      active: true,
      avatar: 'A'
    },
    {
      key: '3',
      tenantName: 'Nike',
      contactName: 'David Anderson',
      email: 'davidanderson@gmail.com',
      createdDate: 'July 20, 2023',
      users: 7,
      charities: 7,
      vendors: 7,
      active: true,
      avatar: 'N'
    },
    {
      key: '4',
      tenantName: 'Amazon',
      contactName: 'Jennifer Parker',
      email: 'jenniferparker@gmail.com',
      createdDate: 'July 17, 2023',
      users: 1,
      charities: 1,
      vendors: 1,
      active: true,
      avatar: 'A'
    },
    {
      key: '5',
      tenantName: 'Procter & Gamble',
      contactName: 'Christopher Martinez',
      email: 'christophermartinez@gmail.com',
      createdDate: 'July 17, 2023',
      users: 6,
      charities: 6,
      vendors: 6,
      active: false,
      avatar: 'P'
    },
    {
      key: '6',
      tenantName: 'Ford',
      contactName: 'Emily Davis',
      email: 'emilydavis@gmail.com',
      createdDate: 'July 17, 2023',
      users: 9,
      charities: 9,
      vendors: 9,
      active: true,
      avatar: 'F'
    },
    {
      key: '7',
      tenantName: 'Levi\'s',
      contactName: 'Joshua Wilson',
      email: 'joshuawilson@gmail.com',
      createdDate: 'July 17, 2023',
      users: 5,
      charities: 5,
      vendors: 5,
      active: false,
      avatar: 'L'
    },
    {
      key: '8',
      tenantName: 'Samsung',
      contactName: 'Jessica Mitchell',
      email: 'jessicamitchell@gmail.com',
      createdDate: 'July 17, 2023',
      users: 3,
      charities: 3,
      vendors: 3,
      active: true,
      avatar: 'S'
    },
    {
      key: '9',
      tenantName: 'Under Armour',
      contactName: 'Matthew Clark',
      email: 'matthewclark@gmail.com',
      createdDate: 'July 17, 2023',
      users: 6,
      charities: 6,
      vendors: 6,
      active: true,
      avatar: 'U'
    },
    {
      key: '10',
      tenantName: 'PepsiCo',
      contactName: 'Amanda Taylor',
      email: 'amandataylor@gmail.com',
      createdDate: 'July 17, 2023',
      users: 8,
      charities: 8,
      vendors: 8,
      active: true,
      avatar: 'P'
    },
    {
      key: '11',
      tenantName: 'Kellogg\'s',
      contactName: 'Andrew Rodriguez',
      email: 'andrewrodriguez@gmail.com',
      createdDate: 'July 17, 2023',
      users: 6,
      charities: 6,
      vendors: 6,
      active: true,
      avatar: 'K'
    },
    {
      key: '12',
      tenantName: 'Pampers',
      contactName: 'Daniel Hall',
      email: 'danielhall@gmail.com',
      createdDate: 'July 17, 2023',
      users: 3,
      charities: 3,
      vendors: 3,
      active: true,
      avatar: 'P'
    }
  ];

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
    },
    {
      key: 'donors',
      icon: <UserOutlined />,
      label: 'Donors',
    },
    {
      key: 'beneficiaries',
      icon: <StarOutlined />,
      label: 'Beneficiaries',
    },
    {
      key: 'vendor',
      icon: <SettingOutlined />,
      label: 'Vendor',
    },
    {
      key: 'discounts',
      icon: <SettingOutlined />,
      label: 'Discounts',
    },
    {
      key: 'tenants',
      icon: <BankOutlined />,
      label: 'Tenants',
    },
    {
      key: 'events',
      icon: <SettingOutlined />,
      label: 'Events',
    },
    {
      key: 'leaderboard',
      icon: <SettingOutlined />,
      label: 'Leaderboard',
    },
    {
      key: 'feeds',
      icon: <SettingOutlined />,
      label: 'Feeds',
    },
    {
      key: 'pending-approvals',
      icon: <SettingOutlined />,
      label: 'Pending Approvals',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  return (
    <Layout className="tenants-layout">
      {/* Mobile Menu Button */}
      <Button
        className="mobile-menu-btn"
        icon={<MenuOutlined />}
        onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      {/* Sidebar */}
      <Sider
        className="tenants-sider"
        width={280}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div className="logo-section">
          <div className="logo-container">
            <img
              src="/piggy-logo.png"
              alt="Thrive Initiative Logo"
              className="logo-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="logo-fallback">TI</div>
          </div>
          <div className="white-logo-container">
            <img
              src="/white-logo.png"
              alt="Thrive Initiative White Logo"
              className="white-logo-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="white-logo-fallback" style={{ display: 'none' }}>
              <div className="fallback-text">TI</div>
            </div>
          </div>
          <div className="brand-name">THRIVE INITIATIVE</div>
          <div className="brand-subtitle">Change4Good.org</div>
        </div>

        <Menu
          className="tenants-menu"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
        />

        <div className="user-profile">
          <Avatar size={40} icon={<UserOutlined />} />
          <div className="user-info">
            <Text strong>Shahryar Minhas</Text>
            <Text type="secondary">shahryarminhas@gmail.com</Text>
          </div>
          <Button type="text" icon={<MoreOutlined />} />
        </div>
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
                dataSource={tenantsData}
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