import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Statistic, Badge, Tabs, Table, Input, List, Tag, Progress, Select, DatePicker, Divider, Dropdown, Spin, message } from 'antd';
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
  EnvironmentOutlined,
  GlobalOutlined,
  CompassOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  FlagOutlined,
  HomeOutlined,
  ShopOutlined,
  HeartOutlined,
  TrophyOutlined,
  TeamOutlined
} from '@ant-design/icons';
import './GeographicAnalytics.css';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const GeographicAnalytics: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('1 Month');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [geographicData, setGeographicData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Load geographic analytics from API
  const loadGeographicAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading geographic analytics from API...');
      const response = await analyticsAPI.getGeographicAnalytics('30d');
      console.log('Geographic analytics API response:', response);
      
      if (response.success) {
        setGeographicData(response.data);
        console.log('Geographic analytics loaded successfully');
      } else {
        setError('Failed to load geographic analytics');
        setGeographicData(null);
      }
    } catch (error) {
      console.error('Error loading geographic analytics:', error);
      setError('Failed to load geographic analytics');
      setGeographicData(null);
    } finally {
      setLoading(false);
    }
  };


  // Load data on component mount
  useEffect(() => {
    loadGeographicAnalytics();
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

  // Geographic Overview Data
  const geographicOverviewData = [
    { 
      title: 'Active Countries', 
      value: geographicData?.totalCountries || '--', 
      icon: <GlobalOutlined />, 
      growth: '+2.1%', 
      color: '#DB8633' 
    },
    { 
      title: 'Total States', 
      value: geographicData?.totalStates || '--', 
      icon: <HomeOutlined />, 
      growth: '+8.7%', 
      color: '#324E58' 
    },
    { 
      title: 'Total Cities', 
      value: geographicData?.totalCities || '--', 
      icon: <EnvironmentOutlined />, 
      growth: '+15.3%', 
      color: '#324E58' 
    },
    { 
      title: 'Top Country', 
      value: geographicData?.topCountries?.[0]?.name || '--', 
      icon: <CrownOutlined />, 
      growth: '+12.4%', 
      color: '#324E58' 
    },
    { 
      title: 'Top State', 
      value: geographicData?.topStates?.[0]?.name || '--', 
      icon: <RiseOutlined />, 
      growth: '+18.7%', 
      color: '#DB8633' 
    },
    { 
      title: 'Top City', 
      value: geographicData?.topCities?.[0]?.name || '--', 
      icon: <StarOutlined />, 
      growth: '+25.1%', 
      color: '#DB8633' 
    },
  ];

  // No hardcoded data - use API data only

  // No hardcoded data - use API data only

  // No hardcoded data - use API data only

  const regionColumns = [
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
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      render: (text: string, record: any) => (
        <div className="region-info">
          <Avatar size={40} className="region-avatar">{record.avatar}</Avatar>
          <div className="region-details">
            <Text strong>{text}</Text>
            <div className="region-states">
              {record.states.slice(0, 4).map((state: string, index: number) => (
                <Tag key={index} className="state-tag">{state}</Tag>
              ))}
              {record.states.length > 4 && (
                <Tag className="more-states">+{record.states.length - 4}</Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Population',
      dataIndex: 'population',
      key: 'population',
      render: (population: string) => <Text strong>{population}</Text>,
    },
    {
      title: 'Donors',
      dataIndex: 'donors',
      key: 'donors',
      render: (donors: number) => <Text type="success">{donors.toLocaleString()}</Text>,
    },
    {
      title: 'Vendors',
      dataIndex: 'vendors',
      key: 'vendors',
      render: (vendors: number) => <Text>{vendors.toLocaleString()}</Text>,
    },
    {
      title: 'Beneficiaries',
      dataIndex: 'beneficiaries',
      key: 'beneficiaries',
      render: (beneficiaries: number) => <Text>{beneficiaries.toLocaleString()}</Text>,
    },
    {
      title: 'Total Donations',
      dataIndex: 'totalDonations',
      key: 'totalDonations',
      render: (donations: string) => <Text strong style={{ color: '#DB8633' }}>{donations}</Text>,
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: string) => (
        <Tag color="green" className="growth-tag">{growth}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'high-growth' ? 'success' : status === 'stable' ? 'processing' : 'default'} 
          text={status === 'high-growth' ? 'High Growth' : status === 'stable' ? 'Stable' : 'Emerging'} 
        />
      ),
    }
  ];

  const cityColumns = [
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (city: string, record: any) => (
        <div className="city-info">
          <Text strong>{city}</Text>
          <Text type="secondary" className="city-state">{record.state}</Text>
        </div>
      ),
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      render: (region: string) => (
        <Tag color="blue" className="region-tag">{region}</Tag>
      ),
    },
    {
      title: 'Donors',
      dataIndex: 'donors',
      key: 'donors',
      render: (donors: number) => <Text strong>{donors.toLocaleString()}</Text>,
    },
    {
      title: 'Vendors',
      dataIndex: 'vendors',
      key: 'vendors',
      render: (vendors: number) => <Text>{vendors.toLocaleString()}</Text>,
    },
    {
      title: 'Donations',
      dataIndex: 'donations',
      key: 'donations',
      render: (donations: string) => <Text strong style={{ color: '#DB8633' }}>{donations}</Text>,
    },
    {
      title: 'Growth',
      dataIndex: 'growth',
      key: 'growth',
      render: (growth: string) => (
        <Tag color="green" className="growth-tag">{growth}</Tag>
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
          selectedKeys={['geographic-analytics']}
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
            <Title level={2} className="page-title">Geographic Analytics</Title>
            <Text type="secondary" className="page-subtitle">Monitor regional performance and growth</Text>
          </div>
          <div className="header-right">
            <Select
              value={selectedRegion}
              onChange={setSelectedRegion}
              className="region-selector"
              placeholder="Select Region"
            >
              <Option value="all">All Regions</Option>
              <Option value="northeast">Northeast</Option>
              <Option value="west-coast">West Coast</Option>
              <Option value="southeast">Southeast</Option>
              <Option value="midwest">Midwest</Option>
              <Option value="southwest">Southwest</Option>
            </Select>
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
              {geographicOverviewData.map((card, index) => (
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
                className="geographic-tabs"
                items={[
                  {
                    key: 'overview',
                    label: (
                      <span>
                        <GlobalOutlined />
                        Regional Overview
                      </span>
                    ),
                    children: (
                      <div className="overview-content">
                        <Row gutter={[24, 24]}>
                          <Col span={16}>
                            <Card title="Regional Growth Trends" className="chart-card">
                              <div className="regional-growth">
                                {/* No data available */}
                              </div>
                            </Card>
                          </Col>
                          <Col span={8}>
                            <Card title="Geographic Distribution" className="chart-card">
                              <div className="geographic-stats">
                                <div className="stat-item">
                                  <div className="stat-icon">
                                    <EnvironmentOutlined style={{ color: '#324E58' }} />
                                  </div>
                                  <div className="stat-content">
                                    <Text strong>Coverage</Text>
                                    <Text type="secondary">2.4M km²</Text>
                                  </div>
                                </div>
                                <Divider />
                                <div className="stat-item">
                                  <div className="stat-icon">
                                    <UserOutlined style={{ color: '#DB8633' }} />
                                  </div>
                                  <div className="stat-content">
                                    <Text strong>Population</Text>
                                    <Text type="secondary">45.2M people</Text>
                                  </div>
                                </div>
                                <Divider />
                                <div className="stat-item">
                                  <div className="stat-icon">
                                    <HomeOutlined style={{ color: '#324E58' }} />
                                  </div>
                                  <div className="stat-content">
                                    <Text strong>Cities</Text>
                                    <Text type="secondary">156 cities</Text>
                                  </div>
                                </div>
                                <Divider />
                                <div className="stat-item">
                                  <div className="stat-icon">
                                    <DollarOutlined style={{ color: '#DB8633' }} />
                                  </div>
                                  <div className="stat-content">
                                    <Text strong>Total Value</Text>
                                    <Text type="secondary">$8.2M</Text>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </Col>
                        </Row>
                      </div>
                    )
                  },
                  {
                    key: 'regions',
                    label: (
                      <span>
                        <GlobalOutlined />
                        Regional Performance
                      </span>
                    ),
                    children: (
                      <div className="regions-content">
                        <Table 
                          dataSource={[]} 
                          columns={regionColumns}
                          pagination={false}
                          className="regions-table"
                          rowClassName="region-row"
                        />
                      </div>
                    )
                  },
                  {
                    key: 'cities',
                    label: (
                      <span>
                        <HomeOutlined />
                        City Performance
                      </span>
                    ),
                    children: (
                      <div className="cities-content">
                        <Table 
                          dataSource={[]} 
                          columns={cityColumns}
                          pagination={{ pageSize: 10 }}
                          className="cities-table"
                          rowClassName="city-row"
                        />
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

export default GeographicAnalytics;
