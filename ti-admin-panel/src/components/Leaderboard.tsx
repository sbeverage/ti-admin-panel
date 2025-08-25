import React, { useState } from 'react';
import { Layout, Typography, Card, Avatar, Space, Table, Button, Menu } from 'antd';
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

  // Top 3 Leaderboard Data
  const top3Data = [
    {
      rank: 1,
      name: 'Sarah Johnson',
      points: 2847,
      avatar: 'SJ',
      badge: <CrownOutlined style={{ color: '#FFD700', fontSize: '24px' }} />,
      color: '#FFD700'
    },
    {
      rank: 2,
      name: 'Michael Chen',
      points: 2654,
      avatar: 'MC',
      badge: <StarFilled style={{ color: '#C0C0C0', fontSize: '24px' }} />,
      color: '#C0C0C0'
    },
    {
      rank: 3,
      name: 'Emily Rodriguez',
      points: 2489,
      avatar: 'ER',
      badge: <TrophyOutlined style={{ color: '#CD7F32', fontSize: '24px' }} />,
      color: '#CD7F32'
    }
  ];

  // Full Leaderboard Table Data
  const leaderboardData = [
    {
      key: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@gmail.com',
      contact: '(555) 123-4567',
      cityState: 'Springfield, IL',
      points: 2847,
      avatar: 'SJ',
      rank: 1
    },
    {
      key: '2',
      name: 'Michael Chen',
      email: 'michael.chen@gmail.com',
      contact: '(555) 234-5678',
      cityState: 'Portland, OR',
      points: 2654,
      avatar: 'MC',
      rank: 2
    },
    {
      key: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@gmail.com',
      contact: '(555) 345-6789',
      cityState: 'Charleston, SC',
      points: 2489,
      avatar: 'ER',
      rank: 3
    },
    {
      key: '4',
      name: 'David Thompson',
      email: 'david.thompson@gmail.com',
      contact: '(555) 456-7890',
      cityState: 'Austin, TX',
      points: 2312,
      avatar: 'DT',
      rank: 4
    },
    {
      key: '5',
      name: 'Jennifer Lee',
      email: 'jennifer.lee@gmail.com',
      contact: '(555) 567-8901',
      cityState: 'Denver, CO',
      points: 2156,
      avatar: 'JL',
      rank: 5
    },
    {
      key: '6',
      name: 'Christopher Brown',
      email: 'christopher.brown@gmail.com',
      contact: '(555) 678-9012',
      cityState: 'Nashville, TN',
      points: 1987,
      avatar: 'CB',
      rank: 6
    },
    {
      key: '7',
      name: 'Jessica Wilson',
      email: 'jessica.wilson@gmail.com',
      contact: '(555) 789-0123',
      cityState: 'Boston, MA',
      points: 1843,
      avatar: 'JW',
      rank: 7
    },
    {
      key: '8',
      name: 'Joshua Davis',
      email: 'joshua.davis@gmail.com',
      contact: '(555) 890-1234',
      cityState: 'Seattle, WA',
      points: 1721,
      avatar: 'JD',
      rank: 8
    }
  ];

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

        <div className="user-profile">
          <Avatar size={40} icon={<UserOutlined />} />
          <div className="user-info">
            <Text strong>Stephanie Beverage</Text>
          </div>
          <Button type="text" icon={<MoreOutlined />} />
        </div>
      </Sider>

      <Layout className="main-content">
        <Header className="leaderboard-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Leaderboard</Title>
            <Text type="secondary" className="leaderboard-count">Top Performers & Rankings</Text>
          </div>
        </Header>

        <Content className="leaderboard-content">
          <div className="content-wrapper">
            {/* Top 3 Showcase */}
            <div className="top3-showcase">
              <div className="top3-title">
                <Title level={2}>🏆 Top 3 Champions</Title>
                <Text>Celebrating our highest performing donors</Text>
              </div>
              <div className="top3-cards">
                {top3Data.map((person) => (
                  <Card key={person.rank} className={`top3-card rank-${person.rank}`}>
                    <div className="rank-badge">
                      {person.badge}
                    </div>
                    <div className="rank-number">#{person.rank}</div>
                    <Avatar size={80} style={{ backgroundColor: '#DB8633', margin: '16px 0' }}>
                      <Text style={{ fontSize: '32px', color: '#ffffff' }}>{person.avatar}</Text>
                    </Avatar>
                    <Title level={4} style={{ margin: '8px 0', color: person.color }}>
                      {person.name}
                    </Title>
                    <div className="points-display">
                      <TrophyOutlined style={{ color: '#DB8633', marginRight: '8px' }} />
                      <Text strong style={{ fontSize: '24px', color: person.color }}>
                        {person.points.toLocaleString()}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: '14px' }}>Points</Text>
                  </Card>
                ))}
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
        </Content>
      </Layout>
    </Layout>
  );
};

export default Leaderboard; 