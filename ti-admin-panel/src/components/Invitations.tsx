import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Button, Input, Select, Table, Tag, Modal, message, Spin, Card, Descriptions, Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { invitationsAPI } from '../services/api';
import {
  DashboardOutlined, UserOutlined, SettingOutlined,
  MenuOutlined, SearchOutlined, ShopOutlined, HeartOutlined,
  TeamOutlined, GlobalOutlined, CalculatorOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, MailOutlined, EyeOutlined,
  StarOutlined, RiseOutlined, GiftOutlined, BankOutlined, CalendarOutlined
} from '@ant-design/icons';
import './Invitations.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface Invitation {
  id: number;
  user_id: number | null;
  type: 'vendor' | 'beneficiary';
  contact_name: string;
  company_name: string;
  email: string;
  phone: string;
  website: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected' | 'contacted';
  created_at: string;
  updated_at: string;
  users?: any;
}

const Invitations: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalInvitations, setTotalInvitations] = useState(0);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState<'pending' | 'approved' | 'rejected' | 'contacted'>('pending');
  const [statusNotes, setStatusNotes] = useState('');
  const [inviting, setInviting] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'vendor' | 'beneficiary'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'contacted'>('all');
  const [searchText, setSearchText] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Load invitations from API
  const loadInvitations = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        page: currentPage,
        limit: pageSize
      };

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchText) {
        params.search = searchText;
      }

      const response = await invitationsAPI.getInvitations(params);

      if (response.success) {
        const data = response.data || response;
        setInvitations(data.invitations || []);
        setTotalInvitations(data.pagination?.total || 0);
      } else {
        setError('Failed to load invitations');
        setInvitations([]);
        setTotalInvitations(0);
      }
    } catch (error: any) {
      console.error('Error loading invitations:', error);
      setError(error.message || 'Failed to load invitations');
      setInvitations([]);
      setTotalInvitations(0);
      message.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, [currentPage, pageSize, typeFilter, statusFilter, searchText]);

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
    } else if (key === 'pending-approvals') {
      navigate('/pending-approvals');
    } else if (key === 'invitations') {
      navigate('/invitations');
    } else if (key === 'referral-analytics') {
      navigate('/referral-analytics');
    } else if (key === 'geographic-analytics') {
      navigate('/geographic-analytics');
    } else if (key === 'reporting') {
      navigate('/reporting');
    } else if (key === 'settings') {
      navigate('/settings');
    }
    setMobileSidebarVisible(false);
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
      key: 'pending-approvals',
      icon: <ExclamationCircleOutlined />,
      label: 'Pending Approvals',
      title: 'Pending Approvals'
    },
    {
      key: 'invitations',
      icon: <MailOutlined />,
      label: 'Invitations',
      title: 'Beneficiary & Vendor Invitations'
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
      key: 'reporting',
      icon: <CalculatorOutlined />,
      label: 'Reporting',
      title: 'Payouts & Financial Reporting'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      title: 'System Settings & Configuration'
    },
  ];

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Pending' },
      approved: { color: 'green', text: 'Approved' },
      rejected: { color: 'red', text: 'Rejected' },
      contacted: { color: 'blue', text: 'Contacted' }
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeTag = (type: string) => {
    return type === 'beneficiary' ? (
      <Tag icon={<HeartOutlined />} color="pink">Beneficiary</Tag>
    ) : (
      <Tag icon={<ShopOutlined />} color="blue">Vendor</Tag>
    );
  };

  const handleViewDetails = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setDetailModalVisible(true);
  };

  const handleUpdateStatus = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setNewStatus(invitation.status);
    setStatusNotes('');
    setStatusModalVisible(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedInvitation) return;

    try {
      setLoading(true);
      const response = await invitationsAPI.updateInvitationStatus(
        selectedInvitation.id,
        newStatus,
        statusNotes
      );

      if (response.success) {
        message.success('Status updated successfully');
        setStatusModalVisible(false);
        loadInvitations();
      } else {
        message.error('Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (invitation: Invitation) => {
    try {
      setInviting(true);
      const response = await invitationsAPI.inviteUser(invitation.id);

      if (response.success) {
        message.success('User account created and invitation email sent!');
        loadInvitations();
      } else {
        message.error('Failed to invite user');
      }
    } catch (error: any) {
      console.error('Error inviting user:', error);
      message.error(error.message || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a: Invitation, b: Invitation) => a.id - b.id,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => getTypeTag(type),
      filters: [
        { text: 'Beneficiary', value: 'beneficiary' },
        { text: 'Vendor', value: 'vendor' },
      ],
      onFilter: (value: any, record: Invitation) => record.type === value,
    },
    {
      title: 'Contact Name',
      dataIndex: 'contact_name',
      key: 'contact_name',
      width: 150,
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Company/Organization',
      dataIndex: 'company_name',
      key: 'company_name',
      width: 200,
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (text: string) => (
        <a href={`mailto:${text}`}>{text}</a>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
        { text: 'Contacted', value: 'contacted' },
      ],
      onFilter: (value: any, record: Invitation) => record.status === value,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
      sorter: (a: Invitation, b: Invitation) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: Invitation) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button
              type="link"
              icon={<CheckCircleOutlined />}
              onClick={() => handleUpdateStatus(record)}
            />
          </Tooltip>
          {record.status === 'approved' && (
            <Tooltip title="Send Invitation Email">
              <Button
                type="link"
                icon={<MailOutlined />}
                onClick={() => handleInviteUser(record)}
                loading={inviting}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          background: colorBgContainer,
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
        className="sidebar-standard"
      >
        <div className="logo" style={{ padding: '16px', textAlign: 'center' }}>
          {!collapsed ? (
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              Admin Panel
            </Title>
          ) : (
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              AP
            </Title>
          )}
        </div>
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={['invitations']}
          items={menuItems}
          onClick={handleMenuClick}
          className="standard-menu"
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileSidebarVisible(true)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
            className="mobile-menu-button"
          />
        </Header>

        <Content
          style={{
            margin: '24px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>Invitations</Title>
            <Text type="secondary">
              Manage beneficiary and vendor invitation requests
            </Text>
          </div>

          {/* Filters */}
          <Card style={{ marginBottom: 24 }}>
            <Space size="middle" wrap>
              <Search
                placeholder="Search by name, company, or email"
                allowClear
                style={{ width: 300 }}
                onSearch={(value) => {
                  setSearchText(value);
                  setCurrentPage(1);
                }}
                onChange={(e) => {
                  if (!e.target.value) {
                    setSearchText('');
                    setCurrentPage(1);
                  }
                }}
              />
              <Select
                placeholder="Filter by Type"
                style={{ width: 150 }}
                value={typeFilter}
                onChange={(value) => {
                  setTypeFilter(value);
                  setCurrentPage(1);
                }}
              >
                <Option value="all">All Types</Option>
                <Option value="beneficiary">Beneficiary</Option>
                <Option value="vendor">Vendor</Option>
              </Select>
              <Select
                placeholder="Filter by Status"
                style={{ width: 150 }}
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <Option value="all">All Statuses</Option>
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="contacted">Contacted</Option>
              </Select>
              <Button
                onClick={() => {
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setSearchText('');
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </Space>
          </Card>

          {/* Table */}
          <Card>
            <Spin spinning={loading}>
              {error && (
                <div style={{ marginBottom: 16, color: 'red' }}>
                  Error: {error}
                </div>
              )}
              <Table
                columns={columns}
                dataSource={invitations}
                rowKey="id"
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalInvitations,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} invitations`,
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size || 20);
                  },
                }}
                scroll={{ x: 1500 }}
              />
            </Spin>
          </Card>
        </Content>
      </Layout>

      {/* Detail Modal */}
      <Modal
        title="Invitation Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="update"
            type="primary"
            onClick={() => {
              setDetailModalVisible(false);
              if (selectedInvitation) {
                handleUpdateStatus(selectedInvitation);
              }
            }}
          >
            Update Status
          </Button>,
        ]}
        width={700}
      >
        {selectedInvitation && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{selectedInvitation.id}</Descriptions.Item>
            <Descriptions.Item label="Type">
              {getTypeTag(selectedInvitation.type)}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedInvitation.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Contact Name">
              {selectedInvitation.contact_name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Company/Organization">
              {selectedInvitation.company_name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <a href={`mailto:${selectedInvitation.email}`}>
                {selectedInvitation.email}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedInvitation.phone || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Website">
              {selectedInvitation.website ? (
                <a href={selectedInvitation.website} target="_blank" rel="noopener noreferrer">
                  {selectedInvitation.website}
                </a>
              ) : (
                'N/A'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Message">
              {selectedInvitation.message || 'No message provided'}
            </Descriptions.Item>
            <Descriptions.Item label="User ID">
              {selectedInvitation.user_id || 'N/A (Unauthenticated request)'}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(selectedInvitation.created_at).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {new Date(selectedInvitation.updated_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        title="Update Invitation Status"
        open={statusModalVisible}
        onOk={handleStatusUpdate}
        onCancel={() => setStatusModalVisible(false)}
        confirmLoading={loading}
      >
        {selectedInvitation && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Invitation:</Text>
              <div>
                <Text>{selectedInvitation.company_name || selectedInvitation.contact_name}</Text>
                <br />
                <Text type="secondary">{selectedInvitation.email}</Text>
              </div>
            </div>
            <div>
              <Text strong>Status:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={newStatus}
                onChange={(value) => setNewStatus(value)}
              >
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="contacted">Contacted</Option>
              </Select>
            </div>
            <div>
              <Text strong>Notes (Optional):</Text>
              <TextArea
                rows={4}
                placeholder="Add any notes about this status update..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                style={{ marginTop: 8 }}
              />
            </div>
          </Space>
        )}
      </Modal>
    </Layout>
  );
};

export default Invitations;

