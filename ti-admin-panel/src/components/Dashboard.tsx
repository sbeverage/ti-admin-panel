import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Dropdown, Button, Card, Row, Col, Statistic, Badge, Tabs, Table, Input, List, Tag, Spin, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import { dashboardAPI } from '../services/api';
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
  FallOutlined,
  TeamOutlined,
  GlobalOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import './Dashboard.css';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;


const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('1 Month');
  const [activeApprovalTab, setActiveApprovalTab] = useState('beneficiaries');
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load dashboard data from API
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Loading dashboard data from API...');
      
      // Import API functions
      const { vendorAPI, donorAPI, beneficiaryAPI, tenantAPI } = await import('../services/api');
      
      // Load counts from all endpoints in parallel
      const [vendorsResponse, donorsResponse, beneficiariesResponse, tenantsResponse] = await Promise.all([
        vendorAPI.getVendors(1, 1).catch(() => ({ success: false, data: [], pagination: { total: 0 } })),
        donorAPI.getDonors(1, 1).catch(() => ({ success: false, data: [], pagination: { total: 0 } })),
        beneficiaryAPI.getBeneficiaries(1, 1).catch(() => ({ success: false, data: [], pagination: { total: 0 } })),
        tenantAPI.getTenants(1, 1).catch(() => ({ success: false, data: [], pagination: { total: 0 } }))
      ]);
      
      console.log('📊 Dashboard responses:', {
        vendors: vendorsResponse,
        donors: donorsResponse,
        beneficiaries: beneficiariesResponse,
        tenants: tenantsResponse
      });
      
      // Calculate stats from actual data
      const stats = {
        totalVendors: vendorsResponse.pagination?.total || 0,
        totalDonors: donorsResponse.pagination?.total || 0,
        totalBeneficiaries: beneficiariesResponse.pagination?.total || 0,
        totalTenants: tenantsResponse.pagination?.total || 0,
        totalRevenue: 0, // Would need a separate endpoint
        pendingApprovals: 0, // Would need a separate endpoint
        activeDiscounts: 0, // Would need a separate endpoint
        upcomingEvents: 0 // Would need a separate endpoint
      };
      
      console.log('📊 Calculated dashboard stats:', stats);
      setDashboardStats(stats);
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      setDashboardStats({
        totalVendors: 0,
        totalDonors: 0,
        totalBeneficiaries: 0,
        totalTenants: 0,
        totalRevenue: 0,
        pendingApprovals: 0,
        activeDiscounts: 0,
        upcomingEvents: 0
      });
    } finally {
      setLoading(false);
    }
  };


  // Load data on component mount and when navigating back to dashboard
  useEffect(() => {
    loadDashboardData();
  }, []); // Initial load
  
  // Refresh dashboard data when the page becomes visible (e.g., after creating a vendor)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📊 Dashboard visible - refreshing data...');
        loadDashboardData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const [approvalsData, setApprovalsData] = useState<any[]>([]);

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

  const handleViewAllBeneficiaries = () => {
    setActiveApprovalTab('beneficiaries');
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

  const summaryCards = [
    { 
      title: 'Total Donors', 
      value: dashboardStats?.totalDonors || '--', 
      icon: <UserOutlined />, 
      growth: '+92.3' 
    },
    { 
      title: 'Total Vendors', 
      value: dashboardStats?.totalVendors || '--', 
      icon: <ShoppingOutlined />, 
      growth: '+92.3' 
    },
    { 
      title: 'Total Beneficiaries', 
      value: dashboardStats?.totalBeneficiaries || '--', 
      icon: <StarOutlined />, 
      growth: '+92.3' 
    },
    { 
      title: 'Active Users', 
      value: dashboardStats?.activeUsers || '--', 
      icon: <TeamOutlined />, 
      growth: '+92.3' 
    },
    { 
      title: 'Monthly Donations', 
      value: dashboardStats?.monthlyDonations ? `$${(dashboardStats.monthlyDonations / 1000).toFixed(0)}K` : '--', 
      icon: <GiftOutlined />, 
      growth: '+92.3' 
    },
    { 
      title: 'Total Donations', 
      value: dashboardStats?.totalDonations ? `$${(dashboardStats.totalDonations / 1000).toFixed(0)}K` : '--', 
      icon: <DollarOutlined />, 
      growth: '+92.3' 
    },
  ];

  const recentApprovals: any[] = [];

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

  const newsfeedItems: any[] = [];

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
    <Layout className="donors-layout">
      {/* Mobile Menu Button - Right Side */}
      <Button
        className="mobile-menu-btn-right"
        icon={<MenuOutlined />}
        onClick={toggleMobileSidebar}
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
        width={280}
        className={`standard-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
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
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[location.pathname === '/dashboard' ? 'dashboard' : '']}
          items={menuItems}
          className="standard-menu"
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      {/* Main Content */}
      <Layout className="standard-main-content">
        <Header className="dashboard-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
            {dashboardStats && (
              <Text type="secondary" style={{ marginLeft: 16 }}>
                {dashboardStats.totalVendors} Vendors • {dashboardStats.totalDonors} Donors • {dashboardStats.totalBeneficiaries} Beneficiaries
              </Text>
            )}
          </div>
          <div className="header-actions">
            <Button 
              type="text" 
              icon={<ReloadOutlined spin={loading} />}
              onClick={() => {
                message.info('Refreshing dashboard...');
                loadDashboardData();
              }}
              title="Refresh Dashboard"
            >
              Refresh
            </Button>
            <Button type="text" icon={<BellOutlined />} />
            <Avatar size={32} icon={<UserOutlined />} />
          </div>
        </Header>

        <Content className="dashboard-content">
          <Spin spinning={loading}>
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
                      value={dashboardStats?.totalDonors || '--'}
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
                      value={dashboardStats?.totalVendors || '--'}
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
                      value={dashboardStats?.totalTenants || '--'}
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
                      value={dashboardStats?.totalEvents || '--'}
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
                      value={dashboardStats?.totalOneTimeGift ? `$${(dashboardStats.totalOneTimeGift / 1000).toFixed(0)}K` : '--'}
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
                      value={dashboardStats?.totalDonations ? `$${(dashboardStats.totalDonations / 1000).toFixed(0)}K` : '--'}
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
                      value={dashboardStats?.activeDonors || '--'}
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
                      value={dashboardStats?.pendingApprovals || '--'}
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
                      value={dashboardStats?.totalRevenue ? `$${(dashboardStats.totalRevenue / 1000).toFixed(0)}K` : '--'}
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

                        {/* Bottom Section - Charts and Newsfeed */}
            <Row gutter={[24, 24]} className="bottom-section">
              {/* Left Side - Charts Only */}
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
                              <span className="total-number">{dashboardStats?.totalDonors || '--'}</span>
                              <span className="total-label">Total Donors</span>
                            </div>
                            <div className="donut-chart"></div>
                            <div className="chart-legend">
                              <div className="legend-item">
                                <span className="legend-color active"></span>
                                <span>{dashboardStats?.activeDonors || '--'} Active Donors</span>
                              </div>
                              <div className="legend-item">
                                <span className="legend-color inactive"></span>
                                <span>{(dashboardStats?.totalDonors || 0) - (dashboardStats?.activeDonors || 0)} In-Active Donors</span>
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
                              <span className="total-number">{dashboardStats?.totalDonations ? `$${dashboardStats.totalDonations.toLocaleString()}` : '--'}</span>
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

            {/* Recent Approvals - Full Width Section */}
            <Row className="approvals-section">
              <Col span={24}>
                <Card className="approvals-card">
                  <div className="tab-header">
                    <Typography.Title level={2}>Recent Approvals</Typography.Title>
                    <Typography.Link onClick={handleViewAllBeneficiaries} className="view-all-link">
                      View all Beneficiaries
                    </Typography.Link>
                  </div>
                  <Tabs 
                    activeKey={activeApprovalTab} 
                    onChange={setActiveApprovalTab} 
                    className="approvals-tabs"
                    style={{
                      '--ant-tabs-ink-bar-color': 'transparent',
                    } as React.CSSProperties}
                    tabBarStyle={{
                      marginBottom: '24px',
                    }}
                    items={[
                      {
                        key: 'beneficiaries',
                        label: 'Beneficiaries',
                        children: (
                          <Table
                            dataSource={approvalsData}
                            columns={beneficiaryColumns}
                            pagination={false}
                            size="small"
                            className="approvals-table"
                          />
                        )
                      },
                      {
                        key: 'vendors', 
                        label: 'Vendors',
                        children: (
                          <Table
                            dataSource={approvalsData}
                            columns={vendorColumns}
                            pagination={false}
                            size="small"
                            className="approvals-table"
                          />
                        )
                      }
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          </Spin>
        </Content>
      </Layout>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarVisible && (
        <div className="mobile-sidebar-overlay" onClick={toggleMobileSidebar} />
      )}
    </Layout>
  );
};

export default Dashboard; // Dashboard update: Tue Oct 21 09:59:30 EDT 2025
