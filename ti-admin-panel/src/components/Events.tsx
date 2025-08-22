import React, { useState } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Input, Select, Table, Pagination, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, UserOutlined, StarOutlined, RiseOutlined, SettingOutlined,
  CalendarOutlined, CrownOutlined, FileTextOutlined, ExclamationCircleOutlined,
  MenuOutlined, BellOutlined, SearchOutlined, MoreOutlined, UserAddOutlined,
  FilterOutlined, SortAscendingOutlined, SortDescendingOutlined, EditOutlined,
  DownOutlined, ShopOutlined, GiftOutlined, BankOutlined
} from '@ant-design/icons';
import './Events.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Events: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('30-days');
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleTimeFilterChange = (key: string) => {
    setSelectedTimeFilter(key);
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

  const [eventsData, setEventsData] = useState([
    {
      key: '1',
      eventName: 'Community Cleanup Drive',
      beneficiaryName: 'United Way',
      date: '2023-10-26',
      days: 1,
      serviceHours: 8,
      volunteers: 25,
      avatar: 'UW'
    },
    {
      key: '2',
      eventName: 'Blood Donation Camp',
      beneficiaryName: 'American Red Cross',
      date: '2023-11-15',
      days: 1,
      serviceHours: 6,
      volunteers: 50,
      avatar: 'ARC'
    },
    {
      key: '3',
      eventName: 'Food Distribution Event',
      beneficiaryName: 'Feeding America',
      date: '2023-12-01',
      days: 2,
      serviceHours: 16,
      volunteers: 30,
      avatar: 'FA'
    },
    {
      key: '4',
      eventName: 'Children\'s Hospital Visit',
      beneficiaryName: 'St. Jude Children\'s R.',
      date: '2024-01-10',
      days: 1,
      serviceHours: 4,
      volunteers: 15,
      avatar: 'SJ'
    },
    {
      key: '5',
      eventName: 'Home Building Project',
      beneficiaryName: 'Habitat for Humanity',
      date: '2024-02-20',
      days: 5,
      serviceHours: 40,
      volunteers: 10,
      avatar: 'HH'
    },
    {
      key: '6',
      eventName: 'Environmental Awareness Workshop',
      beneficiaryName: 'United Way',
      date: '2024-03-05',
      days: 1,
      serviceHours: 7,
      volunteers: 20,
      avatar: 'UW'
    },
    {
      key: '7',
      eventName: 'Disaster Relief Training',
      beneficiaryName: 'American Red Cross',
      date: '2024-04-12',
      days: 3,
      serviceHours: 24,
      volunteers: 40,
      avatar: 'ARC'
    },
    {
      key: '8',
      eventName: 'Soup Kitchen Service',
      beneficiaryName: 'Feeding America',
      date: '2024-05-01',
      days: 1,
      serviceHours: 5,
      volunteers: 25,
      avatar: 'FA'
    },
    {
      key: '9',
      eventName: 'Pediatric Cancer Fundraiser',
      beneficiaryName: 'St. Jude Children\'s R.',
      date: '2024-06-18',
      days: 1,
      serviceHours: 8,
      volunteers: 35,
      avatar: 'SJ'
    },
    {
      key: '10',
      eventName: 'Community Garden Setup',
      beneficiaryName: 'Habitat for Humanity',
      date: '2024-07-01',
      days: 2,
      serviceHours: 14,
      volunteers: 18,
      avatar: 'HH'
    },
    {
      key: '11',
      eventName: 'Youth Mentorship Program',
      beneficiaryName: 'United Way',
      date: '2024-08-10',
      days: 1,
      serviceHours: 6,
      volunteers: 12,
      avatar: 'UW'
    },
    {
      key: '12',
      eventName: 'First Aid Certification Course',
      beneficiaryName: 'American Red Cross',
      date: '2024-09-22',
      days: 2,
      serviceHours: 16,
      volunteers: 28,
      avatar: 'ARC'
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
      key: 'feeds',
      icon: <FileTextOutlined />,
      label: 'Feeds',
      children: [
        {
          key: 'newsfeed',
          label: 'Newsfeed',
        },
        {
          key: 'ads-management',
          label: 'Ads Management',
        },
      ],
    },
    {
      key: 'pending-approvals',
      icon: <ExclamationCircleOutlined />,
      label: 'Pending Approvals',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const columns = [
    {
      title: 'Event Name',
      dataIndex: 'eventName',
      key: 'eventName',
      render: (text: string, record: any) => (
        <Space>
          <Avatar size={32} style={{ backgroundColor: '#DB8633' }}>
            {record.avatar}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
      width: 250,
    },
    {
      title: 'Beneficiary Name',
      dataIndex: 'beneficiaryName',
      key: 'beneficiaryName',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 200,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 150,
    },
    {
      title: (
        <div className="sortable-header">
          Days <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'days',
      key: 'days',
      render: (text: number) => <Text type="secondary">{text}</Text>,
      width: 100,
    },
    {
      title: (
        <div className="sortable-header">
          Services Hours <SortAscendingOutlined className="sort-icon" />
        </div>
      ),
      dataIndex: 'serviceHours',
      key: 'serviceHours',
      render: (text: number) => <Text type="secondary">{text}</Text>,
      width: 150,
    },
    {
      title: 'Volunteers',
      dataIndex: 'volunteers',
      key: 'volunteers',
      render: (text: number) => <Text type="secondary">{text}</Text>,
      width: 120,
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    console.log('Search:', value);
  };

  const handleBeneficiaryChange = (value: string) => {
    console.log('Beneficiary changed:', value);
  };

  const handleDurationChange = (value: string) => {
    console.log('Duration changed:', value);
  };

  return (
    <Layout className="events-layout">
      {/* Mobile Menu Button */}
      <Button
        className="mobile-menu-btn"
        icon={<MenuOutlined />}
        onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      {/* Sidebar */}
      <Sider
        className="events-sider"
        width={280}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div className="logo-section">
          <div className="logo-container">
            <img
              src="/white-logo.png"
              alt="Thrive Initiative Logo"
              className="logo-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="logo-fallback" style={{ display: 'none' }}>
              <div className="fallback-icon">🐷</div>
            </div>
          </div>
          <div className="brand-name">THRIVE INITIATIVE</div>
        </div>

        <Menu
          mode="inline"
          defaultSelectedKeys={['events']}
          selectedKeys={[location.pathname === '/events' ? 'events' : '']}
          style={{ borderRight: 0 }}
          items={menuItems}
          className="events-menu"
          onClick={handleMenuClick}
        />

        <div className="user-profile">
          <Avatar size={40} icon={<UserOutlined />} />
          <div className="user-info">
            <Text strong>Stephanie Beverage</Text>
          </div>
          <Button type="text" icon={<MoreOutlined />} />
        </div>
      </Sider>

      {/* Main Content */}
      <Layout className="main-content">
        <Header className="events-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Events</Title>
            <Text type="secondary" className="events-count">500 Events Found</Text>
          </div>
        </Header>

        <Content className="events-content">
          <div className="content-wrapper">
            {/* Search and Filter Section */}
            <div className="search-filter-section">
              <div className="search-section">
                <Search
                  placeholder="Search Event Name"
                  allowClear
                  onSearch={handleSearch}
                  style={{ width: 400 }}
                  className="event-search"
                />
              </div>
              <div className="filter-section">
                <Text strong className="filter-label">Filters</Text>
                <div className="filter-dropdowns">
                  <Dropdown overlay={
                    <Menu onClick={({ key }) => handleBeneficiaryChange(key)}>
                      <Menu.Item key="All">All</Menu.Item>
                      <Menu.Item key="United Way">United Way</Menu.Item>
                      <Menu.Item key="American Red Cross">American Red Cross</Menu.Item>
                      <Menu.Item key="Feeding America">Feeding America</Menu.Item>
                      <Menu.Item key="St. Jude Children's R.">St. Jude Children's R.</Menu.Item>
                      <Menu.Item key="Habitat for Humanity">Habitat for Humanity</Menu.Item>
                    </Menu>
                  } trigger={['click']}>
                    <Button>
                      Select Beneficiary <DownOutlined />
                    </Button>
                  </Dropdown>
                  <Dropdown overlay={
                    <Menu onClick={({ key }) => handleDurationChange(key)}>
                      <Menu.Item key="All">All</Menu.Item>
                      <Menu.Item key="1 Day">1 Day</Menu.Item>
                      <Menu.Item key="2 Days">2 Days</Menu.Item>
                      <Menu.Item key="3 Days">3 Days</Menu.Item>
                      <Menu.Item key="1 Week">1 Week</Menu.Item>
                      <Menu.Item key="1 Month">1 Month</Menu.Item>
                    </Menu>
                  } trigger={['click']}>
                    <Button>
                      Select Duration <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
              </div>
            </div>

            {/* Events Table */}
            <div className="events-table-section">
              <Table
                columns={columns}
                dataSource={eventsData}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: 500, // Assuming 500 total events for pagination
                  onChange: handlePageChange,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '12', '20', '50'],
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                }}
                scroll={{ x: 'max-content' }}
                className="events-table"
              />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Events; 