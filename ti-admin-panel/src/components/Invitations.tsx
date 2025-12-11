import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Button, Input, Select, Table, Tag, Modal, message, Spin, Card, Descriptions, Tooltip, Checkbox } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { invitationsAPI, donorAPI } from '../services/api';
import UserProfile from './UserProfile';
import {
  DashboardOutlined, UserOutlined, SettingOutlined,
  MenuOutlined, SearchOutlined, ShopOutlined, HeartOutlined,
  TeamOutlined, GlobalOutlined, CalculatorOutlined, ExclamationCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, MailOutlined, EyeOutlined,
  StarOutlined, RiseOutlined, GiftOutlined, BankOutlined, CalendarOutlined
} from '@ant-design/icons';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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

  const handleInviteUser = async (invitation: Invitation, notifyDonors: boolean = false) => {
    try {
      setInviting(true);
      const response = await invitationsAPI.inviteUser(invitation.id);

      if (response.success) {
        message.success('User account created and invitation email sent!');
        
        // If this is a beneficiary and notifyDonors is true, notify all donors who requested this beneficiary
        if (invitation.type === 'beneficiary' && notifyDonors) {
          try {
            // Get all donors who have this beneficiary selected
            const donorsResponse = await donorAPI.getDonors(1, 1000);
            if (donorsResponse.success && donorsResponse.data) {
              const relevantDonors = donorsResponse.data.filter((donor: any) => 
                donor.beneficiary_name === invitation.company_name || 
                donor.beneficiary_id === response.data?.beneficiary_id
              );
              
              // Send notification emails to all relevant donors
              const emailPromises = relevantDonors.map((donor: any) => 
                donorAPI.resendInvitation(donor.id).catch(err => {
                  console.error(`Failed to notify donor ${donor.email}:`, err);
                  return null;
                })
              );
              
              await Promise.all(emailPromises);
              message.success(`Notified ${relevantDonors.length} donor(s) about the new beneficiary!`);
            }
          } catch (error: any) {
            console.error('Error notifying donors:', error);
            // Don't fail the whole operation if donor notification fails
            message.warning('Beneficiary added, but some donor notifications may have failed');
          }
        }
        
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

  const handleBulkApprove = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Please select invitations to approve');
      return;
    }

    Modal.confirm({
      title: 'Bulk Approve & Notify Donors?',
      content: 'This will approve all selected invitations, create user accounts, and notify all donors who requested these beneficiaries. Continue?',
      okText: 'Yes, approve all',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setBulkActionLoading(true);
          const selectedInvitations = invitations.filter(inv => selectedRowKeys.includes(inv.id));
          
          // Step 1: Approve all selected invitations
          const approvePromises = selectedInvitations.map(inv => 
            invitationsAPI.updateInvitationStatus(inv.id, 'approved')
          );
          
          const approveResults = await Promise.allSettled(approvePromises);
          const approved = approveResults.filter(r => r.status === 'fulfilled').length;
          const approveFailed = approveResults.filter(r => r.status === 'rejected').length;

          if (approved > 0) {
            message.success(`Successfully approved ${approved} invitation(s)`);
            
            // Step 2: Create user accounts for all approved invitations
            const invitePromises = selectedInvitations.map(inv => 
              invitationsAPI.inviteUser(inv.id).catch(err => {
                console.error(`Failed to invite user for invitation ${inv.id}:`, err);
                return null;
              })
            );
            
            await Promise.allSettled(invitePromises);
            
            // Step 3: Group beneficiaries and notify donors
            const beneficiaryGroups = new Map<string, Invitation[]>();
            selectedInvitations.forEach(inv => {
              if (inv.type === 'beneficiary') {
                const key = inv.company_name || inv.contact_name;
                if (!beneficiaryGroups.has(key)) {
                  beneficiaryGroups.set(key, []);
                }
                beneficiaryGroups.get(key)!.push(inv);
              }
            });

            // Notify all donors who requested these beneficiaries
            if (beneficiaryGroups.size > 0) {
              try {
                const donorsResponse = await donorAPI.getDonors(1, 1000);
                if (donorsResponse.success && donorsResponse.data) {
                  const notifiedDonors = new Set<number>();
                  
                  // For each beneficiary group, notify relevant donors
                  Array.from(beneficiaryGroups.entries()).forEach(([beneficiaryName, invs]) => {
                    const relevantDonors = donorsResponse.data.filter((donor: any) => 
                      donor.beneficiary_name === beneficiaryName ||
                      donor.beneficiary_id === invs[0].id // Fallback to invitation ID if name doesn't match
                    );
                    
                    relevantDonors.forEach((donor: any) => {
                      if (!notifiedDonors.has(donor.id)) {
                        notifiedDonors.add(donor.id);
                        donorAPI.resendInvitation(donor.id).catch(err => {
                          console.error(`Failed to notify donor ${donor.email}:`, err);
                        });
                      }
                    });
                  });
                  
                  if (notifiedDonors.size > 0) {
                    message.success(`Notified ${notifiedDonors.size} donor(s) about approved beneficiaries!`);
                  } else {
                    message.info('No donors found to notify for these beneficiaries');
                  }
                }
              } catch (error: any) {
                console.error('Error notifying donors:', error);
                message.warning('Approvals completed, but some donor notifications may have failed');
              }
            }
          }
          
          if (approveFailed > 0) {
            message.error(`Failed to approve ${approveFailed} invitation(s)`);
          }
          
          setSelectedRowKeys([]);
          loadInvitations();
        } catch (error: any) {
          console.error('Error bulk approving:', error);
          message.error(error.message || 'Failed to approve invitations');
        } finally {
          setBulkActionLoading(false);
        }
      }
    });
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
          {record.status === 'approved' && record.type === 'beneficiary' && (
            <Tooltip title="Send Invitation Email & Notify Donors">
              <Button
                type="link"
                icon={<MailOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Notify Donors?',
                    content: 'Do you want to notify all donors who requested this beneficiary?',
                    okText: 'Yes, notify donors',
                    cancelText: 'No, just send invitation',
                    onOk: () => handleInviteUser(record, true),
                    onCancel: () => handleInviteUser(record, false),
                  });
                }}
                loading={inviting}
              />
            </Tooltip>
          )}
          {record.status === 'approved' && record.type === 'vendor' && (
            <Tooltip title="Send Invitation Email">
              <Button
                type="link"
                icon={<MailOutlined />}
                onClick={() => handleInviteUser(record, false)}
                loading={inviting}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
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
          defaultSelectedKeys={['invitations']}
          selectedKeys={[location.pathname === '/invitations' ? 'invitations' : '']}
          items={menuItems}
          className="standard-menu"
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      {/* Main Content */}
      <Layout className="standard-main-content">
        <Header className="invitations-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Invitations</Title>
            <Text type="secondary">
              Manage beneficiary and vendor invitation requests
            </Text>
          </div>
          <div className="header-right">
            {selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleBulkApprove}
                loading={bulkActionLoading}
              >
                Approve Selected ({selectedRowKeys.length})
              </Button>
            )}
          </div>
        </Header>

        <Content className="invitations-content">
          <div className="content-wrapper">

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
                rowSelection={{
                  selectedRowKeys,
                  onChange: (selectedKeys) => {
                    setSelectedRowKeys(selectedKeys);
                  },
                  getCheckboxProps: (record) => ({
                    disabled: record.status !== 'pending',
                  }),
                }}
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
          </div>
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

