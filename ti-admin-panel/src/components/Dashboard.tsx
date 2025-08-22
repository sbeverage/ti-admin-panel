import React, { useState } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Dropdown, Button, Card, Row, Col, Statistic, Badge, Tabs, Table, Input, List, Tag } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  RiseOutlined,
  SettingOutlined,
  CalendarOutlined,
  CrownOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  MenuOutlined,
  BellOutlined,
  PictureOutlined,
  LikeOutlined,
  MessageOutlined,
  ShareAltOutlined,
  MoreOutlined,
  ShoppingOutlined,
  BankOutlined,
  GiftOutlined,
  DollarOutlined,
  CheckCircleFilled,
  DownOutlined,
  FallOutlined
} from '@ant-design/icons';
import './Dashboard.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('1 Month');
  const navigate = useNavigate();
  const location = useLocation();
  const [approvalsData, setApprovalsData] = useState([
    {
      key: '1',
      beneficiary: 'United Way',
      email: 'keitharnold@gmail...',
      cityState: 'Springfield, IL',
      cause: 'Health and Medical...',
      active: true,
      enabled: true,
    },
    {
      key: '2',
      beneficiary: 'American Red Cross',
      email: 'Jeanatchison@gm...',
      cityState: 'Portland, OR',
      cause: 'Education and Sch...',
      active: true,
      enabled: true,
    },
    {
      key: '3',
      beneficiary: 'Feeding America',
      email: 'Timbarber@gmail...',
      cityState: 'Charleston, SC',
      cause: 'Animal Welfare an...',
      active: true,
      enabled: true,
    },
    {
      key: '4',
      beneficiary: 'St. Jude Children\'s R...',
      email: 'Megbraff@gmail.c...',
      cityState: 'Austin, TX',
      cause: 'Environmental and...',
      active: true,
      enabled: true,
    },
    {
      key: '5',
      beneficiary: 'Habitat for Humanity',
      email: 'Heidiburwell@gm...',
      cityState: 'Denver, CO',
      cause: 'Hunger Relief and...',
      active: true,
      enabled: true,
    },
  ]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleTimeFilterChange = ({ key }: { key: string }) => {
    setSelectedTimeFilter(key);
    // Here you would typically fetch new data based on the selected time period
    console.log('Time filter changed to:', key);
  };

  const handleToggleChange = (key: string, field: 'active' | 'enabled') => {
    setApprovalsData(prevData => 
      prevData.map(item => 
        item.key === key 
          ? { ...item, [field]: !item[field] }
          : item
      )
    );
    
    // Here you would typically make an API call to update the backend
    console.log(`Toggled ${field} for key ${key}`);
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

  const timeFilterMenu = (
    <Menu onClick={handleTimeFilterChange}>
      <Menu.Item key="All" icon={<CheckCircleFilled style={{ color: '#DB8633' }} />}>
        All
      </Menu.Item>
      <Menu.Item key="1 Week">1 Week</Menu.Item>
      <Menu.Item key="15 Days">15 Days</Menu.Item>
      <Menu.Item key="1 Month">1 Month</Menu.Item>
      <Menu.Item key="3 Months">3 Months</Menu.Item>
      <Menu.Item key="6 Months">6 Months</Menu.Item>
      <Menu.Item key="One Year">One Year</Menu.Item>
      <Menu.Item key="Custom Date">Custom Date</Menu.Item>
    </Menu>
  );

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

  const summaryCards = [
    { title: 'Total Donors', value: 1000, icon: <UserOutlined />, growth: '+92.3' },
    { title: 'Total Vendors', value: 500, icon: <ShoppingOutlined />, growth: '+92.3' },
    { title: 'Total Tenants', value: 20, icon: <BankOutlined />, growth: '+92.3' },
    { title: 'Total Events', value: 40, icon: <CalendarOutlined />, growth: '+92.3' },
    { title: 'Total One Time Gift', value: '$3541K', icon: <GiftOutlined />, growth: '+92.3' },
    { title: 'Total Donation', value: '$1654K', icon: <DollarOutlined />, growth: '+92.3' },
  ];

  const recentApprovals = [
    {
      key: '1',
      beneficiary: 'United Way',
      email: 'keitharnold@gmail...',
      cityState: 'Springfield, IL',
      cause: 'Health and Medical...',
      active: true,
      enabled: true,
    },
    {
      key: '2',
      beneficiary: 'American Red Cross',
      email: 'Jeanatchison@gm...',
      cityState: 'Portland, OR',
      cause: 'Education and Sch...',
      active: true,
      enabled: true,
    },
    {
      key: '3',
      beneficiary: 'Feeding America',
      email: 'Timbarber@gmail...',
      cityState: 'Charleston, SC',
      cause: 'Animal Welfare an...',
      active: true,
      enabled: true,
    },
    {
      key: '4',
      beneficiary: 'St. Jude Children\'s R...',
      email: 'Megbraff@gmail.c...',
      cityState: 'Austin, TX',
      cause: 'Environmental and...',
      active: true,
      enabled: true,
    },
    {
      key: '5',
      beneficiary: 'Habitat for Humanity',
      email: 'Heidiburwell@gm...',
      cityState: 'Denver, CO',
      cause: 'Hunger Relief and...',
      active: true,
      enabled: true,
    },
  ];

  const beneficiaryColumns = [
    {
      title: 'Beneficiary name',
      dataIndex: 'beneficiary',
      key: 'beneficiary',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Emails',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'City, State',
      dataIndex: 'cityState',
      key: 'cityState',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Beneficiary cause',
      dataIndex: 'cause',
      key: 'cause',
      render: (text: string) => <Text type="secondary">{text}</Text>,
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
    },
    {
      title: 'Enable/Disable',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: any) => (
        <div className="toggle-switch">
          <div 
            className={`toggle ${enabled ? 'active' : 'inactive'}`}
            onClick={() => handleToggleChange(record.key, 'enabled')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
    },
  ];

  const vendorColumns = [
    {
      title: 'Vendor name',
      dataIndex: 'beneficiary',
      key: 'beneficiary',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Emails',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'City, State',
      dataIndex: 'cityState',
      key: 'cityState',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'Vendor type',
      dataIndex: 'cause',
      key: 'cause',
      render: (text: string) => <Text type="secondary">{text}</Text>,
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
    },
    {
      title: 'Enable/Disable',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: any) => (
        <div className="toggle-switch">
          <div 
            className={`toggle ${enabled ? 'active' : 'inactive'}`}
            onClick={() => handleToggleChange(record.key, 'enabled')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
    },
  ];

  const newsfeedItems = [
    {
      id: 1,
      brand: 'Apple Shop',
      date: '02-July-2023',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'DEALS',
      likes: 324,
      shares: 20,
    },
    {
      id: 2,
      brand: 'starbucks',
      date: '02-July-2023',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'Grocery Store',
      likes: 156,
      shares: 12,
    },
    {
      id: 3,
      brand: 'Amazon On-Site Store',
      date: '02-July-2023',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      image: 'DEALS',
      likes: 89,
      shares: 8,
    },
  ];

  const columns = [
    {
      title: 'Beneficiary name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Emails',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'City, State',
      dataIndex: 'cityState',
      key: 'cityState',
    },
    {
      title: 'Beneficiary cause',
      dataIndex: 'cause',
      key: 'cause',
    },
    {
      title: 'Active/De-active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Badge
          status={active ? 'success' : 'default'}
          text={active ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      title: 'Enable/Disable',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <Badge
          status={enabled ? 'success' : 'default'}
          text={enabled ? 'Enabled' : 'Disabled'}
        />
      ),
    },
  ];

  const toggleMobileSidebar = () => {
    setMobileSidebarVisible(!mobileSidebarVisible);
  };

  return (
    <Layout className="dashboard-layout">
      {/* Mobile Menu Button */}
      <div className="mobile-menu-button">
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={toggleMobileSidebar}
          className="mobile-menu-btn"
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarVisible && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={() => setMobileSidebarVisible(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sider
        width={280}
        className={`dashboard-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
        breakpoint="lg"
        collapsedWidth="0"
        onCollapse={(collapsed) => setCollapsed(collapsed)}
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
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[location.pathname === '/dashboard' ? 'dashboard' : '']}
          style={{ borderRight: 0 }}
          items={menuItems}
          className="dashboard-menu"
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
        <Button 
          className="mobile-menu-btn"
          icon={<MenuOutlined />}
          onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
        />
        <Header className="dashboard-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
          </div>
          <div className="header-actions">
            <Button type="text" icon={<BellOutlined />} />
            <Avatar size={32} icon={<UserOutlined />} />
          </div>
        </Header>

        <Content className="dashboard-content">
          <div className="content-wrapper">
            {/* Top Section - 3 Rows of Summary Cards */}
            <div className="summary-section">
              <div className="summary-header">
                <Typography.Title level={2} className="summary-title">Dashboard Overview</Typography.Title>
                <Dropdown
                  overlay={timeFilterMenu}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Button className="time-filter-button">
                    <CalendarOutlined />
                    <span>{selectedTimeFilter}</span>
                    <DownOutlined />
                  </Button>
                </Dropdown>
              </div>

              <Row gutter={[16, 16]} className="summary-cards">
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total Donors"
                      value={1000}
                      prefix={<UserOutlined style={{ color: '#DB8633' }} />}
                      suffix={
                        <div className="stat-status">
                          <div className="status-pill positive">
                            <RiseOutlined />
                            <span>+92.3%</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total Vendors"
                      value={500}
                      prefix={<ShoppingOutlined style={{ color: '#DB8633' }} />}
                      suffix={
                        <div className="stat-status">
                          <div className="status-pill positive">
                            <RiseOutlined />
                            <span>+45.2%</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total Tenants"
                      value={20}
                      prefix={<BankOutlined style={{ color: '#DB8633' }} />}
                      suffix={
                        <div className="stat-status">
                          <div className="status-pill negative">
                            <FallOutlined />
                            <span>-8.1%</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="summary-cards">
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total Events"
                      value={40}
                      prefix={<CalendarOutlined style={{ color: '#DB8633' }} />}
                      suffix={
                        <div className="stat-status">
                          <div className="status-pill positive">
                            <RiseOutlined />
                            <span>+67.8%</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total One Time Gift"
                      value="$3541K"
                      prefix={<GiftOutlined style={{ color: '#DB8633' }} />}
                      suffix={
                        <div className="stat-status">
                          <div className="status-pill positive">
                            <RiseOutlined />
                            <span>+123.4%</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total Donation"
                      value="$1654K"
                      prefix={<DollarOutlined style={{ color: '#DB8633' }} />}
                      suffix={
                        <div className="stat-status">
                          <div className="status-pill positive">
                            <RiseOutlined />
                            <span>+89.2%</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="summary-cards">
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Active Donors"
                      value={200}
                      prefix={<UserOutlined style={{ color: '#DB8633' }} />}
                      suffix={
                        <div className="stat-status">
                          <div className="status-pill positive">
                            <RiseOutlined />
                            <span>+15.2%</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Pending Approvals"
                      value={12}
                      prefix={<ExclamationCircleOutlined style={{ color: '#DB8633' }} />}
                      suffix={
                        <div className="stat-status">
                          <div className="status-pill negative">
                            <FallOutlined />
                            <span>-23.4%</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={8}>
                  <Card className="summary-card">
                    <Statistic
                      title="Total Revenue"
                      value="$5195K"
                      prefix={<DollarOutlined style={{ color: '#DB8633' }} />}
                      suffix={
                        <div className="stat-status">
                          <div className="status-pill positive">
                            <RiseOutlined />
                            <span>+87.4%</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              </Row>
            </div>

            {/* Bottom Section - 3 Rows with Newsfeed on Right */}
            <Row gutter={[24, 24]} className="bottom-section">
              {/* Left Side - Charts and Tables */}
              <Col xs={24} lg={16}>
                <Row gutter={[0, 24]}>
                  {/* Charts Row */}
                  <Col span={24}>
                    <div className="insights-header">
                      <Typography.Title level={2}>Insights</Typography.Title>
                    </div>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <Card className="chart-card">
                          <div className="chart-header">
                            <div className="chart-title">Breakdown of Donors</div>
                            <Dropdown
                              overlay={timeFilterMenu}
                              trigger={['click']}
                              placement="bottomRight"
                            >
                              <Button className="chart-filter-button">
                                <CalendarOutlined />
                                <span>This Month</span>
                                <DownOutlined />
                              </Button>
                            </Dropdown>
                          </div>
                          <div className="chart-content">
                            <div className="chart-total">
                              <span className="total-number">1000</span>
                              <span className="total-label">Total Donors</span>
                            </div>
                            <div className="donut-chart"></div>
                            <div className="chart-legend">
                              <div className="legend-item">
                                <span className="legend-color active"></span>
                                <span>200 Active Donors</span>
                              </div>
                              <div className="legend-item">
                                <span className="legend-color inactive"></span>
                                <span>400 In-Active Donors</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card className="chart-card">
                          <div className="chart-header">
                            <div className="chart-title">Donations</div>
                            <Dropdown
                              overlay={timeFilterMenu}
                              trigger={['click']}
                              placement="bottomRight"
                            >
                              <Button className="chart-filter-button">
                                <CalendarOutlined />
                                <span>This Month</span>
                                <DownOutlined />
                              </Button>
                            </Dropdown>
                          </div>
                          <div className="chart-content">
                            <div className="chart-total">
                              <span className="total-number">$2,500</span>
                              <span className="total-label">Total Donations</span>
                            </div>
                            <div className="line-chart">
                              <div className="chart-y-axis">
                                <span>$1000</span>
                                <span>$750</span>
                                <span>$500</span>
                                <span>$250</span>
                                <span>$0</span>
                              </div>
                              <div className="chart-line"></div>
                              <div className="chart-x-axis">
                                <span>Week 1</span>
                                <span>Week 2</span>
                                <span>Week 3</span>
                                <span>Week 4</span>
                                <span>Week 5</span>
                              </div>
                            </div>
                            <div className="chart-legend">
                              <div className="legend-item">
                                <span className="legend-color active"></span>
                                <span>Average: $500/week</span>
                              </div>
                              <div className="legend-item">
                                <span className="legend-color inactive"></span>
                                <span>Trend: +12.5% vs last month</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </Col>

                  {/* Recent Approvals */}
                  <Col span={24}>
                    <Card className="approvals-card">
                      <div className="tab-header">
                        <Typography.Title level={2}>Recent Approvals</Typography.Title>
                        <Typography.Link href="#" className="view-all-link">
                          View all Beneficiaries
                        </Typography.Link>
                      </div>
                      <Tabs defaultActiveKey="beneficiaries" className="approvals-tabs">
                        <TabPane tab="Beneficiaries" key="beneficiaries">
                          <Table
                            dataSource={approvalsData}
                            columns={beneficiaryColumns}
                            pagination={false}
                            size="small"
                            className="approvals-table"
                          />
                        </TabPane>
                        <TabPane tab="Vendors" key="vendors">
                          <Table
                            dataSource={approvalsData}
                            columns={vendorColumns}
                            pagination={false}
                            size="small"
                            className="approvals-table"
                          />
                        </TabPane>
                      </Tabs>
                    </Card>
                  </Col>
                </Row>
              </Col>

              {/* Right Side - Newsfeed */}
              <Col xs={24} lg={8}>
                <Card className="newsfeed-card">
                  <Typography.Title level={4}>Newsfeed</Typography.Title>

                  <div className="newsfeed-input">
                    <Input
                      placeholder="What's on your mind?"
                      prefix={<PictureOutlined />}
                      size="large"
                    />
                  </div>

                  <div className="newsfeed-list">
                    {newsfeedItems.map((item, index) => (
                      <div key={index} className="newsfeed-item">
                        <div className="newsfeed-header">
                          <Space>
                            <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=AppleShop" size={32}>
                              A
                            </Avatar>
                            <div>
                              <Typography.Text strong>{item.brand}</Typography.Text>
                              <br />
                              <Typography.Text type="secondary" className="newsfeed-date">
                                {item.date}
                              </Typography.Text>
                            </div>
                          </Space>
                          <Button type="text" icon={<MoreOutlined />} />
                        </div>

                        <Typography.Text className="newsfeed-description">
                          {item.description}
                          <a href="#" className="read-more"> Read more</a>
                        </Typography.Text>

                        {item.image && (
                          <div className="newsfeed-image">
                            <div className="image-placeholder">
                              📸 {item.image}
                            </div>
                          </div>
                        )}

                        <div className="newsfeed-actions">
                          <Button type="text" icon={<LikeOutlined />} size="small">
                            {item.likes} Likes
                          </Button>
                          <Button type="text" icon={<MessageOutlined />} size="small">
                            Comment
                          </Button>
                          <Button type="text" icon={<ShareAltOutlined />} size="small">
                            {item.shares} Shares
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarVisible && (
        <div className="mobile-sidebar-overlay" onClick={toggleMobileSidebar} />
      )}
    </Layout>
  );
};

export default Dashboard; 