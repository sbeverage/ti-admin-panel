import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Statistic, Badge, Table, Input, Tag, Select, DatePicker, Modal, InputNumber, message, Spin, Tooltip, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';
import { oneTimeGiftsAPI, beneficiaryAPI } from '../services/api';
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
  GiftOutlined,
  BankOutlined,
  SearchOutlined,
  ReloadOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UndoOutlined,
  EyeOutlined,
  FileTextOutlined,
  ExportOutlined,
  FilterOutlined
} from '@ant-design/icons';
import './OneTimeGifts.css';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

const OneTimeGifts: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  
  // Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [beneficiaryFilter, setBeneficiaryFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [searchText, setSearchText] = useState<string>('');
  const [minAmount, setMinAmount] = useState<number | undefined>();
  const [maxAmount, setMaxAmount] = useState<number | undefined>();
  
  // Modals
  const [giftDetailsVisible, setGiftDetailsVisible] = useState(false);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number | undefined>();
  const [refundReason, setRefundReason] = useState<string>('');
  const [refundAdminNotes, setRefundAdminNotes] = useState<string>('');
  const [refundLoading, setRefundLoading] = useState(false);
  
  const navigate = useNavigate();
  const { token } = theme.useToken();

  // Load beneficiaries for filter
  useEffect(() => {
    const loadBeneficiaries = async () => {
      try {
        const response = await beneficiaryAPI.getBeneficiaries(1, 1000);
        if (response.success && response.data) {
          setBeneficiaries(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error loading beneficiaries:', error);
      }
    };
    loadBeneficiaries();
  }, []);

  // Load gifts data
  const loadGifts = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (beneficiaryFilter) filters.beneficiary_id = beneficiaryFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (dateRange[0]) filters.start_date = dateRange[0];
      if (dateRange[1]) filters.end_date = dateRange[1];
      if (minAmount) filters.min_amount = minAmount;
      if (maxAmount) filters.max_amount = maxAmount;
      if (searchText) filters.search = searchText;

      const response = await oneTimeGiftsAPI.getOneTimeGifts(page, pageSize, filters);
      if (response.success) {
        setGifts(response.data?.gifts || response.data || []);
        setTotal(response.data?.pagination?.total || response.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error loading gifts:', error);
      message.error('Failed to load one-time gifts');
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const filters: any = {};
      if (beneficiaryFilter) filters.beneficiary_id = beneficiaryFilter;
      if (dateRange[0]) filters.start_date = dateRange[0];
      if (dateRange[1]) filters.end_date = dateRange[1];

      const response = await oneTimeGiftsAPI.getOneTimeGiftsStats(filters);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadGifts();
    loadStats();
  }, [page, pageSize, beneficiaryFilter, statusFilter, dateRange, minAmount, maxAmount, searchText]);

  // Handle refund
  const handleRefund = async () => {
    if (!selectedGift) return;
    
    setRefundLoading(true);
    try {
      await oneTimeGiftsAPI.refundOneTimeGift(selectedGift.id, {
        amount: refundAmount,
        reason: refundReason,
        admin_notes: refundAdminNotes
      });
      message.success('Refund processed successfully');
      setRefundModalVisible(false);
      setRefundAmount(undefined);
      setRefundReason('');
      setRefundAdminNotes('');
      loadGifts();
      loadStats();
    } catch (error: any) {
      message.error(error.message || 'Failed to process refund');
    } finally {
      setRefundLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'success';
      case 'pending': return 'warning';
      case 'processing': return 'processing';
      case 'failed': return 'error';
      case 'refunded': return 'default';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded': return <CheckCircleOutlined />;
      case 'pending': return <ClockCircleOutlined />;
      case 'processing': return <ClockCircleOutlined />;
      case 'failed': return <CloseCircleOutlined />;
      case 'refunded': return <UndoOutlined />;
      case 'cancelled': return <CloseCircleOutlined />;
      default: return null;
    }
  };

  // Table columns
  const columns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-',
      sorter: (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Donor',
      key: 'donor',
      width: 200,
      render: (record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size={32} style={{ backgroundColor: '#DB8633' }}>
            {record.donor_name ? record.donor_name.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <div>
            <Text strong style={{ display: 'block' }}>{record.donor_name || 'Anonymous'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.donor_email || ''}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Beneficiary',
      dataIndex: 'beneficiary_name',
      key: 'beneficiary_name',
      width: 180,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (amount: number) => `$${amount?.toFixed(2) || '0.00'}`,
      sorter: (a: any, b: any) => (a.amount || 0) - (b.amount || 0),
    },
    {
      title: 'Net Amount',
      dataIndex: 'net_amount',
      key: 'net_amount',
      width: 120,
      align: 'right' as const,
      render: (netAmount: number) => `$${netAmount?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Fee',
      dataIndex: 'processing_fee',
      key: 'processing_fee',
      width: 100,
      align: 'right' as const,
      render: (fee: number) => `$${fee?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Payment Method',
      key: 'payment_method',
      width: 140,
      render: (record: any) => (
        <div>
          {record.payment_method_type && (
            <Tag color="blue" style={{ marginBottom: '4px', display: 'block' }}>
              {record.payment_method_type}
            </Tag>
          )}
          {record.payment_method_last4 && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              •••• {record.payment_method_last4}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
        </Tag>
      ),
      filters: [
        { text: 'Succeeded', value: 'succeeded' },
        { text: 'Pending', value: 'pending' },
        { text: 'Failed', value: 'failed' },
        { text: 'Refunded', value: 'refunded' },
      ],
      onFilter: (value: any, record: any) => record.status === value,
    },
    {
      title: 'Stripe ID',
      dataIndex: 'stripe_payment_intent_id',
      key: 'stripe_payment_intent_id',
      width: 200,
      render: (id: string) => id ? (
        <a 
          href={`https://dashboard.stripe.com/payments/${id}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ fontSize: '12px', wordBreak: 'break-all' }}
        >
          {id}
        </a>
      ) : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="default"
              shape="circle"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedGift(record);
                setGiftDetailsVisible(true);
              }}
              style={{ 
                backgroundColor: '#f0f9ff',
                borderColor: '#DB8633',
                color: '#DB8633'
              }}
            />
          </Tooltip>
          {record.status === 'succeeded' && !record.refunded_at && (
            <Tooltip title="Refund">
              <Popconfirm
                title="Issue Refund"
                description="Are you sure you want to refund this gift?"
                onConfirm={() => {
                  setSelectedGift(record);
                  setRefundAmount(record.amount);
                  setRefundModalVisible(true);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="default"
                  shape="circle"
                  size="small"
                  icon={<UndoOutlined />}
                  style={{ 
                    backgroundColor: '#fff7e6',
                    borderColor: '#DB8633',
                    color: '#DB8633'
                  }}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // Sidebar menu items
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
      icon: <CrownOutlined />,
      label: 'Referral Analytics',
      title: 'Referral Analytics & Tracking'
    },
    {
      key: 'one-time-gifts',
      icon: <DollarOutlined />,
      label: 'One-Time Gifts',
      title: 'One-Time Gift Management'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      title: 'System Settings & Configuration'
    },
  ];

  const handleMenuClick = (e: any) => {
    if (e.key === 'one-time-gifts') {
      return; // Already on this page
    }
    navigate(`/${e.key}`);
  };

  return (
    <Layout className="standard-layout">
      {/* Mobile Menu Button */}
      <Button
        type="text"
        icon={<MenuOutlined />}
        onClick={() => setMobileSidebarVisible(true)}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1001,
          display: window.innerWidth < 768 ? 'block' : 'none',
        }}
      />

      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={250}
        className="standard-sidebar"
        breakpoint="lg"
        collapsedWidth={window.innerWidth < 768 ? 0 : 80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
        onBreakpoint={(broken) => {
          if (broken) {
            setCollapsed(true);
          }
        }}
      >
        <div className="logo-container">
          <img src="/white-logo.png" alt="Logo" className="sidebar-logo" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={['one-time-gifts']}
          items={menuItems}
          onClick={handleMenuClick}
          className="standard-menu"
        />
      </Sider>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarVisible && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setMobileSidebarVisible(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <Sider
        className="mobile-sidebar"
        width={250}
        style={{
          display: window.innerWidth < 768 ? 'block' : 'none',
          position: 'fixed',
          left: mobileSidebarVisible ? 0 : -250,
          top: 0,
          bottom: 0,
          zIndex: 1002,
          transition: 'left 0.3s',
        }}
      >
        <div className="logo-container">
          <img src="/white-logo.png" alt="Logo" className="sidebar-logo" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={['one-time-gifts']}
          items={menuItems}
          onClick={(e) => {
            handleMenuClick(e);
            setMobileSidebarVisible(false);
          }}
        />
      </Sider>

      <Layout style={{ marginLeft: window.innerWidth >= 768 ? (collapsed ? 80 : 250) : 0 }}>
        {/* Header */}
        <Header className="standard-header" style={{ padding: '16px 24px', background: token.colorBgContainer }}>
          <div className="header-left">
            <Title level={2} className="page-title" style={{ margin: 0, color: '#324E58' }}>
              One-Time Gifts
            </Title>
            <Text type="secondary" className="page-subtitle">
              Manage and track one-time gift donations
            </Text>
          </div>
          <Space>
            <UserProfile />
          </Space>
        </Header>

        {/* Content */}
        <Content className="standard-content">
          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Gifts"
                  value={stats?.total_gifts || 0}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#324E58' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Amount"
                  value={stats?.total_amount || 0}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#DB8633' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Average Gift"
                  value={stats?.average_gift || 0}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#324E58' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="This Month"
                  value={stats?.this_month || 0}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="Search donor name/email"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Filter by Beneficiary"
                    style={{ width: '100%' }}
                    value={beneficiaryFilter}
                    onChange={setBeneficiaryFilter}
                    allowClear
                  >
                    {beneficiaries.map((b: any) => (
                      <Option key={b.id} value={b.id}>
                        {b.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Filter by Status"
                    style={{ width: '100%' }}
                    value={statusFilter}
                    onChange={setStatusFilter}
                  >
                    <Option value="all">All Statuses</Option>
                    <Option value="succeeded">Succeeded</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="processing">Processing</Option>
                    <Option value="failed">Failed</Option>
                    <Option value="refunded">Refunded</Option>
                    <Option value="cancelled">Cancelled</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <RangePicker
                    style={{ width: '100%' }}
                    onChange={(dates) => {
                      if (dates) {
                        setDateRange([
                          dates[0]?.format('YYYY-MM-DD') || '',
                          dates[1]?.format('YYYY-MM-DD') || ''
                        ]);
                      } else {
                        setDateRange(['', '']);
                      }
                    }}
                  />
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <InputNumber
                    placeholder="Min Amount"
                    prefix="$"
                    style={{ width: '100%' }}
                    min={0}
                    value={minAmount}
                    onChange={(value) => setMinAmount(value || undefined)}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <InputNumber
                    placeholder="Max Amount"
                    prefix="$"
                    style={{ width: '100%' }}
                    min={0}
                    value={maxAmount}
                    onChange={(value) => setMaxAmount(value || undefined)}
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setSearchText('');
                      setBeneficiaryFilter(undefined);
                      setStatusFilter('all');
                      setDateRange(['', '']);
                      setMinAmount(undefined);
                      setMaxAmount(undefined);
                    }}
                  >
                    Reset Filters
                  </Button>
                </Col>
              </Row>
            </Space>
          </Card>

          {/* Gifts Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={gifts}
              loading={loading}
              rowKey="id"
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} gifts`,
                onChange: (page, pageSize) => {
                  setPage(page);
                  setPageSize(pageSize);
                },
              }}
              scroll={{ x: 1400 }}
            />
          </Card>
        </Content>
      </Layout>

      {/* Gift Details Modal */}
      <Modal
        title="Gift Details"
        open={giftDetailsVisible}
        onCancel={() => {
          setGiftDetailsVisible(false);
          setSelectedGift(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setGiftDetailsVisible(false);
            setSelectedGift(null);
          }}>
            Close
          </Button>,
          selectedGift?.status === 'succeeded' && !selectedGift?.refunded_at && (
            <Button
              key="refund"
              type="primary"
              danger
              icon={<UndoOutlined />}
              onClick={() => {
                setRefundAmount(selectedGift.amount);
                setRefundModalVisible(true);
                setGiftDetailsVisible(false);
              }}
            >
              Issue Refund
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedGift && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Donor:</Text>
                <div>{selectedGift.donor_name || 'Anonymous'}</div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                  {selectedGift.donor_email}
                </div>
              </Col>
              <Col span={12}>
                <Text strong>Beneficiary:</Text>
                <div>{selectedGift.beneficiary_name}</div>
              </Col>
              <Col span={12}>
                <Text strong>Amount:</Text>
                <div>${selectedGift.amount?.toFixed(2)}</div>
              </Col>
              <Col span={12}>
                <Text strong>Net Amount:</Text>
                <div>${selectedGift.net_amount?.toFixed(2)}</div>
              </Col>
              <Col span={12}>
                <Text strong>Processing Fee:</Text>
                <div>${selectedGift.processing_fee?.toFixed(2)}</div>
              </Col>
              <Col span={12}>
                <Text strong>Status:</Text>
                <div>
                  <Tag color={getStatusColor(selectedGift.status)} icon={getStatusIcon(selectedGift.status)}>
                    {selectedGift.status?.charAt(0).toUpperCase() + selectedGift.status?.slice(1)}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <Text strong>Payment Method:</Text>
                <div>
                  {selectedGift.payment_method_type} {selectedGift.payment_method_last4 && `•••• ${selectedGift.payment_method_last4}`}
                </div>
              </Col>
              <Col span={12}>
                <Text strong>Created:</Text>
                <div>{selectedGift.created_at ? new Date(selectedGift.created_at).toLocaleString() : '-'}</div>
              </Col>
              {selectedGift.processed_at && (
                <Col span={12}>
                  <Text strong>Processed:</Text>
                  <div>{new Date(selectedGift.processed_at).toLocaleString()}</div>
                </Col>
              )}
              {selectedGift.refunded_at && (
                <Col span={12}>
                  <Text strong>Refunded:</Text>
                  <div>{new Date(selectedGift.refunded_at).toLocaleString()}</div>
                  {selectedGift.refund_amount && (
                    <div>Amount: ${selectedGift.refund_amount?.toFixed(2)}</div>
                  )}
                </Col>
              )}
              {selectedGift.donor_message && (
                <Col span={24}>
                  <Text strong>Donor Message:</Text>
                  <div style={{ marginTop: '8px', padding: '12px', background: '#f5f5f5', borderRadius: '4px' }}>
                    {selectedGift.donor_message}
                  </div>
                </Col>
              )}
              {selectedGift.stripe_payment_intent_id && (
                <Col span={24}>
                  <Text strong>Stripe Payment Intent:</Text>
                  <div>
                    <a
                      href={`https://dashboard.stripe.com/payments/${selectedGift.stripe_payment_intent_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedGift.stripe_payment_intent_id}
                    </a>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>

      {/* Refund Modal */}
      <Modal
        title="Issue Refund"
        open={refundModalVisible}
        onCancel={() => {
          setRefundModalVisible(false);
          setRefundAmount(undefined);
          setRefundReason('');
          setRefundAdminNotes('');
        }}
        onOk={handleRefund}
        confirmLoading={refundLoading}
        okText="Process Refund"
        okButtonProps={{ danger: true }}
      >
        {selectedGift && (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <Text strong>Gift Amount: </Text>
              <Text>${selectedGift.amount?.toFixed(2)}</Text>
            </div>
            <div>
              <Text strong>Refund Amount: </Text>
              <InputNumber
                prefix="$"
                style={{ width: '100%' }}
                min={0}
                max={selectedGift.amount}
                value={refundAmount}
                onChange={(value) => setRefundAmount(value || undefined)}
                placeholder="Leave empty for full refund"
              />
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                Leave empty to issue a full refund
              </Text>
            </div>
            <div>
              <Text strong>Reason: </Text>
              <Select
                style={{ width: '100%' }}
                value={refundReason}
                onChange={setRefundReason}
                placeholder="Select reason"
              >
                <Option value="customer_request">Customer Request</Option>
                <Option value="duplicate_charge">Duplicate Charge</Option>
                <Option value="error">Error</Option>
                <Option value="fraudulent">Fraudulent</Option>
                <Option value="other">Other</Option>
              </Select>
            </div>
            <div>
              <Text strong>Admin Notes: </Text>
              <TextArea
                rows={4}
                value={refundAdminNotes}
                onChange={(e) => setRefundAdminNotes(e.target.value)}
                placeholder="Internal notes about this refund"
              />
            </div>
          </Space>
        )}
      </Modal>
    </Layout>
  );
};

export default OneTimeGifts;

