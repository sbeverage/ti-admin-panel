import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Statistic, Badge, Tabs, Table, Input, Tag, Select, DatePicker, Dropdown, Spin, message, Progress, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
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
  ExclamationCircleOutlined,
  MenuOutlined,
  MessageOutlined,
  ShareAltOutlined,
  CheckCircleFilled,
  DownOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserAddOutlined,
  MailOutlined,
  LinkOutlined,
  BarChartOutlined,
  GlobalOutlined,
  SearchOutlined,
  GiftOutlined,
  BankOutlined
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
  const [invitationsData, setInvitationsData] = useState<any[]>([]);
  const [invitationsLoading, setInvitationsLoading] = useState(false);
  const [invitationStatusFilter, setInvitationStatusFilter] = useState<string>('all');
  const [invitationSearchText, setInvitationSearchText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Test data for analytics
  const getTestAnalyticsData = () => {
    return {
      totalReferrals: 1250,
      activeReferrers: 45,
      conversionRate: 71.2,
      topReferrers: [
        {
          user_id: 101,
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          total_referrals: 45,
          successful_referrals: 32,
          conversion_rate: 71.1,
          points_earned: 3200,
          total_value: 1600.00
        },
        {
          user_id: 102,
          name: 'Michael Chen',
          email: 'michael.chen@example.com',
          total_referrals: 38,
          successful_referrals: 28,
          conversion_rate: 73.7,
          points_earned: 2800,
          total_value: 1400.00
        },
        {
          user_id: 103,
          name: 'Emily Rodriguez',
          email: 'emily.r@example.com',
          total_referrals: 32,
          successful_referrals: 24,
          conversion_rate: 75.0,
          points_earned: 2400,
          total_value: 1200.00
        },
        {
          user_id: 104,
          name: 'David Kim',
          email: 'david.kim@example.com',
          total_referrals: 28,
          successful_referrals: 20,
          conversion_rate: 71.4,
          points_earned: 2000,
          total_value: 1000.00
        },
        {
          user_id: 105,
          name: 'Jessica Martinez',
          email: 'jessica.m@example.com',
          total_referrals: 25,
          successful_referrals: 18,
          conversion_rate: 72.0,
          points_earned: 1800,
          total_value: 900.00
        },
        {
          user_id: 106,
          name: 'Robert Williams',
          email: 'robert.w@example.com',
          total_referrals: 22,
          successful_referrals: 16,
          conversion_rate: 72.7,
          points_earned: 1600,
          total_value: 800.00
        },
        {
          user_id: 107,
          name: 'Amanda Brown',
          email: 'amanda.b@example.com',
          total_referrals: 20,
          successful_referrals: 15,
          conversion_rate: 75.0,
          points_earned: 1500,
          total_value: 750.00
        },
        {
          user_id: 108,
          name: 'James Davis',
          email: 'james.d@example.com',
          total_referrals: 18,
          successful_referrals: 13,
          conversion_rate: 72.2,
          points_earned: 1300,
          total_value: 650.00
        }
      ],
      referralSources: [
        { name: 'Social Media', count: 450 },
        { name: 'Email', count: 380 },
        { name: 'Direct', count: 220 },
        { name: 'QR Code', count: 150 },
        { name: 'Word of Mouth', count: 50 }
      ],
      monthlyTrends: [
        { month: '2024-01', referrals: 150, successful: 110, revenue: 5500.00 },
        { month: '2024-02', referrals: 180, successful: 130, revenue: 6500.00 },
        { month: '2024-03', referrals: 200, successful: 145, revenue: 7250.00 },
        { month: '2024-04', referrals: 220, successful: 160, revenue: 8000.00 },
        { month: '2024-05', referrals: 250, successful: 180, revenue: 9000.00 },
        { month: '2024-06', referrals: 250, successful: 175, revenue: 8750.00 }
      ]
    };
  };

  // Load referral analytics from API
  const loadReferralAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading referral analytics from API...');
      const response = await analyticsAPI.getReferralAnalytics('30d');
      console.log('Referral analytics API response:', response);
      
      if (response.success && response.data) {
        // Check if we have real data
        if (response.data.totalReferrals > 0 || (response.data.topReferrers && response.data.topReferrers.length > 0)) {
          setAnalyticsData(response.data);
          console.log('Referral analytics loaded successfully');
        } else {
          // Use test data if API returns empty
          console.log('No analytics data from API, using test data for demonstration');
          setAnalyticsData(getTestAnalyticsData());
        }
      } else {
        // Use test data if API doesn't return data yet
        console.log('Using test data for demonstration');
        setAnalyticsData(getTestAnalyticsData());
      }
    } catch (error) {
      console.error('Error loading referral analytics:', error);
      // Use test data on error
      console.log('Using test data for demonstration');
      setAnalyticsData(getTestAnalyticsData());
    } finally {
      setLoading(false);
    }
  };


  // Test data for demonstration
  const getTestInvitationsData = () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const lastMonth = new Date(now);
    lastMonth.setDate(lastMonth.getDate() - 30);
    const twoMonthsAgo = new Date(now);
    twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 60);

    return [
      {
        id: 1,
        referrer_id: 101,
        referrer_name: 'Sarah Johnson',
        referrer_email: 'sarah.johnson@example.com',
        email: 'friend1@example.com',
        referral_code: 'SARAH2024',
        referral_link: 'https://app.com/invite/SARAH2024',
        status: 'pending',
        created_at: yesterday.toISOString(),
        signed_up_at: null,
        paid_at: null,
        cancelled_at: null
      },
      {
        id: 2,
        referrer_id: 102,
        referrer_name: 'Michael Chen',
        referrer_email: 'michael.chen@example.com',
        email: 'colleague@example.com',
        referral_code: 'MICHAEL123',
        referral_link: 'https://app.com/invite/MICHAEL123',
        status: 'signed_up',
        created_at: lastWeek.toISOString(),
        signed_up_at: yesterday.toISOString(),
        paid_at: null,
        cancelled_at: null
      },
      {
        id: 3,
        referrer_id: 101,
        referrer_name: 'Sarah Johnson',
        referrer_email: 'sarah.johnson@example.com',
        email: 'friend2@example.com',
        referral_code: 'SARAH2024B',
        referral_link: 'https://app.com/invite/SARAH2024B',
        status: 'paid',
        created_at: twoWeeksAgo.toISOString(),
        signed_up_at: lastWeek.toISOString(),
        paid_at: yesterday.toISOString(),
        cancelled_at: null
      },
      {
        id: 4,
        referrer_id: 103,
        referrer_name: 'Emily Rodriguez',
        referrer_email: 'emily.r@example.com',
        email: 'family@example.com',
        referral_code: 'EMILY456',
        referral_link: 'https://app.com/invite/EMILY456',
        status: 'payment_setup',
        created_at: lastWeek.toISOString(),
        signed_up_at: yesterday.toISOString(),
        paid_at: null,
        cancelled_at: null
      },
      {
        id: 5,
        referrer_id: 102,
        referrer_name: 'Michael Chen',
        referrer_email: 'michael.chen@example.com',
        email: 'oldfriend@example.com',
        referral_code: 'MICHAEL789',
        referral_link: 'https://app.com/invite/MICHAEL789',
        status: 'cancelled',
        created_at: lastMonth.toISOString(),
        signed_up_at: null,
        paid_at: null,
        cancelled_at: lastWeek.toISOString()
      },
      {
        id: 6,
        referrer_id: 104,
        referrer_name: 'David Kim',
        referrer_email: 'david.kim@example.com',
        email: 'teammate@example.com',
        referral_code: 'DAVID2024',
        referral_link: 'https://app.com/invite/DAVID2024',
        status: 'pending',
        created_at: yesterday.toISOString(),
        signed_up_at: null,
        paid_at: null,
        cancelled_at: null
      },
      {
        id: 7,
        referrer_id: 101,
        referrer_name: 'Sarah Johnson',
        referrer_email: 'sarah.johnson@example.com',
        email: 'friend3@example.com',
        referral_code: 'SARAH2024C',
        referral_link: 'https://app.com/invite/SARAH2024C',
        status: 'paid',
        created_at: twoWeeksAgo.toISOString(),
        signed_up_at: lastWeek.toISOString(),
        paid_at: yesterday.toISOString(),
        cancelled_at: null
      },
      {
        id: 8,
        referrer_id: 105,
        referrer_name: 'Jessica Martinez',
        referrer_email: 'jessica.m@example.com',
        email: 'neighbor@example.com',
        referral_code: 'JESSICA999',
        referral_link: 'https://app.com/invite/JESSICA999',
        status: 'signed_up',
        created_at: lastWeek.toISOString(),
        signed_up_at: now.toISOString(),
        paid_at: null,
        cancelled_at: null
      },
      {
        id: 9,
        referrer_id: 103,
        referrer_name: 'Emily Rodriguez',
        referrer_email: 'emily.r@example.com',
        email: 'coworker@example.com',
        referral_code: 'EMILY321',
        referral_link: 'https://app.com/invite/EMILY321',
        status: 'pending',
        created_at: twoWeeksAgo.toISOString(),
        signed_up_at: null,
        paid_at: null,
        cancelled_at: null
      },
      {
        id: 10,
        referrer_id: 102,
        referrer_name: 'Michael Chen',
        referrer_email: 'michael.chen@example.com',
        email: 'classmate@example.com',
        referral_code: 'MICHAEL555',
        referral_link: 'https://app.com/invite/MICHAEL555',
        status: 'paid',
        created_at: lastMonth.toISOString(),
        signed_up_at: twoWeeksAgo.toISOString(),
        paid_at: lastWeek.toISOString(),
        cancelled_at: null
      },
      {
        id: 11,
        referrer_id: 101,
        referrer_name: 'Sarah Johnson',
        referrer_email: 'sarah.johnson@example.com',
        email: 'friend4@example.com',
        referral_code: 'SARAH2024D',
        referral_link: 'https://app.com/invite/SARAH2024D',
        status: 'pending',
        created_at: yesterday.toISOString(),
        signed_up_at: null,
        paid_at: null,
        cancelled_at: null
      },
      {
        id: 12,
        referrer_id: 104,
        referrer_name: 'David Kim',
        referrer_email: 'david.kim@example.com',
        email: 'buddy@example.com',
        referral_code: 'DAVID777',
        referral_link: 'https://app.com/invite/DAVID777',
        status: 'cancelled',
        created_at: twoMonthsAgo.toISOString(),
        signed_up_at: null,
        paid_at: null,
        cancelled_at: lastWeek.toISOString()
      }
    ];
  };

  // Load invitations data
  const loadInvitations = async () => {
    setInvitationsLoading(true);
    
    try {
      console.log('Loading referral invitations from API...');
      const status = invitationStatusFilter !== 'all' ? invitationStatusFilter : undefined;
      const response = await analyticsAPI.getReferralInvitations('30d', status);
      console.log('Referral invitations API response:', response);
      
      if (response.success && response.data) {
        // Transform API data to match our table structure
        const invitations = Array.isArray(response.data) 
          ? response.data 
          : response.data.invitations || [];
        
        if (invitations.length > 0) {
          setInvitationsData(invitations);
          console.log('Referral invitations loaded successfully');
        } else {
          // Use test data if API returns empty
          console.log('No invitations from API, using test data for demonstration');
          setInvitationsData(getTestInvitationsData());
        }
      } else {
        // If API doesn't return invitations yet, use test data
        if (analyticsData?.referrals && analyticsData.referrals.length > 0) {
          setInvitationsData(analyticsData.referrals);
        } else {
          console.log('Using test data for demonstration');
          setInvitationsData(getTestInvitationsData());
        }
      }
    } catch (error) {
      console.error('Error loading referral invitations:', error);
      // Fallback: try to use referrals from analytics data, otherwise use test data
      if (analyticsData?.referrals && analyticsData.referrals.length > 0) {
        setInvitationsData(analyticsData.referrals);
      } else {
        console.log('Using test data for demonstration');
        setInvitationsData(getTestInvitationsData());
      }
    } finally {
      setInvitationsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    // Load test data immediately for demonstration
    setAnalyticsData(getTestAnalyticsData());
    setInvitationsData(getTestInvitationsData());
    // Also try to load from API (will replace test data if real data exists)
    loadReferralAnalytics();
  }, []);

  // Load invitations when analytics data is available or filter changes
  useEffect(() => {
    if (analyticsData) {
      loadInvitations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analyticsData, invitationStatusFilter]);

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

  // Calculate invitation statistics from data
  const invitationStats = {
    pending: invitationsData.filter((inv: any) => inv.status === 'pending').length,
    accepted: invitationsData.filter((inv: any) => inv.status === 'signed_up' || inv.status === 'payment_setup' || inv.status === 'paid').length,
    expired: invitationsData.filter((inv: any) => {
      if (inv.status === 'cancelled') return true;
      // Check if invitation is older than 30 days and still pending
      if (inv.status === 'pending' && inv.created_at) {
        const createdDate = new Date(inv.created_at);
        const daysSince = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince > 30;
      }
      return false;
    }).length,
    acceptedToday: invitationsData.filter((inv: any) => {
      if (inv.signed_up_at) {
        const signupDate = new Date(inv.signed_up_at);
        const today = new Date();
        return signupDate.toDateString() === today.toDateString();
      }
      return false;
    }).length,
    expiredThisWeek: invitationsData.filter((inv: any) => {
      if (inv.status === 'cancelled' && inv.cancelled_at) {
        const cancelledDate = new Date(inv.cancelled_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return cancelledDate >= weekAgo;
      }
      return false;
    }).length
  };

  // Filter invitations based on search and status
  const filteredInvitations = invitationsData.filter((inv: any) => {
    const matchesStatus = invitationStatusFilter === 'all' || inv.status === invitationStatusFilter;
    const matchesSearch = !invitationSearchText || 
      (inv.email && inv.email.toLowerCase().includes(invitationSearchText.toLowerCase())) ||
      (inv.referral_code && inv.referral_code.toLowerCase().includes(invitationSearchText.toLowerCase())) ||
      (inv.referrer_name && inv.referrer_name.toLowerCase().includes(invitationSearchText.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Invitation table columns
  const invitationColumns = [
    {
      title: 'Referrer',
      dataIndex: 'referrer_name',
      key: 'referrer_name',
      width: 180,
      fixed: 'left' as const,
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size={32} style={{ backgroundColor: '#DB8633' }}>
            {text ? text.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: '14px' }}>{text || 'Unknown'}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '11px' }}>{record.referrer_email || ''}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Invited Email',
      dataIndex: 'email',
      key: 'email',
      width: 180,
      render: (email: string) => <Text style={{ fontSize: '13px' }}>{email || 'N/A'}</Text>,
    },
    {
      title: 'Referral Code',
      dataIndex: 'referral_code',
      key: 'referral_code',
      width: 120,
      render: (code: string) => (
        <Text code style={{ fontSize: '12px' }}>{code || 'N/A'}</Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusConfig: any = {
          pending: { color: 'orange', text: 'Pending' },
          signed_up: { color: 'blue', text: 'Signed Up' },
          payment_setup: { color: 'cyan', text: 'Payment Setup' },
          paid: { color: 'green', text: 'Paid' },
          cancelled: { color: 'red', text: 'Cancelled' },
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 100,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {date ? new Date(date).toLocaleDateString() : 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Accepted',
      dataIndex: 'signed_up_at',
      key: 'signed_up_at',
      width: 100,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {date ? new Date(date).toLocaleDateString() : '-'}
        </Text>
      ),
    },
    {
      title: 'Paid',
      dataIndex: 'paid_at',
      key: 'paid_at',
      width: 100,
      render: (date: string) => (
        <Text type={date ? 'success' : 'secondary'} style={{ fontSize: '12px' }}>
          {date ? new Date(date).toLocaleDateString() : '-'}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space size="small" style={{ display: 'flex', justifyContent: 'center' }}>
          {record.status === 'pending' && (
            <Tooltip title="Resend Invitation">
              <Button 
                type="default"
                shape="circle"
                size="middle"
                icon={<MailOutlined />}
                onClick={() => handleResendInvitation(record)}
                style={{ 
                  backgroundColor: '#fff7e6',
                  borderColor: '#DB8633',
                  color: '#DB8633',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DB8633';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff7e6';
                  e.currentTarget.style.color = '#DB8633';
                }}
              />
            </Tooltip>
          )}
          <Tooltip title="Copy Referral Link">
            <Button 
              type="default"
              shape="circle"
              size="middle"
              icon={<LinkOutlined />}
              onClick={() => handleCopyReferralLink(record)}
              style={{ 
                backgroundColor: '#f0f9ff',
                borderColor: '#DB8633',
                color: '#DB8633',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DB8633';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f9ff';
                e.currentTarget.style.color = '#DB8633';
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handler functions
  const handleResendInvitation = (invitation: any) => {
    message.info(`Resending invitation to ${invitation.email || 'user'}...`);
    // TODO: Implement API call to resend invitation
    console.log('Resend invitation:', invitation);
  };

  const handleCopyReferralLink = (invitation: any) => {
    const link = invitation.referral_link || `https://yourapp.com/invite/${invitation.referral_code}`;
    navigator.clipboard.writeText(link).then(() => {
      message.success('Referral link copied to clipboard!');
    }).catch(() => {
      message.error('Failed to copy link');
    });
  };

  const handleSendNewInvitations = () => {
    message.info('Send New Invitations feature - Coming soon!');
    // TODO: Open modal to send bulk invitations
  };

  const handleResendPending = () => {
    const pendingInvitations = invitationsData.filter((inv: any) => inv.status === 'pending');
    if (pendingInvitations.length === 0) {
      message.warning('No pending invitations to resend');
      return;
    }
    message.info(`Resending ${pendingInvitations.length} pending invitations...`);
    // TODO: Implement bulk resend
  };

  const handleGenerateReferralLinks = () => {
    message.info('Generate Referral Links feature - Coming soon!');
    // TODO: Open modal to generate referral links for users
  };

  const referralColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      width: 100,
      render: (rank: number) => {
        const getRankStyle = () => {
          if (rank === 1) {
            return {
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#ffffff',
              border: '2px solid #FFD700',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
            };
          } else if (rank === 2) {
            return {
              background: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)',
              color: '#ffffff',
              border: '2px solid #C0C0C0',
              boxShadow: '0 4px 12px rgba(192, 192, 192, 0.3)'
            };
          } else if (rank === 3) {
            return {
              background: 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)',
              color: '#ffffff',
              border: '2px solid #CD7F32',
              boxShadow: '0 4px 12px rgba(205, 127, 50, 0.3)'
            };
          } else {
            return {
              background: '#f5f5f5',
              color: '#324E58',
              border: '2px solid #e8e8e8'
            };
          }
        };
        
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            ...getRankStyle(),
            fontWeight: 'bold',
            fontSize: '18px',
            position: 'relative'
          }}>
            {rank === 1 && <CrownOutlined style={{ fontSize: '20px' }} />}
            {(rank === 2 || rank === 3) && <TrophyOutlined style={{ fontSize: '18px' }} />}
            <span>{rank}</span>
          </div>
        );
      },
    },
    {
      title: 'Referrer',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (text: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar 
            size={48} 
            style={{ 
              backgroundColor: '#DB8633',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {record.avatar}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>
              {text}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Total Referrals',
      dataIndex: 'referrals',
      key: 'referrals',
      width: 140,
      align: 'center' as const,
      render: (referrals: number) => (
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ fontSize: '20px', color: '#324E58', display: 'block' }}>
            {referrals}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>referrals</Text>
        </div>
      ),
    },
    {
      title: 'Successful',
      dataIndex: 'successful',
      key: 'successful',
      width: 140,
      align: 'center' as const,
      render: (successful: number) => (
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ fontSize: '20px', color: '#52c41a', display: 'block' }}>
            {successful}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>converted</Text>
        </div>
      ),
    },
    {
      title: 'Conversion Rate',
      dataIndex: 'conversionRate',
      key: 'conversionRate',
      width: 140,
      align: 'center' as const,
      render: (rate: string) => (
        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #DB8633 0%, #ff9a56 100%)',
          color: '#ffffff',
          fontWeight: '600',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(219, 134, 51, 0.2)'
        }}>
          {rate}
        </div>
      ),
    },
    {
      title: 'Points Earned',
      dataIndex: 'pointsEarned',
      key: 'pointsEarned',
      width: 160,
      align: 'center' as const,
      render: (points: number) => (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: '#fff7e6',
          borderRadius: '8px',
          border: '1px solid #ffe7ba'
        }}>
          <TrophyOutlined style={{ color: '#DB8633', fontSize: '18px' }} />
          <Text strong style={{ fontSize: '16px', color: '#DB8633' }}>
            {points.toLocaleString()}
          </Text>
        </div>
      ),
    },
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 140,
      align: 'center' as const,
      render: (value: string) => (
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ fontSize: '18px', color: '#DB8633', display: 'block' }}>
            {value}
          </Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>generated</Text>
        </div>
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
                                {analyticsData?.monthlyTrends ? (
                                  analyticsData.monthlyTrends.map((trend: any, index: number) => {
                                    const monthName = new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short' });
                                    const percentage = (trend.successful / trend.referrals) * 100;
                                    return (
                                      <div key={index} className="month-item">
                                        <div className="month-header">
                                          <Text strong>{monthName}</Text>
                                          <Text type="secondary" style={{ fontSize: '11px' }}>{trend.referrals} total</Text>
                                        </div>
                                        <Progress 
                                          percent={Math.round(percentage)} 
                                          strokeColor="#DB8633"
                                          format={() => `${trend.successful}`}
                                        />
                                        <Text type="secondary" style={{ fontSize: '11px' }}>
                                          ${trend.revenue.toLocaleString()}
                                        </Text>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <Text type="secondary">No monthly data available</Text>
                                )}
                              </div>
                            </Card>
                          </Col>
                          <Col span={8}>
                            <Card title="Referral Channels" className="chart-card">
                              <div className="channels-list">
                                {analyticsData?.referralSources ? (
                                  analyticsData.referralSources.map((source: any, index: number) => {
                                    const total = analyticsData.referralSources.reduce((sum: number, s: any) => sum + s.count, 0);
                                    const percentage = (source.count / total) * 100;
                                    return (
                                      <div key={index} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                          <Text strong>{source.name}</Text>
                                          <Text type="secondary">{source.count}</Text>
                                        </div>
                                        <Progress 
                                          percent={Math.round(percentage)} 
                                          strokeColor="#DB8633"
                                          showInfo={false}
                                        />
                                      </div>
                                    );
                                  })
                                ) : (
                                  <Text type="secondary">No channel data available</Text>
                                )}
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
                        {loading ? (
                          <Spin size="large" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }} />
                        ) : error ? (
                          <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Text type="danger">{error}</Text>
                          </div>
                        ) : analyticsData?.topReferrers && analyticsData.topReferrers.length > 0 ? (
                          <Table 
                            dataSource={analyticsData.topReferrers.map((referrer: any, index: number) => ({
                              ...referrer,
                              key: referrer.user_id || index,
                              rank: index + 1,
                              avatar: referrer.name ? referrer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U',
                              referrals: referrer.total_referrals || referrer.referrals || 0,
                              successful: referrer.successful_referrals || referrer.successful || 0,
                              conversionRate: referrer.conversion_rate ? `${referrer.conversion_rate}%` : '0%',
                              pointsEarned: referrer.points_earned || 0,
                              totalValue: referrer.total_value ? `$${referrer.total_value.toFixed(2)}` : '$0.00'
                            }))} 
                            columns={referralColumns}
                            pagination={false}
                            className="referrers-table"
                            rowClassName="referrer-row"
                          />
                        ) : (
                          <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Text type="secondary">No referral data available. The backend may need to be updated to return referral data.</Text>
                          </div>
                        )}
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
                        {/* Statistics Cards */}
                        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                          <Col xs={24} sm={12} lg={6}>
                            <Card>
                              <Statistic 
                                title="Pending Invitations" 
                                value={invitationStats.pending} 
                                valueStyle={{ color: '#DB8633' }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} lg={6}>
                            <Card>
                              <Statistic 
                                title="Accepted Today" 
                                value={invitationStats.acceptedToday} 
                                valueStyle={{ color: '#DB8633' }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} lg={6}>
                            <Card>
                              <Statistic 
                                title="Total Accepted" 
                                value={invitationStats.accepted} 
                                valueStyle={{ color: '#52c41a' }}
                              />
                            </Card>
                          </Col>
                          <Col xs={24} sm={12} lg={6}>
                            <Card>
                              <Statistic 
                                title="Expired This Week" 
                                value={invitationStats.expiredThisWeek} 
                                valueStyle={{ color: '#324E58' }}
                              />
                            </Card>
                          </Col>
                        </Row>

                        {/* Action Buttons */}
                        <Card style={{ marginBottom: 24 }}>
                          <Space wrap>
                            <Button 
                              type="primary"
                              icon={<UserAddOutlined />} 
                              onClick={handleSendNewInvitations}
                              style={{
                                backgroundColor: '#DB8633',
                                borderColor: '#DB8633',
                                color: '#ffffff'
                              }}
                            >
                              Send New Invitations
                            </Button>
                            <Button 
                              icon={<MailOutlined />}
                              onClick={handleResendPending}
                              disabled={invitationStats.pending === 0}
                              style={{
                                backgroundColor: invitationStats.pending > 0 ? '#DB8633' : undefined,
                                borderColor: invitationStats.pending > 0 ? '#DB8633' : undefined,
                                color: invitationStats.pending > 0 ? '#ffffff' : undefined
                              }}
                            >
                              Resend Pending ({invitationStats.pending})
                            </Button>
                            <Button 
                              icon={<LinkOutlined />}
                              onClick={handleGenerateReferralLinks}
                              style={{
                                backgroundColor: '#DB8633',
                                borderColor: '#DB8633',
                                color: '#ffffff'
                              }}
                            >
                              Generate Referral Links
                            </Button>
                          </Space>
                        </Card>

                        {/* Filters and Search */}
                        <Card style={{ marginBottom: 24 }}>
                          <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={12} md={8}>
                              <Select
                                placeholder="Filter by Status"
                                value={invitationStatusFilter}
                                onChange={setInvitationStatusFilter}
                                style={{ width: '100%' }}
                              >
                                <Option value="all">All Statuses</Option>
                                <Option value="pending">Pending</Option>
                                <Option value="signed_up">Signed Up</Option>
                                <Option value="payment_setup">Payment Setup</Option>
                                <Option value="paid">Paid</Option>
                                <Option value="cancelled">Cancelled</Option>
                              </Select>
                            </Col>
                            <Col xs={24} sm={12} md={16}>
                              <Input
                                placeholder="Search by email, referral code, or referrer name..."
                                prefix={<SearchOutlined />}
                                value={invitationSearchText}
                                onChange={(e) => setInvitationSearchText(e.target.value)}
                                allowClear
                              />
                            </Col>
                          </Row>
                        </Card>

                        {/* Invitations Table */}
                        <Card title={`All Invitations (${filteredInvitations.length})`}>
                          {invitationsLoading ? (
                            <Spin size="large" style={{ display: 'flex', justifyContent: 'center', padding: '40px' }} />
                          ) : filteredInvitations.length > 0 ? (
                            <Table 
                              dataSource={filteredInvitations.map((inv: any, index: number) => ({
                                ...inv,
                                key: inv.id || inv.referral_code || index
                              }))}
                              columns={invitationColumns}
                              pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} invitations`
                              }}
                              scroll={{ x: 1200 }}
                              size="small"
                            />
                          ) : (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                              <Text type="secondary">
                                {invitationSearchText || invitationStatusFilter !== 'all' 
                                  ? 'No invitations match your filters.' 
                                  : 'No invitations found. Invitations will appear here when users share referral links.'}
                              </Text>
                            </div>
                          )}
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
