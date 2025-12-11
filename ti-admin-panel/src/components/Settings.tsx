import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Avatar, Button, Card, Row, Col, Input, Select, Table, Tabs, Form, Switch, Modal, message, Dropdown, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserProfile from './UserProfile';
import { settingsAPI } from '../services/api';
import {
  DashboardOutlined, UserOutlined, StarOutlined, RiseOutlined, SettingOutlined,
  CalendarOutlined, CrownOutlined, FileTextOutlined, ExclamationCircleOutlined,
  MenuOutlined, BellOutlined, SearchOutlined, MoreOutlined, UserAddOutlined,
  FilterOutlined, SortAscendingOutlined, SortDescendingOutlined, EditOutlined,
  DownOutlined, ShopOutlined, GiftOutlined, BankOutlined,   LockOutlined,
  TeamOutlined, SecurityScanOutlined, BellOutlined as NotificationOutlined,
  ApiOutlined, GlobalOutlined, LogoutOutlined, CalculatorOutlined, MailOutlined
} from '@ant-design/icons';
import './Settings.css';
import ApiRateLimiting from './ApiRateLimiting';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const Settings: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showApiRateLimiting, setShowApiRateLimiting] = useState(false);
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [isEditUserModalVisible, setIsEditUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Load settings data from API
  const loadSettingsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading settings data from API...');
      const [settingsResponse, teamResponse] = await Promise.all([
        settingsAPI.getSettings(),
        settingsAPI.getTeamMembers()
      ]);
      
      console.log('Settings API responses:', { settingsResponse, teamResponse });
      
      if (settingsResponse.success) {
        setSettingsData(settingsResponse.data);
        // Update personal profile with loaded data
        if (settingsResponse.data) {
          setPersonalProfile((prev: any) => ({
            ...prev,
            ...settingsResponse.data,
            notifications: settingsResponse.data.notifications || {
              email: true,
              push: true,
              sms: false
            }
          }));
        }
      } else {
        setError('Failed to load settings');
        setSettingsData(null);
      }
      
      if (teamResponse.success) {
        setTeamMembers(teamResponse.data);
      } else {
        setError('Failed to load team members');
        setTeamMembers([]);
      }
      
    } catch (error) {
      console.error('Error loading settings data:', error);
      setError('Failed to load settings data');
      setSettingsData(null);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };


  // Load data on component mount
  useEffect(() => {
    loadSettingsData();
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
    } else if (key === 'invitations') {
      navigate('/invitations');
    } else if (key === 'referral-analytics') {
      navigate('/referral-analytics');
    } else if (key === 'geographic-analytics') {
      navigate('/geographic-analytics');
    } else if (key === 'discounts') {
      navigate('/discounts');
    } else if (key === 'reporting') {
      navigate('/reporting');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  const [personalProfile, setPersonalProfile] = useState<any>({
    name: '',
    email: '',
    phone: '',
    role: '',
    notifications: {
      email: true,
      push: true,
      sms: false
    }
  });

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

  const teamColumns = [
    {
      title: 'Team Member',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <Avatar size={32} style={{ backgroundColor: '#DB8633' }}>
            {record.avatar}
          </Avatar>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
      width: 250,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <span className={`role-badge role-${role.toLowerCase().replace(' ', '-')}`}>
          {role}
        </span>
      ),
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span className={`status-badge status-${status.toLowerCase()}`}>
          {status}
        </span>
      ),
      width: 120,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 180,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
            className="edit-user-btn"
          />
          <Button 
            type="text" 
            icon={<MoreOutlined />} 
            className="more-actions-btn"
          />
        </Space>
      ),
      width: 120,
    },
  ];

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsEditUserModalVisible(true);
  };

  const handleAddUser = () => {
    setIsAddUserModalVisible(true);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleProfileUpdate = async (values: any) => {
    try {
      console.log('Updating profile:', values);
      const response = await settingsAPI.updateSettings(values);
      
      if (response.success) {
        setPersonalProfile((prev: any) => ({ ...prev, ...values }));
        message.success('Profile updated successfully!');
      } else {
        message.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordChange = async (values: any) => {
    try {
      console.log('Changing password');
      const response = await settingsAPI.updateSettings({ password: values.newPassword });
      
      if (response.success) {
        message.success('Password changed successfully!');
      } else {
        message.error('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Failed to change password. Please try again.');
    }
  };

  const handleNotificationChange = (key: string, checked: boolean) => {
    setPersonalProfile((prev: any) => ({
      ...prev,
      notifications: {
        ...(prev?.notifications || { email: true, push: true, sms: false }),
        [key]: checked
      }
    }));
    message.success('Notification settings updated!');
  };

  return (
    <Layout className="settings-layout">
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
        className={`standard-sider ${mobileSidebarVisible ? 'mobile-visible' : ''}`}
        width={280}
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
          defaultSelectedKeys={['settings']}
          selectedKeys={[location.pathname === '/settings' ? 'settings' : '']}
          items={menuItems}
          className="standard-menu"
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      {/* Main Content */}
      <Layout className="main-content">
        <Header className="settings-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Settings</Title>
            <Text type="secondary" className="settings-subtitle">Manage your account and team</Text>
          </div>
        </Header>

        <Content className="settings-content">
          <Spin spinning={loading}>
            <div className="content-wrapper">
              <Tabs 
                activeKey={activeTab} 
              onChange={handleTabChange}
              className="settings-tabs"
              items={[
                {
                  key: 'profile',
                  label: (
                    <span>
                      <UserOutlined />
                      Personal Profile
                    </span>
                  ),
                  children: (
                    <div className="tab-content">
                      <Row gutter={[24, 24]}>
                        <Col xs={24} lg={16}>
                          <Card title="Personal Information" className="settings-card">
                            <Form
                              layout="vertical"
                              initialValues={personalProfile}
                              onFinish={handleProfileUpdate}
                            >
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item
                                    label="Full Name"
                                    name="name"
                                    rules={[{ required: true, message: 'Please enter your name' }]}
                                  >
                                    <Input placeholder="Enter your full name" />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                      { required: true, message: 'Please enter your email' },
                                      { type: 'email', message: 'Please enter a valid email' }
                                    ]}
                                  >
                                    <Input placeholder="Enter your email" />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Row gutter={16}>
                                <Col span={12}>
                                  <Form.Item
                                    label="Phone Number"
                                    name="phone"
                                  >
                                    <Input placeholder="Enter your phone number" />
                                  </Form.Item>
                                </Col>
                                <Col span={12}>
                                  <Form.Item
                                    label="Role"
                                    name="role"
                                  >
                                    <Input disabled />
                                  </Form.Item>
                                </Col>
                              </Row>
                              <Form.Item>
                                <Button type="primary" htmlType="submit" className="update-profile-btn">
                                  Update Profile
                                </Button>
                              </Form.Item>
                            </Form>
                          </Card>
                        </Col>
                        <Col xs={24} lg={8}>
                          <Card title="Notification Preferences" className="settings-card">
                            <div className="notification-settings">
                              <div className="notification-item">
                                <Text>Email Notifications</Text>
                                <Switch
                                  checked={personalProfile?.notifications?.email ?? true}
                                  onChange={(checked) => handleNotificationChange('email', checked)}
                                />
                              </div>
                              <div className="notification-item">
                                <Text>Push Notifications</Text>
                                <Switch
                                  checked={personalProfile?.notifications?.push ?? true}
                                  onChange={(checked) => handleNotificationChange('push', checked)}
                                />
                              </div>
                              <div className="notification-item">
                                <Text>SMS Notifications</Text>
                                <Switch
                                  checked={personalProfile?.notifications?.sms ?? false}
                                  onChange={(checked) => handleNotificationChange('sms', checked)}
                                />
                              </div>
                            </div>
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: 'security',
                  label: (
                    <span>
                      <LockOutlined />
                      Security
                    </span>
                  ),
                  children: (
                    <div className="tab-content">
                      <Card title="Change Password" className="settings-card">
                        <Form
                          layout="vertical"
                          onFinish={handlePasswordChange}
                        >
                          <Form.Item
                            label="Current Password"
                            name="currentPassword"
                            rules={[{ required: true, message: 'Please enter your current password' }]}
                          >
                            <Input.Password placeholder="Enter current password" />
                          </Form.Item>
                          <Form.Item
                            label="New Password"
                            name="newPassword"
                            rules={[
                              { required: true, message: 'Please enter a new password' },
                              { min: 8, message: 'Password must be at least 8 characters' }
                            ]}
                          >
                            <Input.Password placeholder="Enter new password" />
                          </Form.Item>
                          <Form.Item
                            label="Confirm New Password"
                            name="confirmPassword"
                            rules={[
                              { required: true, message: 'Please confirm your new password' },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('Passwords do not match'));
                                },
                              }),
                            ]}
                          >
                            <Input.Password placeholder="Confirm new password" />
                          </Form.Item>
                          <Form.Item>
                            <Button type="primary" htmlType="submit" className="change-password-btn">
                              Change Password
                            </Button>
                          </Form.Item>
                        </Form>
                      </Card>
                    </div>
                  )
                },
                {
                  key: 'team',
                  label: (
                    <span>
                      <TeamOutlined />
                      Team Management
                    </span>
                  ),
                  children: (
                    <div className="tab-content">
                      <div className="team-header">
                        <div className="team-info">
                          <Title level={4} style={{ margin: 0 }}>Team Members</Title>
                          <Text type="secondary">{teamMembers.length} team members</Text>
                        </div>
                        <Button 
                          type="primary" 
                          icon={<UserAddOutlined />}
                          onClick={handleAddUser}
                          className="add-team-member-btn"
                        >
                          Add Team Member
                        </Button>
                      </div>
                      <Table
                        columns={teamColumns}
                        dataSource={teamMembers}
                        pagination={false}
                        className="team-table"
                      />
                    </div>
                  )
                },
                {
                  key: 'api-rate-limiting',
                  label: (
                    <span>
                      <ApiOutlined />
                      API Rate Limiting
                    </span>
                  ),
                  children: (
                    <div className="tab-content">
                      <div className="api-rate-limiting-section">
                        <div className="api-rate-limiting-header">
                          <Title level={4} style={{ margin: 0 }}>API Rate Limiting Configuration</Title>
                          <Text type="secondary">Configure and monitor API rate limiting rules to protect your system</Text>
                        </div>
                        <div className="api-rate-limiting-content">
                          <Card className="api-rate-limiting-card">
                            <div className="api-rate-limiting-overview">
                              <Row gutter={[24, 24]}>
                                <Col span={8}>
                                  <div className="overview-item">
                                    <div className="overview-icon">
                                      <ApiOutlined style={{ color: '#324E58' }} />
                                    </div>
                                    <div className="overview-content">
                                      <Text strong>Active Rules</Text>
                                      <Text type="secondary">5 rules configured</Text>
                                    </div>
                                  </div>
                                </Col>
                                <Col span={8}>
                                  <div className="overview-item">
                                    <div className="overview-icon">
                                      <SecurityScanOutlined style={{ color: '#DB8633' }} />
                                    </div>
                                    <div className="overview-content">
                                      <Text strong>System Status</Text>
                                      <Text type="secondary">Rate limiting enabled</Text>
                                    </div>
                                  </div>
                                </Col>
                                <Col span={8}>
                                  <div className="overview-item">
                                    <div className="overview-icon">
                                      <BellOutlined style={{ color: '#DB8633' }} />
                                    </div>
                                    <div className="overview-content">
                                      <Text strong>Recent Alerts</Text>
                                      <Text type="secondary">2 warnings today</Text>
                                    </div>
                                  </div>
                                </Col>
                              </Row>
                            </div>
                            <div className="api-rate-limiting-actions">
                              <Button 
                                type="primary" 
                                icon={<ApiOutlined />}
                                onClick={() => setShowApiRateLimiting(true)}
                              >
                                Configure Rate Limiting
                              </Button>
                              <Button icon={<SecurityScanOutlined />}>
                                View System Status
                              </Button>
                              <Button icon={<BellOutlined />}>
                                Alert History
                              </Button>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </div>
                  )
                }
              ]}
            />
            </div>
          </Spin>
        </Content>
      </Layout>

      {/* Add User Modal */}
      <Modal
        title="Add Team Member"
        open={isAddUserModalVisible}
        onCancel={() => setIsAddUserModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: 'Please select a role' }]}
              >
                <Select placeholder="Select role">
                  <Option value="Super Admin">Super Admin</Option>
                  <Option value="Admin">Admin</Option>
                  <Option value="Manager">Manager</Option>
                  <Option value="User">User</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Member
              </Button>
              <Button onClick={() => setIsAddUserModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit Team Member"
        open={isEditUserModalVisible}
        onCancel={() => setIsEditUserModalVisible(false)}
        footer={null}
        width={600}
      >
        {editingUser && (
          <Form layout="vertical" initialValues={editingUser}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ required: true, message: 'Please enter full name' }]}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="Enter email" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true, message: 'Please select a role' }]}
                >
                  <Select placeholder="Select role">
                    <Option value="Super Admin">Super Admin</Option>
                    <Option value="Admin">Admin</Option>
                    <Option value="Manager">Manager</Option>
                    <Option value="User">User</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select status">
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Update Member
                </Button>
                <Button onClick={() => setIsEditUserModalVisible(false)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* API Rate Limiting Modal */}
      <Modal
        title="API Rate Limiting Configuration"
        open={showApiRateLimiting}
        onCancel={() => setShowApiRateLimiting(false)}
        footer={null}
        width={1200}
        className="api-rate-limiting-modal"
      >
        <ApiRateLimiting />
      </Modal>
    </Layout>
  );
};

export default Settings; 