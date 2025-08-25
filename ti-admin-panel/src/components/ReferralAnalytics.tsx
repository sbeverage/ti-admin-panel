import React, { useState } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Statistic, Badge, Tabs, Table, Input, List, Tag, Progress, Select, DatePicker, Dropdown } from 'antd';
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
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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

  // Referral Overview Data
  const referralOverviewData = [
    { title: 'Total Referrals', value: 1, icon: <TeamOutlined />, growth: '+15.3%', color: '#DB8633' },
    { title: 'Successful Referrals', value: 856, icon: <CheckCircleFilled />, growth: '+8.7%', color: '#324E58' },
    { title: 'Pending Referrals', value: 144, icon: <ExclamationCircleOutlined />, growth: '-2.1%', color: '#DB8633' },
    { title: 'Referral Conversion Rate', value: '85.6%', icon: <BarChartOutlined />, growth: '+3.2%', color: '#324E58' },
    { title: 'Total Points Awarded', value: '12,450', icon: <TrophyOutlined />, growth: '+12.4%', color: '#324E58' },
    { title: 'Average Referral Value', value: '$45.20', icon: <DollarOutlined />, growth: '+5.8%', color: '#DB8633' },
  ];

  // Top Referrers Data
  const topReferrersData = [
    {
      key: '1',
      rank: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@gmail.com',
      referrals: 47,
      successful: 42,
      conversionRate: '89.4%',
      pointsEarned: 2847,
      totalValue: '$1,890',
      avatar: 'SJ',
      status: 'active'
    },
    {
      key: '2',
      rank: 2,
      name: 'Michael Chen',
      email: 'michael.chen@gmail.com',
      referrals: 38,
      successful: 34,
      conversionRate: '89.5%',
      pointsEarned: 2654,
      totalValue: '$1,536',
      avatar: 'MC',
      status: 'active'
    },
    {
      key: '3',
      rank: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@gmail.com',
      referrals: 32,
      successful: 28,
      conversionRate: '87.5%',
      pointsEarned: 2489,
      totalValue: '$1,264',
      avatar: 'ER',
      status: 'active'
    },
    {
      key: '4',
      rank: 4,
      name: 'David Wilson',
      email: 'david.wilson@gmail.com',
      referrals: 28,
      successful: 24,
      conversionRate: '85.7%',
      pointsEarned: 2156,
      totalValue: '$1,089',
      avatar: 'DW',
      status: 'active'
    },
    {
      key: '5',
      rank: 5,
      name: 'Lisa Thompson',
      email: 'lisa.thompson@gmail.com',
      referrals: 25,
      successful: 21,
      conversionRate: '84.0%',
      pointsEarned: 1987,
      totalValue: '$945',
      avatar: 'LT',
      status: 'active'
    }
  ];

  // Referral Channels Data
  const referralChannelsData = [
    { channel: 'Email Invitations', referrals: 456, conversion: 78.2, color: '#324E58' },
    { channel: 'Social Media', referrals: 234, conversion: 65.4, color: '#DB8633' },
    { channel: 'Direct Links', referrals: 189, conversion: 82.1, color: '#324E58' },
    { channel: 'QR Codes', referrals: 156, conversion: 71.8, color: '#DB8633' },
    { channel: 'Word of Mouth', referrals: 98, conversion: 89.3, color: '#324E58' },
    { channel: 'Business Cards', referrals: 67, conversion: 58.2, color: '#DB8633' }
  ];

  // Referral Performance by Month
  const monthlyPerformanceData = [
    { month: 'Jan', referrals: 89, successful: 76, conversion: 85.4 },
    { month: 'Feb', referrals: 92, successful: 79, conversion: 85.9 },
    { month: 'Mar', referrals: 87, successful: 74, conversion: 85.1 },
    { month: 'Apr', referrals: 95, successful: 82, conversion: 86.3 },
    { month: 'May', referrals: 103, successful: 89, conversion: 86.4 },
    { month: 'Jun', referrals: 98, successful: 84, conversion: 85.7 },
    { month: 'Jul', referrals: 112, successful: 97, conversion: 86.6 },
    { month: 'Aug', referrals: 108, successful: 93, conversion: 86.1 },
    { month: 'Sep', referrals: 115, successful: 99, conversion: 86.1 },
    { month: 'Oct', referrals: 121, successful: 105, conversion: 86.8 },
    { month: 'Nov', referrals: 118, successful: 102, conversion: 86.4 },
    { month: 'Dec', referrals: 125, successful: 108, conversion: 86.4 }
  ];

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
      {/* Mobile Menu Button */}
      <Button
        className="mobile-menu-btn"
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
        <div className="standard-user-profile">
          <Avatar size={40} icon={<UserOutlined />} />
          <div className="standard-user-info">
            <Text strong>Stephanie Beverage</Text>
            <Text type="secondary">Admin</Text>
          </div>
          <Button type="text" icon={<MoreOutlined />} />
        </div>
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
                                {monthlyPerformanceData.map((item, index) => (
                                  <div key={index} className="month-item">
                                    <div className="month-header">
                                      <Text strong>{item.month}</Text>
                                      <Text type="secondary">{item.referrals} referrals</Text>
                                    </div>
                                    <Progress 
                                      percent={item.conversion} 
                                      size="small"
                                      strokeColor="#324E58"
                                      showInfo={false}
                                    />
                                    <Text type="secondary">{item.successful} successful</Text>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          </Col>
                          <Col span={8}>
                            <Card title="Referral Channels" className="chart-card">
                              <div className="channels-list">
                                {referralChannelsData.map((channel, index) => (
                                  <div key={index} className="channel-item">
                                    <div className="channel-info">
                                      <div className="channel-color" style={{ backgroundColor: channel.color }}></div>
                                      <Text>{channel.channel}</Text>
                                    </div>
                                    <div className="channel-stats">
                                      <Text strong>{channel.referrals}</Text>
                                      <Text type="secondary">{channel.conversion}%</Text>
                                    </div>
                                  </div>
                                ))}
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
                          dataSource={topReferrersData} 
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
                            <Button type="primary" icon={<UserAddOutlined />}>
                              Send New Invitations
                            </Button>
                            <Button icon={<MailOutlined />}>
                              Resend Pending
                            </Button>
                            <Button icon={<LinkOutlined />}>
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default ReferralAnalytics;
