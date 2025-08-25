import React, { useState } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Input, Select, Table, Pagination, Dropdown, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, UserOutlined, StarOutlined, RiseOutlined, SettingOutlined,
  CalendarOutlined, CrownOutlined, FileTextOutlined, ExclamationCircleOutlined,
  MenuOutlined, BellOutlined, SearchOutlined, MoreOutlined, UserAddOutlined,
  FilterOutlined, SortAscendingOutlined, SortDescendingOutlined, EditOutlined,
  DownOutlined, GiftOutlined, BankOutlined, TeamOutlined, GlobalOutlined
} from '@ant-design/icons';
import InviteDonorModal from './InviteDonorModal';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';
import './Donors.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Donors: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('30-days');
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleToggleChange = (key: string, field: 'active' | 'enabled') => {
    setDonorsData(prevData =>
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
    // Here you would typically fetch new data based on the selected time period
    console.log(`Time filter changed to: ${key}`);
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
    } else if (key === 'discounts') {
      navigate('/discounts');
    } else if (key === 'events') {
      navigate('/events');
    } else if (key === 'leaderboard') {
      navigate('/leaderboard');
    } else if (key === 'pending-approvals') {
      navigate('/pending-approvals');
    } else if (key === 'referral-analytics') {
      navigate('/referral-analytics');
    } else if (key === 'geographic-analytics') {
      navigate('/geographic-analytics');
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

  const [donorsData, setDonorsData] = useState([
    {
      key: '1',
      name: 'Stephanie Lewis',
      email: 'stephanielewis@gmail.com',
      contact: '(555) 123-4567',
      beneficiary: 'United Way',
      coworking: 'Yes',
      donation: '$31',
      oneTime: '$31',
      lastDonated: 'July 17, 2023',
      cityState: 'Springfield, IL',
      active: false,
      enabled: false,
      avatar: 'SL'
    },
    {
      key: '2',
      name: 'Sarah Thompson',
      email: 'sarahthompson@gmail.com',
      contact: '(555) 234-5678',
      beneficiary: 'American Red Cross',
      coworking: 'No',
      donation: '$15',
      oneTime: '$15',
      lastDonated: 'July 17, 2023',
      cityState: 'Portland, OR',
      active: true,
      enabled: true,
      avatar: 'ST'
    },
    {
      key: '3',
      name: 'David Anderson',
      email: 'davidanderson@gmail.com',
      contact: '(555) 345-6789',
      beneficiary: 'Feeding America',
      coworking: 'Yes',
      donation: '$14',
      oneTime: '$14',
      lastDonated: 'July 17, 2023',
      cityState: 'Charleston, SC',
      active: true,
      enabled: true,
      avatar: 'DA'
    },
    {
      key: '4',
      name: 'Jennifer Parker',
      email: 'jenniferparker@gmail.com',
      contact: '(555) 456-7890',
      beneficiary: 'St. Jude Children\'s Research Hospital',
      coworking: 'No',
      donation: '$36',
      oneTime: '$36',
      lastDonated: 'July 17, 2023',
      cityState: 'Austin, TX',
      active: true,
      enabled: true,
      avatar: 'JP'
    },
    {
      key: '5',
      name: 'Christopher Martinez',
      email: 'christophermartinez@gmail.com',
      contact: '(555) 567-8901',
      beneficiary: 'Habitat for Humanity',
      coworking: 'Yes',
      donation: '$44',
      oneTime: '$44',
      lastDonated: 'July 17, 2023',
      cityState: 'Denver, CO',
      active: false,
      enabled: false,
      avatar: 'CM'
    },
    {
      key: '6',
      name: 'Emily Davis',
      email: 'emilydavis@gmail.com',
      contact: '(555) 678-9012',
      beneficiary: 'Make-A-Wish Foundation',
      coworking: 'No',
      donation: '$6',
      oneTime: '$6',
      lastDonated: 'July 17, 2023',
      cityState: 'Nashville, TN',
      active: false,
      enabled: false,
      avatar: 'ED'
    },
    {
      key: '7',
      name: 'Joshua Wilson',
      email: 'joshuawilson@gmail.com',
      contact: '(555) 789-0123',
      beneficiary: 'Doctors Without Borders USA',
      coworking: 'Yes',
      donation: '$66',
      oneTime: '$66',
      lastDonated: 'July 17, 2023',
      cityState: 'Boston, MA',
      active: false,
      enabled: false,
      avatar: 'JW'
    },
    {
      key: '8',
      name: 'Jessica Mitchell',
      email: 'jessicamitchell@gmail.com',
      contact: '(555) 890-1234',
      beneficiary: 'Save the Children USA',
      coworking: 'No',
      donation: '$8',
      oneTime: '$8',
      lastDonated: 'July 17, 2023',
      cityState: 'Seattle, WA',
      active: false,
      enabled: false,
      avatar: 'JM'
    },
    {
      key: '9',
      name: 'Matthew Clark',
      email: 'matthewclark@gmail.com',
      contact: '(555) 901-2345',
      beneficiary: 'The Nature Conservancy',
      coworking: 'Yes',
      donation: '$20',
      oneTime: '$20',
      lastDonated: 'July 17, 2023',
      cityState: 'Atlanta, GA',
      active: true,
      enabled: true,
      avatar: 'MC'
    },
    {
      key: '10',
      name: 'Amanda Taylor',
      email: 'amandataylor@gmail.com',
      contact: '(555) 012-3456',
      beneficiary: 'American Cancer Society',
      coworking: 'No',
      donation: '$44',
      oneTime: '$44',
      lastDonated: 'July 17, 2023',
      cityState: 'Miami, FL',
      active: true,
      enabled: true,
      avatar: 'AT'
    },
    {
      key: '11',
      name: 'Andrew Rodriguez',
      email: 'andrewrodriguez@gmail.com',
      contact: '(555) 123-4567',
      beneficiary: 'Big Brothers Big Sisters of America',
      coworking: 'Yes',
      donation: '$30',
      oneTime: '$30',
      lastDonated: 'July 20, 2023',
      cityState: 'Phoenix, AZ',
      active: true,
      enabled: true,
      avatar: 'AR'
    },
    {
      key: '12',
      name: 'Daniel Hall',
      email: 'danielhall@gmail.com',
      contact: '(555) 234-5678',
      beneficiary: 'The Salvation Army',
      coworking: 'No',
      donation: '$45',
      oneTime: '$45',
      lastDonated: 'July 17, 2023',
      cityState: 'New York, NY',
      active: true,
      enabled: true,
      avatar: 'DH'
    },
  ]);

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
      icon: <RiseOutlined />,
      label: 'Vendor',
    },
    {
      key: 'discounts',
      icon: <GiftOutlined />,
      label: 'Discounts',
    },
    {
      key: 'tenants',
      icon: <BankOutlined />,
      label: 'Tenants',
    },
    {
      key: 'events',
      icon: <CalendarOutlined />,
      label: 'Events',
    },
    {
      key: 'leaderboard',
      icon: <CrownOutlined />,
      label: 'Leaderboard',
    },
    {
      key: 'pending-approvals',
      icon: <ExclamationCircleOutlined />,
      label: 'Pending Approvals',
    },
    {
      key: 'referral-analytics',
      icon: <TeamOutlined />,
      label: 'Referral Analytics',
    },
    {
      key: 'geographic-analytics',
      icon: <GlobalOutlined />,
      label: 'Geographic Analytics',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const columns = [
    {
      title: (
        <div className="sortable-header">
          Donor name
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
      title: 'Emails',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 250,
    },
    {
      title: 'Contact number',
      dataIndex: 'contact',
      key: 'contact',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 180,
    },
    {
      title: 'Selected beneficiary name',
      dataIndex: 'beneficiary',
      key: 'beneficiary',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 280,
    },
    {
      title: (
        <div className="sortable-header">
          Coworking
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'coworking',
      key: 'coworking',
      render: (text: string) => (
        <span className={`coworking-status ${text.toLowerCase()}`}>
          {text}
        </span>
      ),
      width: 150,
    },
    {
      title: (
        <div className="sortable-header">
          Donation
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'donation',
      key: 'donation',
      render: (text: string) => <Text strong style={{ color: '#DB8633' }}>{text}</Text>,
      width: 140,
    },
    {
      title: (
        <div className="sortable-header">
          One time gifts
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'oneTime',
      key: 'oneTime',
      render: (text: string) => <Text strong style={{ color: '#DB8633' }}>{text}</Text>,
      width: 160,
    },
    {
      title: (
        <div className="sortable-header">
          Last donated date
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'lastDonated',
      key: 'lastDonated',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 180,
    },
    {
      title: (
        <div className="sortable-header">
          City, State
          <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'cityState',
      key: 'cityState',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 160,
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
      width: 160,
    },
    {
      title: 'Enable/Disable',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: any) => (
        <div className="toggle-switch">
          <div className={`toggle ${enabled ? 'active' : 'inactive'}`} onClick={() => handleToggleChange(record.key, 'enabled')}>
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 160,
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

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  const handleInviteDonor = (values: any) => {
    // Here you would typically send the data to your backend
    console.log('Inviting donor with values:', values);
    
    // Add the new donor to the local state
    const newDonor = {
      key: (donorsData.length + 1).toString(),
      name: values.name,
      email: values.email,
      contact: values.contact,
      beneficiary: values.beneficiary,
      coworking: values.coworking,
      donation: values.donation,
      oneTime: values.oneTime,
      lastDonated: values.lastDonated || 'Never',
      cityState: values.cityState,
      active: false,
      enabled: false,
      avatar: values.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    };
    
    setDonorsData(prevData => [...prevData, newDonor]);
    
    message.success('Donor invited successfully!');
    setIsInviteModalVisible(false);
  };

  return (
    <Layout className="donors-layout">
      {/* Mobile Menu Button */}
      <div className="mobile-menu-button">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
          className="mobile-menu-trigger"
        />
      </div>

      {/* Sidebar */}
      <Sider
        width={280}
        className="standard-sider"
        breakpoint="lg"
        collapsedWidth="0"
        onCollapse={(collapsed) => setCollapsed(collapsed)}
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
          mode="inline"
          defaultSelectedKeys={['donors']}
          selectedKeys={[location.pathname === '/donors' ? 'donors' : '']}
          items={menuItems}
          className="standard-menu"
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
        <Header className="donors-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Donors</Title>
            <Text type="secondary" className="donors-count">300 Donors Found</Text>
          </div>
          <div className="header-right">
            <Button 
              type="primary" 
              icon={<UserAddOutlined />}
              size="large"
              className="invite-donor-btn"
              onClick={() => setIsInviteModalVisible(true)}
            >
              + Invite A Donor
            </Button>
          </div>
        </Header>

        <Content className="donors-content">
          <div className="content-wrapper">
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-section">
                <Search
                  placeholder="Search Donor"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="donor-search"
                />
              </div>
              
              <div className="filter-section">
                <div className="filter-dropdowns">
                  <Text strong className="filter-label">Filters</Text>
                  <Select
                    placeholder="Select Beneficiary"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="united-way">United Way</Option>
                    <Option value="red-cross">American Red Cross</Option>
                    <Option value="feeding-america">Feeding America</Option>
                  </Select>
                  
                  <Select
                    placeholder="Select Duration"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="1-week">1 Week</Option>
                    <Option value="1-month">1 Month</Option>
                    <Option value="3-months">3 Months</Option>
                    <Option value="6-months">6 Months</Option>
                  </Select>
                  
                  <Select
                    placeholder="All User"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="all">All Users</Option>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                  </Select>
                  
                  <Select
                    placeholder="City, State"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="springfield-il">Springfield, IL</Option>
                    <Option value="portland-or">Portland, OR</Option>
                    <Option value="charleston-sc">Charleston, SC</Option>
                  </Select>
                </div>
              </div>
              

            </div>

            {/* Donors Table */}
            <div className="donors-table-section">
              <Table
                dataSource={donorsData}
                columns={columns}
                pagination={false}
                size="middle"
                className="donors-table"
                rowClassName="donor-row"
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
                  className="donors-pagination"
                />
              </div>
            </div>
          </div>
        </Content>
      </Layout>
      
      {/* Invite Donor Modal */}
      <InviteDonorModal
        visible={isInviteModalVisible}
        onCancel={() => setIsInviteModalVisible(false)}
        onSubmit={handleInviteDonor}
      />
    </Layout>
  );
};

export default Donors; 