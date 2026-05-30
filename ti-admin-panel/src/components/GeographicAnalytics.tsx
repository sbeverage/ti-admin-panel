import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Statistic, Badge, Tabs, Table, Input, List, Tag, Progress, Select, DatePicker, Divider, Dropdown, Spin, message, Alert, Empty } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import UserProfile from './UserProfile';
import { analyticsAPI } from '../services/api';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  RiseOutlined,
  SettingOutlined,
  CrownOutlined,
  ExclamationCircleOutlined,
  MenuOutlined,
  GiftOutlined,
  DollarOutlined,
  CheckCircleFilled,
  DownOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HomeOutlined,
  TrophyOutlined,
  TeamOutlined,
  CalculatorOutlined,
  MailOutlined
} from '@ant-design/icons';
import './GeographicAnalytics.css';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const GeographicAnalytics: React.FC = () => {
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<
    'monthly' | 'quarterly' | 'yearly'
  >('monthly');
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

  const getSelectedPeriod = () => {
    switch (selectedPeriod) {
      case 'quarterly':
        return '90d';
      case 'yearly':
        return '365d';
      default:
        return '30d';
    }
  };

  // Load geographic analytics from API
  const loadGeographicAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const selectedPeriod = getSelectedPeriod();
      const response = await analyticsAPI.getGeographicAnalytics(selectedPeriod);
      
      if (response.success) {
        setGeographicData(response.data);
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

  useEffect(() => {
    loadGeographicAnalytics();
  }, [selectedPeriod]);

  // Geographic Overview Data - real data only, no dummy growth percentages
  const geographicOverviewData = [
    { 
      title: 'Active Countries', 
      value: geographicData?.totalCountries ?? '--', 
      icon: <GlobalOutlined />, 
      color: '#DB8633' 
    },
    { 
      title: 'Total States', 
      value: geographicData?.totalStates ?? '--', 
      icon: <HomeOutlined />, 
      color: '#324E58' 
    },
    { 
      title: 'Total Cities', 
      value: geographicData?.totalCities ?? '--', 
      icon: <EnvironmentOutlined />, 
      color: '#324E58' 
    },
    { 
      title: 'Top Country', 
      value: geographicData?.topCountries?.[0]?.name || '--', 
      icon: <CrownOutlined />, 
      color: '#324E58' 
    },
    { 
      title: 'Top State', 
      value: geographicData?.topStates?.[0]?.name || '--', 
      icon: <RiseOutlined />, 
      color: '#DB8633' 
    },
    { 
      title: 'Top City', 
      value: geographicData?.topCities?.[0]?.city || '--', 
      icon: <StarOutlined />, 
      color: '#DB8633' 
    },
  ];

  // Transform API data for Regional Performance table (topStates -> region rows)
  const regionTableData = (geographicData?.topStates || []).map((state: any, index: number) => ({
    key: state.name || index,
    rank: index + 1,
    region: state.name || 'Unknown',
    avatar: (state.name || '?').charAt(0).toUpperCase(),
    states: [state.name || 'Unknown'],
    donors: state.donors || 0,
    vendors: state.vendors || 0,
    beneficiaries: state.beneficiaries || 0,
    totalDonations: state.totalDonations || '$0',
  }));

  // Transform API data for City Performance table
  const cityTableData = (geographicData?.topCities || []).map((city: any, index: number) => ({
    key: `${city.city}-${city.state}-${index}`,
    city: city.city || 'Unknown',
    state: city.state || 'Unknown',
    region: city.state || 'Unknown',
    donors: city.donors || 0,
    vendors: city.vendors || 0,
    donations: city.donations || '$0',
  }));

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
              {(record.states || []).slice(0, 4).map((state: string, index: number) => (
                <Tag key={index} className="state-tag">{state}</Tag>
              ))}
              {(record.states || []).length > 4 && (
                <Tag className="more-states">+{(record.states || []).length - 4}</Tag>
              )}
            </div>
          </div>
        </div>
      ),
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
  ];

  return (
    <Layout className="standard-layout">
      <AdminSidebar
        activeKey="geographic-analytics"
        mobileVisible={mobileSidebarVisible}
        onMobileToggle={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      <Layout className="standard-main-content">
        <Header className="standard-header">
          <div className="header-left">
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
            <div
              style={{
                display: 'inline-flex',
                background: '#f5f5f5',
                borderRadius: 8,
                padding: 3,
                gap: 2,
              }}
            >
              {(['monthly', 'quarterly', 'yearly'] as const).map((p) => {
                const active = p === selectedPeriod;
                const label =
                  p === 'monthly'
                    ? 'Month'
                    : p === 'quarterly'
                      ? 'Quarter'
                      : 'Year';
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedPeriod(p)}
                    style={{
                      border: 'none',
                      padding: '6px 14px',
                      borderRadius: 6,
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      cursor: 'pointer',
                      background: active ? '#fff' : 'transparent',
                      color: active ? '#262626' : '#595959',
                      boxShadow: active
                        ? '0 1px 2px rgba(0,0,0,0.08)'
                        : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </Header>

        <Content className="standard-content">
          {error && (
            <Alert
              message="Failed to load geographic analytics"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              style={{ marginBottom: 16 }}
            />
          )}
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
                        <GlobalOutlined style={{ marginRight: 8 }} />
                        Regional Overview
                      </span>
                    ),
                    children: (
                      <div className="overview-content">
                        <Row gutter={[24, 24]}>
                          <Col span={16}>
                            <Card title="Regional Growth Trends" className="chart-card">
                              <div className="regional-growth">
                                {(geographicData?.topStates?.length ?? 0) > 0 ? (
                                  <List
                                    size="small"
                                    dataSource={geographicData.topStates.slice(0, 8)}
                                    renderItem={(item: any, idx: number) => (
                                      <List.Item>
                                        <Space>
                                          <span className="rank-number">{idx + 1}</span>
                                          <Text strong>{item.name}</Text>
                                          <Tag>Donors: {item.donors || 0}</Tag>
                                          <Tag>Vendors: {item.vendors || 0}</Tag>
                                          <Text type="secondary">{item.totalDonations || '$0'}</Text>
                                        </Space>
                                      </List.Item>
                                    )}
                                  />
                                ) : (
                                  <Text type="secondary">No regional data available for the selected period.</Text>
                                )}
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
                                    <Text strong>Countries</Text>
                                    <Text type="secondary">{geographicData?.totalCountries ?? '--'}</Text>
                                  </div>
                                </div>
                                <Divider />
                                <div className="stat-item">
                                  <div className="stat-icon">
                                    <UserOutlined style={{ color: '#DB8633' }} />
                                  </div>
                                  <div className="stat-content">
                                    <Text strong>States</Text>
                                    <Text type="secondary">{geographicData?.totalStates ?? '--'}</Text>
                                  </div>
                                </div>
                                <Divider />
                                <div className="stat-item">
                                  <div className="stat-icon">
                                    <HomeOutlined style={{ color: '#324E58' }} />
                                  </div>
                                  <div className="stat-content">
                                    <Text strong>Cities</Text>
                                    <Text type="secondary">{geographicData?.totalCities ?? '--'}</Text>
                                  </div>
                                </div>
                                <Divider />
                                <div className="stat-item">
                                  <div className="stat-icon">
                                    <DollarOutlined style={{ color: '#DB8633' }} />
                                  </div>
                                  <div className="stat-content">
                                    <Text strong>Top State</Text>
                                    <Text type="secondary">{geographicData?.topStates?.[0]?.name ?? '--'}</Text>
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
                        <GlobalOutlined style={{ marginRight: 8 }} />
                        Regional Performance
                      </span>
                    ),
                    children: (
                      <div className="regions-content">
                        <Table 
                          dataSource={regionTableData} 
                          columns={regionColumns}
                          pagination={false}
                          className="regions-table"
                          rowClassName="region-row"
                          locale={{ emptyText: <Empty description="No regional data for the selected period" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                        />
                      </div>
                    )
                  },
                  {
                    key: 'cities',
                    label: (
                      <span>
                        <HomeOutlined style={{ marginRight: 8 }} />
                        City Performance
                      </span>
                    ),
                    children: (
                      <div className="cities-content">
                        <Table 
                          dataSource={cityTableData} 
                          columns={cityColumns}
                          pagination={{ pageSize: 10 }}
                          className="cities-table"
                          rowClassName="city-row"
                          locale={{ emptyText: <Empty description="No city data for the selected period" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
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
