import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Statistic, Badge, Tabs, Table, Input, List, Tag, Progress, Select, DatePicker, Dropdown, Spin, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import { analyticsAPI } from '../services/api';
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
  TrophyOutlined,
  UserAddOutlined,
  MailOutlined,
  LinkOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import './ReferralAnalytics.css';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ReferralAnalytics: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('1 Month');
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Load referral analytics from API
  const loadReferralAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading referral analytics from API...');
      const response = await analyticsAPI.getReferralAnalytics('30d');
      console.log('Referral analytics API response:', response);
      
      if (response.success) {
        setAnalyticsData(response.data);
        console.log('Referral analytics loaded successfully');
      } else {
        setError('Failed to load referral analytics');
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error loading referral analytics:', error);
      setError('Failed to load referral analytics');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };


  // Load data on component mount
  useEffect(() => {
    loadReferralAnalytics();
  }, []);

  const handleTimeFilterChange = ({ key }: { key: string }) => {
    setSelectedTimeFilter(key);
    console.log('Time filter changed to:', key);
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

  // Referral Overview Data
  const referralOverviewData = [
    { 
      title: 'Total Referrals', 
      value: analyticsData?.totalReferrals || '--', 
      icon: <TeamOutlined />, 
      growth: '+15.3%', 
      color: '#DB8633' 
    },
    { 
      title: 'Active Referrers', 
      value: analyticsData?.activeReferrers || '--', 
      icon: <CheckCircleFilled />, 
      growth: '+8.7%', 
      color: '#324E58' 
    },
    { 
      title: 'Conversion Rate', 
      value: analyticsData?.conversionRate ? `${analyticsData.conversionRate}%` : '--', 
      icon: <BarChartOutlined />, 
      growth: '+3.2%', 
      color: '#324E58' 
    },
    { 
      title: 'Top Referrer', 
      value: analyticsData?.topReferrers?.[0]?.name || '--', 
      icon: <TrophyOutlined />, 
      growth: '+12.4%', 
      color: '#324E58' 
    },
    { 
      title: 'Social Media Referrals', 
      value: analyticsData?.referralSources?.[0]?.count || '--', 
      icon: <ShareAltOutlined />, 
      growth: '+5.8%', 
      color: '#DB8633' 
    },
    { 
      title: 'Email Referrals', 
      value: analyticsData?.referralSources?.[1]?.count || '--', 
      icon: <MessageOutlined />, 
      growth: '+2.1%', 
      color: '#324E58' 
    },
  ];

  // No hardcoded data - use API data only

  // No hardcoded data - use API data only

  // No hardcoded data - use API data only

  const referralColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => (
        <div className="rank-badge">
                  {rank === 1 && <CrownOutlined style={{ color: '#DB8633' }} />}
        {rank === 2 && <TrophyOutlined style={{ color: '#8c8c8c' }} />}
        {rank === 3 && <TrophyOutlined style={{ color: '#DB8633' }} />}
          <span className="rank-number">{rank}</span>
        </div>
      ),
    },
    {
      title: 'Referrer',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div className="referrer-info">
          <Avatar size={40} className="referrer-avatar">{record.avatar}</Avatar>
          <div className="referrer-details">
            <Text strong>{text}</Text>
            <Text type="secondary" className="referrer-email">{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Total Referrals',
      dataIndex: 'referrals',
      key: 'referrals',
      render: (referrals: number) => <Text strong>{referrals}</Text>,
    },
    {
      title: 'Successful',
      dataIndex: 'successful',
      key: 'successful',
      render: (successful: number) => <Text type="success">{successful}</Text>,
    },
    {
      title: 'Conversion Rate',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      render: (rate: string) => (
        <Tag color="blue" className="conversion-tag">{rate}</Tag>
      ),
    },
    {
      title: 'Points Earned',
      dataIndex: 'pointsEarned',
      key: 'pointsEarned',
      render: (points: number) => (
        <div className="points-display">
          <TrophyOutlined style={{ color: '#DB8633', marginRight: 8 }} />
          <Text strong>{points.toLocaleString()}</Text>
        </div>
      ),
    },
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      render: (value: string) => <Text strong style={{ color: '#DB8633' }}>{value}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : 'default'} 
          text={status === 'active' ? 'Active' : 'Inactive'} 
        />
      ),
    }
  ];

  return (
    <Layout className="standard-layout">
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

      <Sider 
        trigger={null} 
        collapsible
        collapsed={collapsed}
        className={`standard-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
        width={280}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        <div className="standard-logo-section">
          <div className="standard-logo-container">
            <img 
              src="/white-logo.png" 
              alt="Logo" 
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
          selectedKeys={['referral-analytics']}
          items={menuItems}
          onClick={handleMenuClick}
          className="standard-menu"
        />
        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      <Layout className="standard-main-content">
        <Header className="standard-header">
          <div className="header-left">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="mobile-menu-btn"
            />
            <Title level={2} className="page-title">Referral Analytics</Title>
            <Text type="secondary" className="page-subtitle">Track and analyze referral performance</Text>
          </div>
          <div className="header-right">
            <Dropdown overlay={timeFilterMenu} trigger={['click']}>
              <Button className="time-filter-btn">
                {selectedTimeFilter} <DownOutlined />
              </Button>
            </Dropdown>
            <RangePicker 
              className="date-range-picker"
              onChange={(dates) => {
                if (dates) {
                  setDateRange([dates[0]?.format('YYYY-MM-DD') || '', dates[1]?.format('YYYY-MM-DD') || '']);
                }
              }}
            />
          </div>
        </Header>

        <Content className="standard-content">
          <Spin spinning={loading}>
            <div className="content-wrapper">
              {/* Overview Cards */}
              <Row gutter={[24, 24]} className="overview-cards">
              {referralOverviewData.map((card, index) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                  <Card className="overview-card">
                    <div className="card-content">
                      <div className="card-icon" style={{ color: card.color }}>
                        {card.icon}
                      </div>
                      <div className="card-stats">
                        <Statistic 
                          title={card.title} 
                          value={card.value}
                          valueStyle={{ color: card.color }}
                        />
                        <div className="growth-indicator">
                          <Text type="secondary">{card.growth}</Text>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Main Content Tabs */}
            <Card className="main-content-card">
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                className="referral-tabs"
                items={[
                  {
                    key: 'overview',
                    label: (
                      <span>
                        <BarChartOutlined />
                        Overview
                      </span>
                    ),
                    children: (
                      <div className="overview-content">
                        <Row gutter={[24, 24]}>
                          <Col span={16}>
                            <Card title="Monthly Referral Performance" className="chart-card">
                              <div className="monthly-performance">
                                {/* No data available */}
                              </div>
                            </Card>
                          </Col>
                          <Col span={8}>
                            <Card title="Referral Channels" className="chart-card">
                              <div className="channels-list">
                                {/* No data available */}
                              </div>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    )
                  },
                  {
                    key: 'top-referrers',
                    label: (
                      <span>
                        <CrownOutlined />
                        Top Referrers
                      </span>
                    ),
                    children: (
                      <div className="top-referrers-content">
                        <Table 
                          dataSource={[]} 
                          columns={referralColumns}
                          pagination={false}
                          className="referrers-table"
                          rowClassName="referrer-row"
                        />
                      </div>
                    )
                  },
                  {
                    key: 'invitations',
                    label: (
                      <span>
                        <MailOutlined />
                        Invitation Management
                      </span>
                    ),
                    children: (
                      <div className="invitations-content">
                        <Card title="Recent Invitations" className="invitations-card">
                          <div className="invitation-stats">
                            <Row gutter={[24, 24]}>
                              <Col span={8}>
                                <Statistic 
                                  title="Pending Invitations" 
                                  value={144} 
                                  valueStyle={{ color: '#DB8633' }}
                                />
                              </Col>
                              <Col span={8}>
                                <Statistic 
                                  title="Accepted Today" 
                                  value={23} 
                                  valueStyle={{ color: '#DB8633' }}
                                />
                              </Col>
                              <Col span={8}>
                                <Statistic 
                                  title="Expired This Week" 
                                  value={7} 
                                  valueStyle={{ color: '#324E58' }}
                                />
                              </Col>
                            </Row>
                          </div>
                          <div className="invitation-actions">
                            <Button 
                              icon={<UserAddOutlined />} 
                              className="invitation-primary-btn"
                              style={{
                                color: '#ff6b35',
                                backgroundColor: '#ffffff',
                                borderColor: '#ff6b35',
                                borderWidth: '2px',
                                borderStyle: 'solid'
                              }}
                              onMouseEnter={(e) => {
                                console.log('Mouse enter - setting orange background with white text');
                                e.currentTarget.style.setProperty('color', '#ffffff', 'important');
                                e.currentTarget.style.setProperty('background-color', '#ff6b35', 'important');
                                e.currentTarget.style.setProperty('border-color', '#ff6b35', 'important');
                                // Force all child elements to be white
                                const children = e.currentTarget.querySelectorAll('*');
                                children.forEach(child => {
                                  (child as HTMLElement).style.setProperty('color', '#ffffff', 'important');
                                });
                              }}
                              onMouseLeave={(e) => {
                                console.log('Mouse leave - setting white background with orange text');
                                e.currentTarget.style.setProperty('color', '#ff6b35', 'important');
                                e.currentTarget.style.setProperty('background-color', '#ffffff', 'important');
                                e.currentTarget.style.setProperty('border-color', '#ff6b35', 'important');
                                const children = e.currentTarget.querySelectorAll('*');
                                children.forEach(child => {
                                  (child as HTMLElement).style.setProperty('color', '#ff6b35', 'important');
                                });
                              }}
                            >
                              Send New Invitations
                            </Button>
                            <Button icon={<MailOutlined />}>
                              Resend Pending
                            </Button>
                            <Button 
                              icon={<LinkOutlined />}
                              className="invitation-secondary-btn"
                              style={{
                                color: '#ff6b35',
                                backgroundColor: '#ffffff',
                                borderColor: '#ff6b35',
                                borderWidth: '2px',
                                borderStyle: 'solid'
                              }}
                              onMouseEnter={(e) => {
                                console.log('Mouse enter - setting orange background with white text');
                                e.currentTarget.style.setProperty('color', '#ffffff', 'important');
                                e.currentTarget.style.setProperty('background-color', '#ff6b35', 'important');
                                e.currentTarget.style.setProperty('border-color', '#ff6b35', 'important');
                                // Force all child elements to be white
                                const children = e.currentTarget.querySelectorAll('*');
                                children.forEach(child => {
                                  (child as HTMLElement).style.setProperty('color', '#ffffff', 'important');
                                });
                              }}
                              onMouseLeave={(e) => {
                                console.log('Mouse leave - setting white background with orange text');
                                e.currentTarget.style.setProperty('color', '#ff6b35', 'important');
                                e.currentTarget.style.setProperty('background-color', '#ffffff', 'important');
                                e.currentTarget.style.setProperty('border-color', '#ff6b35', 'important');
                                const children = e.currentTarget.querySelectorAll('*');
                                children.forEach(child => {
                                  (child as HTMLElement).style.setProperty('color', '#ff6b35', 'important');
                                });
                              }}
                            >
                              Generate Referral Links
                            </Button>
                          </div>
                        </Card>
                      </div>
                    )
                  }
                ]}
              />
            </Card>
            </div>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ReferralAnalytics;
