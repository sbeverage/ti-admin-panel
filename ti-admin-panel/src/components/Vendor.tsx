import React, { useState } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Input, Select, Table, Pagination, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, UserOutlined, StarOutlined, RiseOutlined, SettingOutlined,
  CalendarOutlined, CrownOutlined, FileTextOutlined, ExclamationCircleOutlined,
  MenuOutlined, BellOutlined, SearchOutlined, MoreOutlined, UserAddOutlined,
  FilterOutlined, SortAscendingOutlined, SortDescendingOutlined, EditOutlined,
  DownOutlined, ShopOutlined, GiftOutlined, BankOutlined, TeamOutlined, GlobalOutlined
} from '@ant-design/icons';
import InviteVendorModal from './InviteVendorModal';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';
import './Vendor.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Vendor: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('30-days');
  const [inviteVendorModalVisible, setInviteVendorModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleToggleChange = (key: string, field: 'active' | 'enabled') => {
    setVendorsData(prevData =>
      prevData.map(item =>
        item.key === key
          ? { ...item, [field]: !item[field] }
          : item
      )
    );
    console.log(`Toggled ${field} for key ${key}`);
  };

  const handleTimeFilterChange = (key: string) => {
    setSelectedTimeFilter(key);
    console.log(`Time filter changed to: ${key}`);
  };

  const handleInviteVendor = () => {
    setInviteVendorModalVisible(true);
  };

  const handleInviteVendorModalCancel = () => {
    setInviteVendorModalVisible(false);
  };

  const handleInviteVendorModalSubmit = (values: any) => {
    console.log('Vendor invite submitted:', values);
    setInviteVendorModalVisible(false);
    // Here you would typically send the data to your backend
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'dashboard') {
      navigate('/dashboard');
    } else if (key === 'donors') {
      navigate('/donors');
    } else if (key === 'vendor') {
      navigate('/vendor');
    } else if (key === 'beneficiaries') {
      navigate('/beneficiaries');
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
    } else if (key === 'events') {
      navigate('/events');
    } else if (key === 'leaderboard') {
      navigate('/leaderboard');
    } else if (key === 'settings') {
      navigate('/settings');
       }
  };

  const timeFilterMenu = [
    {
      key: '7-days',
      label: 'Last 7 Days',
      onClick: () => handleTimeFilterChange('7-days')
    },
    {
      key: '30-days',
      label: 'Last 30 Days',
      onClick: () => handleTimeFilterChange('30-days')
    },
    {
      key: '90-days',
      label: 'Last 90 Days',
      onClick: () => handleTimeFilterChange('90-days')
    },
    {
      key: '1-year',
      label: 'Last 1 Year',
      onClick: () => handleTimeFilterChange('1-year')
    },
    {
      key: 'all-time',
      label: 'All Time',
      onClick: () => handleTimeFilterChange('all-time')
    }
  ];

  const [vendorsData, setVendorsData] = useState([
    {
      key: '1',
      name: 'Apple',
      contactName: 'Stephanie Lewis',
      email: 'stephanielewis@gmail.com',
      contact: '(555) 123-4567',
      category: 'Electronics',
      cityState: 'Springfield, IL',
      tier: '$$',
      discount: 10,
      active: false,
      enabled: false,
      avatar: 'A'
    },
    {
      key: '2',
      name: 'Nike',
      contactName: 'Sarah Thompson',
      email: 'sarahthompson@gmail.com',
      contact: '(555) 987-6543',
      category: 'Athletic footwear and apparel',
      cityState: 'Portland, OR',
      tier: '$$$',
      discount: 10,
      active: true,
      enabled: true,
      avatar: 'N'
    },
    {
      key: '3',
      name: 'Coca-Cola',
      contactName: 'David Anderson',
      email: 'davidanderson@gmail.com',
      contact: '(555) 567-8901',
      category: 'Beverages',
      cityState: 'Charleston, SC',
      tier: '$$',
      discount: 10,
      active: true,
      enabled: true,
      avatar: 'C'
    },
    {
      key: '4',
      name: 'Amazon',
      contactName: 'Jennifer Parker',
      email: 'jenniferparker@gmail.com',
      contact: '(555) 111-2222',
      category: 'E-commerce',
      cityState: 'Austin, TX',
      tier: '$$$$',
      discount: 40,
      active: true,
      enabled: true,
      avatar: 'A'
    },
    {
      key: '5',
      name: 'Procter & Gamble',
      contactName: 'Christopher Martinez',
      email: 'christopher@gmail.com',
      contact: '(555) 333-4444',
      category: 'Consumer goods',
      cityState: 'Denver, CO',
      tier: '$',
      discount: 10,
      active: false,
      enabled: false,
      avatar: 'P'
    },
    {
      key: '6',
      name: 'Ford',
      contactName: 'Emily Davis',
      email: 'emliydavis@gmail.com',
      contact: '(555) 777-8888',
      category: 'Automotive',
      cityState: 'Nashville, TN',
      tier: '$$',
      discount: 20,
      active: true,
      enabled: true,
      avatar: 'F'
    },
    {
      key: '7',
      name: 'Levi\'s',
      contactName: 'Joshua Wilson',
      email: 'joshuawilson@gmail.com',
      contact: '(555) 222-3333',
      category: 'Apparel',
      cityState: 'Boston, MA',
      tier: '$$$',
      discount: 10,
      active: false,
      enabled: false,
      avatar: 'L'
    },
    {
      key: '8',
      name: 'Samsung',
      contactName: 'Jessica Mitchell',
      email: 'jessicamitchell@gmail.com',
      contact: '(555) 876-5432',
      category: 'Electronics',
      cityState: 'Seattle, WA',
      tier: '$$$$',
      discount: 50,
      active: true,
      enabled: true,
      avatar: 'S'
    },
    {
      key: '9',
      name: 'Under Armour',
      contactName: 'Matthew Clark',
      email: 'matthewclark@gmail.com',
      contact: '(555) 333-9999',
      category: 'Sportswear',
      cityState: 'Atlanta, GA',
      tier: '$$$',
      discount: 20,
      active: true,
      enabled: true,
      avatar: 'U'
    },
    {
      key: '10',
      name: 'PepsiCo',
      contactName: 'Amanda Taylor',
      email: 'amandataylor@gmail.com',
      contact: '(555) 654-7890',
      category: 'Beverages',
      cityState: 'Miami, FL',
      tier: '$$',
      discount: 30,
      active: true,
      enabled: true,
      avatar: 'P'
    },
    {
      key: '11',
      name: 'Kellogg\'s',
      contactName: 'Andrew Rodriguez',
      email: 'andrewrodriguez@gmail.com',
      contact: '(555) 987-1234',
      category: 'Food products',
      cityState: 'Phoenix, AZ',
      tier: '$$',
      discount: 40,
      active: true,
      enabled: true,
      avatar: 'K'
    },
    {
      key: '12',
      name: 'Pampers',
      contactName: 'Daniel Hall',
      email: 'danielhall@gmail.com',
      contact: '(555) 222-7777',
      category: 'Baby care products',
      cityState: 'New York, NY',
      tier: '$$',
      discount: 10,
      active: true,
      enabled: true,
      avatar: 'P'
    }
  ]);

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

  const columns = [
    {
      title: (
        <div className="sortable-header">
          Vendor name
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar size={32} style={{ backgroundColor: '#DB8633' }}>
            {record.avatar}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
      fixed: 'left' as const,
      width: 200,
    },
    { 
      title: 'Contact name', 
      dataIndex: 'contactName', 
      key: 'contactName', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 150 
    },
    { 
      title: 'Emails', 
      dataIndex: 'email', 
      key: 'email', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 200 
    },
    { 
      title: 'Contact number', 
      dataIndex: 'contact', 
      key: 'contact', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 150 
    },
    { 
      title: 'Category', 
      dataIndex: 'category', 
      key: 'category', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 200 
    },
    { 
      title: 'City, State', 
      dataIndex: 'cityState', 
      key: 'cityState', 
      render: (text: string) => <Text type="secondary">{text}</Text>, 
      width: 150 
    },
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      render: (text: string) => <Text strong style={{ color: '#DB8633' }}>{text}</Text>,
      width: 80,
    },
    {
      title: 'Dis',
      dataIndex: 'discount',
      key: 'discount',
      render: (text: number) => <Text strong style={{ color: '#DB8633' }}>{text}</Text>,
      width: 80,
    },
    {
      title: 'Active/De-active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: any) => (
        <div className="toggle-switch">
          <div className={`toggle ${active ? 'active' : 'inactive'}`} onClick={() => handleToggleChange(record.key, 'active')}>
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 140,
    },
    {
      title: 'Enable/Disable',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: any) => (
        <div className="enable-disable-toggle">
          <div className={`toggle ${enabled ? 'active' : 'inactive'}`} onClick={() => handleToggleChange(record.key, 'enabled')}>
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 140,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: any) => (
        <Button type="text" icon={<EditOutlined />} size="small" className="edit-action-btn" />
      ),
      width: 100,
      fixed: 'right' as const,
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Layout className="vendor-layout">
      {/* Mobile Menu Button - Right Side */}
      <Button
        className="mobile-menu-btn-right"
        icon={<MenuOutlined />}
        onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarVisible && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={() => setMobileSidebarVisible(false)}
        />
      )}

      {/* Sidebar */}
      <Sider
        className={`standard-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
        width={280}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div className="standard-logo-section">
          <div className="standard-logo-container">
            <img
              src="/white-logo.png"
              alt="THRIVE Logo"
              className="standard-logo-image"
            />
          </div>
        </div>

        <Menu
          className="standard-menu"
          mode="inline"
          defaultSelectedKeys={['vendor']}
          selectedKeys={[location.pathname === '/vendor' ? 'vendor' : '']}
          items={menuItems}
          onClick={handleMenuClick}
        />

        <div className="standard-user-profile">
          <Avatar size={40} icon={<UserOutlined />} />
          <div className="standard-user-info">
            <Text strong>Stephanie Beverage</Text>
            <Text type="secondary">Admin</Text>
          </div>
          <Button type="text" icon={<MoreOutlined />} />
        </div>
      </Sider>

      {/* Main Content */}
      <Layout className="standard-main-content">
        <Header className="vendor-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Vendors</Title>
            <Text type="secondary" className="vendors-count">300 Vendors Found</Text>
          </div>
          <div className="header-right">
            <Button 
              type="primary" 
              icon={<UserAddOutlined />}
              size="large"
              className="invite-vendor-btn"
              onClick={handleInviteVendor}
            >
              + Invite A Vendor
            </Button>
          </div>
        </Header>

        <Content className="vendor-content">
          <div className="content-wrapper">
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-section">
                <Search
                  placeholder="Search Vendors"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="vendor-search"
                />
              </div>
              
              <div className="filter-section">
                <Text strong className="filter-label">Filters</Text>
                <div className="filter-dropdowns">
                  <Select
                    placeholder="Select Category"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="technology">Technology</Option>
                    <Option value="energy">Energy</Option>
                    <Option value="healthcare">Healthcare</Option>
                    <Option value="education">Education</Option>
                  </Select>
                  
                  <Select
                    placeholder="Select Status"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                    <Option value="pending">Pending</Option>
                  </Select>
                  
                  <Select
                    placeholder="Select Location"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="san-francisco">San Francisco, CA</Option>
                    <Option value="portland">Portland, OR</Option>
                    <Option value="boston">Boston, MA</Option>
                  </Select>
                  
                  <Select
                    placeholder="Rating"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="4.5+">4.5+ Stars</Option>
                    <Option value="4.0+">4.0+ Stars</Option>
                    <Option value="3.5+">3.5+ Stars</Option>
                  </Select>
                </div>
              </div>
              

            </div>

            {/* Vendors Table */}
            <div className="vendors-table-section">
              <Table
                dataSource={vendorsData}
                columns={columns}
                pagination={false}
                size="middle"
                className="vendors-table"
                rowClassName="vendor-row"
                scroll={{ x: 1800 }}
                bordered={false}
              />
              
              {/* Pagination */}
              <div className="pagination-section">
                <Pagination
                  current={currentPage}
                  total={300}
                  pageSize={pageSize}
                  showSizeChanger={false}
                  showQuickJumper={false}
                  onChange={handlePageChange}
                  className="vendors-pagination"
                />
              </div>
            </div>
          </div>
        </Content>
      </Layout>

      {/* Invite Vendor Modal */}
      <InviteVendorModal
        visible={inviteVendorModalVisible}
        onCancel={handleInviteVendorModalCancel}
        onSubmit={handleInviteVendorModalSubmit}
      />
    </Layout>
  );
};

export default Vendor; 