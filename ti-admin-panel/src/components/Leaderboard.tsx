import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Avatar, Space, Table, Button, Menu, Spin, message } from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  CrownOutlined,
  StarFilled,
  MenuOutlined,
  DashboardOutlined,
  StarOutlined,
  RiseOutlined,
  GiftOutlined,
  BankOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  MoreOutlined,
  TeamOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import { analyticsAPI } from '../services/api';
import './Leaderboard.css';

const { Title, Text } = Typography;
const { Sider, Content, Header } = Layout;

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load leaderboard data from API
  const loadLeaderboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading leaderboard data from API...');
      const response = await analyticsAPI.getLeaderboard('donors', '30d');
      console.log('Leaderboard API response:', response);
      
      if (response.success) {
        setLeaderboardData(response.data);
        console.log('Leaderboard data loaded successfully');
      } else {
        setError('Failed to load leaderboard data');
        setLeaderboardData([]);
      }
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      setError('Failed to load leaderboard data');
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };


  // Load data on component mount
  useEffect(() => {
    loadLeaderboardData();
  }, []);

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

  // No hardcoded data - use API data only

  // No hardcoded data - use API data only

  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank: number) => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontWeight: rank <= 3 ? 'bold' : 'normal',
          color: rank <= 3 ? '#DB8633' : '#324E58'
        }}>
          {rank <= 3 && (
            rank === 1 ? <CrownOutlined style={{ color: '#FFD700' }} /> :
            rank === 2 ? <StarFilled style={{ color: '#C0C0C0' }} /> :
            <TrophyOutlined style={{ color: '#CD7F32' }} />
          )}
          <span>{rank}</span>
        </div>
      ),
      width: 80,
      fixed: 'left' as const,
    },
    {
      title: 'Donor Name',
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
      width: 200,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 250,
    },
    {
      title: 'Contact Number',
      dataIndex: 'contact',
      key: 'contact',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 180,
    },
    {
      title: 'City/State',
      dataIndex: 'cityState',
      key: 'cityState',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 160,
    },
    {
      title: 'Points',
      dataIndex: 'points',
      key: 'points',
      render: (points: number, record: any) => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          fontWeight: 'bold',
          color: record.rank <= 3 ? '#DB8633' : '#324E58'
        }}>
          <TrophyOutlined style={{ color: '#DB8633' }} />
          <span>{points.toLocaleString()}</span>
        </div>
      ),
      width: 120,
      fixed: 'right' as const,
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Layout className="leaderboard-layout">
      {/* Mobile Menu Button - Right Side */}
      <Button
        className="mobile-menu-btn-right"
        icon={<MenuOutlined />}
        onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      {/* Sidebar */}
      <Sider
        className={`leaderboard-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
        width={280}
        collapsed={collapsed}
        onCollapse={setCollapsed}
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
          defaultSelectedKeys={['leaderboard']}
          selectedKeys={[location.pathname === '/leaderboard' ? 'leaderboard' : '']}
          style={{ borderRight: 0 }}
          items={menuItems}
          className="leaderboard-menu"
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      <Layout className="main-content">
        <Header className="leaderboard-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Leaderboard</Title>
            <Text type="secondary" className="leaderboard-count">Top Performers & Rankings</Text>
          </div>
        </Header>

        <Content className="leaderboard-content">
          <Spin spinning={loading}>
            <div className="content-wrapper">
              {/* Top 3 Showcase */}
              <div className="top3-showcase">
              <div className="top3-title">
                <Title level={2}>🏆 Top 3 Champions</Title>
                <Text>Celebrating our highest performing donors</Text>
              </div>
              <div className="top3-cards">
                {/* No data available */}
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="leaderboard-table">
              <div style={{ marginBottom: '24px' }}>
                <Title level={4} style={{ margin: 0 }}>Complete Rankings</Title>
                <Text type="secondary">View all participants and their performance</Text>
              </div>
              
              <Table
                dataSource={leaderboardData}
                columns={columns}
                pagination={false}
                size="middle"
                className="leaderboard-table"
                scroll={{ x: 1200 }}
                bordered={false}
              />
            </div>
            </div>
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Leaderboard; 