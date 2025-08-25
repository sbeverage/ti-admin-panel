import React, { useState } from 'react';
import { Card, Typography, Form, Input, InputNumber, Switch, Button, Table, Tag, Space, Row, Col, Statistic, Alert, Divider, Select, TimePicker, message, Badge, Tabs } from 'antd';
import {
  ApiOutlined,
  SafetyOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  UserOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import './ApiRateLimiting.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface RateLimitRule {
  key: string;
  endpoint: string;
  method: string;
  limit: number;
  window: string;
  userType: string;
  status: 'active' | 'inactive' | 'warning';
  currentUsage: number;
  lastReset: string;
  description: string;
}

interface ApiEndpoint {
  key: string;
  path: string;
  method: string;
  category: string;
  currentLimit: number;
  currentUsage: number;
  status: 'normal' | 'high' | 'critical';
  lastAccessed: string;
  responseTime: number;
}

const ApiRateLimiting: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('rules');
  const [editingRule, setEditingRule] = useState<RateLimitRule | null>(null);

  // Rate Limiting Rules Data
  const rateLimitRules: RateLimitRule[] = [
    {
      key: '1',
      endpoint: '/api/auth/login',
      method: 'POST',
      limit: 5,
      window: '15 minutes',
      userType: 'Anonymous',
      status: 'active',
      currentUsage: 2,
      lastReset: '2024-01-15 14:30:00',
      description: 'Prevent brute force attacks on login'
    },
    {
      key: '2',
      endpoint: '/api/users',
      method: 'GET',
      limit: 100,
      window: '1 hour',
      userType: 'Authenticated',
      status: 'active',
      currentUsage: 45,
      lastReset: '2024-01-15 15:00:00',
      description: 'Standard user data access limit'
    },
    {
      key: '3',
      endpoint: '/api/admin/*',
      method: 'ALL',
      limit: 1000,
      window: '1 hour',
      userType: 'Admin',
      status: 'active',
      currentUsage: 234,
      lastReset: '2024-01-15 15:00:00',
      description: 'Admin panel access limits'
    },
    {
      key: '4',
      endpoint: '/api/analytics',
      method: 'GET',
      limit: 50,
      window: '1 hour',
      userType: 'Authenticated',
      status: 'warning',
      currentUsage: 48,
      lastReset: '2024-01-15 15:00:00',
      description: 'Analytics data access limit'
    },
    {
      key: '5',
      endpoint: '/api/upload',
      method: 'POST',
      limit: 10,
      window: '1 hour',
      userType: 'Authenticated',
      status: 'active',
      currentUsage: 3,
      lastReset: '2024-01-15 15:00:00',
      description: 'File upload rate limiting'
    }
  ];

  // API Endpoints Monitoring Data
  const apiEndpoints: ApiEndpoint[] = [
    {
      key: '1',
      path: '/api/auth/login',
      method: 'POST',
      category: 'Authentication',
      currentLimit: 5,
      currentUsage: 2,
      status: 'normal',
      lastAccessed: '2024-01-15 14:45:23',
      responseTime: 125
    },
    {
      key: '2',
      path: '/api/users',
      method: 'GET',
      category: 'User Management',
      currentLimit: 100,
      currentUsage: 45,
      status: 'normal',
      lastAccessed: '2024-01-15 14:50:12',
      responseTime: 89
    },
    {
      key: '3',
      path: '/api/analytics',
      method: 'GET',
      category: 'Analytics',
      currentLimit: 50,
      currentUsage: 48,
      status: 'high',
      lastAccessed: '2024-01-15 14:52:45',
      responseTime: 156
    },
    {
      key: '4',
      path: '/api/admin/dashboard',
      method: 'GET',
      category: 'Admin',
      currentLimit: 1000,
      currentUsage: 234,
      status: 'normal',
      lastAccessed: '2024-01-15 14:48:33',
      responseTime: 203
    },
    {
      key: '5',
      path: '/api/upload',
      method: 'POST',
      category: 'File Management',
      currentLimit: 10,
      currentUsage: 3,
      status: 'normal',
      lastAccessed: '2024-01-15 14:47:18',
      responseTime: 445
    }
  ];

  // Rate Limiting Statistics
  const rateLimitStats = [
    { title: 'Active Rules', value: 5, icon: <SecurityScanOutlined />, color: '#DB8633' },
    { title: 'Blocked Requests', value: 127, icon: <CloseCircleOutlined />, color: '#324E58' },
    { title: 'Average Response Time', value: '203ms', icon: <ClockCircleOutlined />, color: '#324E58' },
    { title: 'Total API Calls', value: '12.4K', icon: <ApiOutlined />, color: '#324E58' },
    { title: 'Rate Limit Hits', value: 23, icon: <WarningOutlined />, color: '#DB8633' },
    { title: 'Success Rate', value: '98.2%', icon: <CheckCircleOutlined />, color: '#DB8633' }
  ];

  const ruleColumns = [
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      render: (endpoint: string) => (
        <div className="endpoint-cell">
          <Text code className="endpoint-path">{endpoint}</Text>
        </div>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag 
          color={method === 'GET' ? 'blue' : method === 'POST' ? 'green' : method === 'PUT' ? 'orange' : method === 'DELETE' ? 'red' : 'default'}
          className="method-tag"
        >
          {method}
        </Tag>
      ),
    },
    {
      title: 'Limit',
      dataIndex: 'limit',
      key: 'limit',
      render: (limit: number) => <Text strong>{limit}</Text>,
    },
    {
      title: 'Window',
      dataIndex: 'window',
      key: 'window',
      render: (window: string) => <Text>{window}</Text>,
    },
    {
      title: 'User Type',
      dataIndex: 'userType',
      key: 'userType',
      render: (userType: string) => (
        <Tag color={userType === 'Admin' ? 'red' : userType === 'Authenticated' ? 'blue' : 'default'}>
          {userType}
        </Tag>
      ),
    },
    {
      title: 'Current Usage',
      key: 'usage',
      render: (record: RateLimitRule) => (
        <div className="usage-cell">
          <Text>{record.currentUsage}</Text>
          <Text type="secondary">/ {record.limit}</Text>
          <div className="usage-bar">
            <div 
              className={`usage-fill ${record.currentUsage / record.limit > 0.8 ? 'high' : 'normal'}`}
              style={{ width: `${(record.currentUsage / record.limit) * 100}%` }}
            ></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'active' ? 'success' : status === 'warning' ? 'warning' : 'default'} 
          text={status === 'active' ? 'Active' : status === 'warning' ? 'Warning' : 'Inactive'} 
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: RateLimitRule) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditRule(record)}
          >
            Edit
          </Button>
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            size="small"
          >
            View
          </Button>
        </Space>
      ),
    }
  ];

  const endpointColumns = [
    {
      title: 'API Path',
      dataIndex: 'path',
      key: 'path',
      render: (path: string) => (
        <div className="api-path">
          <Text code>{path}</Text>
        </div>
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => (
        <Tag 
          color={method === 'GET' ? 'blue' : method === 'POST' ? 'green' : method === 'PUT' ? 'orange' : method === 'DELETE' ? 'red' : 'default'}
          className="method-tag"
        >
          {method}
        </Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue" className="category-tag">
          {category}
        </Tag>
      ),
    },
    {
      title: 'Usage',
      key: 'usage',
      render: (record: ApiEndpoint) => (
        <div className="usage-cell">
          <Text>{record.currentUsage}</Text>
          <Text type="secondary">/ {record.currentLimit}</Text>
          <div className="usage-bar">
            <div 
              className={`usage-fill ${record.status === 'critical' ? 'critical' : record.status === 'high' ? 'high' : 'normal'}`}
              style={{ width: `${(record.currentUsage / record.currentLimit) * 100}%` }}
            ></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag 
          color={status === 'critical' ? 'red' : status === 'high' ? 'orange' : 'green'}
          className="status-tag"
        >
          {status === 'critical' ? 'Critical' : status === 'high' ? 'High' : 'Normal'}
        </Tag>
      ),
    },
    {
      title: 'Response Time',
      dataIndex: 'responseTime',
      key: 'responseTime',
      render: (time: number) => (
        <Text className={time > 300 ? 'slow-response' : time > 150 ? 'medium-response' : 'fast-response'}>
          {time}ms
        </Text>
      ),
    },
    {
      title: 'Last Accessed',
      dataIndex: 'lastAccessed',
      key: 'lastAccessed',
      render: (time: string) => <Text type="secondary">{time}</Text>,
    }
  ];

  const handleEditRule = (rule: RateLimitRule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      endpoint: rule.endpoint,
      method: rule.method,
      limit: rule.limit,
      window: rule.window,
      userType: rule.userType,
      description: rule.description
    });
  };

  const handleSaveRule = async (values: any) => {
    try {
      setLoading(true);
      // Here you would typically save to your backend
      console.log('Saving rate limit rule:', values);
      message.success('Rate limit rule updated successfully');
      setEditingRule(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update rate limit rule');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    form.resetFields();
  };

  return (
    <div className="api-rate-limiting">
      <div className="page-header">
        <Title level={2} className="page-title">
          <ApiOutlined /> API Rate Limiting
        </Title>
        <Paragraph className="page-description">
          Configure and monitor API rate limiting rules to protect your system from abuse and ensure fair usage.
        </Paragraph>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="stats-cards">
        {rateLimitStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={index}>
            <Card className="stat-card">
              <div className="stat-content">
                <div className="stat-icon" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="stat-info">
                  <Statistic 
                    title={stat.title} 
                    value={stat.value}
                    valueStyle={{ color: stat.color }}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Card className="main-content-card">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="rate-limiting-tabs"
          items={[
            {
              key: 'rules',
                                  label: (
                      <span>
                        <SecurityScanOutlined />
                        Rate Limiting Rules
                      </span>
                    ),
              children: (
                <div className="rules-content">
                  <div className="rules-header">
                    <div className="rules-info">
                      <Title level={4}>Rate Limiting Rules</Title>
                      <Text type="secondary">Configure limits for different API endpoints and user types</Text>
                    </div>
                    <Button type="primary" icon={<SettingOutlined />}>
                      Add New Rule
                    </Button>
                  </div>
                  
                  <Table 
                    dataSource={rateLimitRules} 
                    columns={ruleColumns}
                    pagination={false}
                    className="rules-table"
                    rowClassName="rule-row"
                  />
                </div>
              )
            },
            {
              key: 'monitoring',
              label: (
                <span>
                  <EyeOutlined />
                  API Monitoring
                </span>
              ),
              children: (
                <div className="monitoring-content">
                  <div className="monitoring-header">
                    <Title level={4}>API Endpoint Monitoring</Title>
                    <Text type="secondary">Real-time monitoring of API usage and performance</Text>
                  </div>
                  
                  <Table 
                    dataSource={apiEndpoints} 
                    columns={endpointColumns}
                    pagination={false}
                    className="endpoints-table"
                    rowClassName="endpoint-row"
                  />
                </div>
              )
            },
            {
              key: 'settings',
              label: (
                <span>
                  <SettingOutlined />
                  Global Settings
                </span>
              ),
              children: (
                <div className="settings-content">
                  <div className="settings-section">
                    <Title level={4}>Global Rate Limiting Settings</Title>
                    <Form
                      form={form}
                      layout="vertical"
                      className="settings-form"
                      onFinish={handleSaveRule}
                    >
                      <Row gutter={[24, 16]}>
                        <Col span={12}>
                          <Form.Item
                            name="globalLimit"
                            label="Global Request Limit"
                            rules={[{ required: true, message: 'Please enter the global limit' }]}
                          >
                            <InputNumber
                              min={1}
                              max={10000}
                              className="limit-input"
                              placeholder="1000"
                              addonAfter="requests"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="globalWindow"
                            label="Time Window"
                            rules={[{ required: true, message: 'Please select the time window' }]}
                          >
                            <Select placeholder="Select time window">
                              <Option value="1min">1 Minute</Option>
                              <Option value="5min">5 Minutes</Option>
                              <Option value="15min">15 Minutes</Option>
                              <Option value="1hour">1 Hour</Option>
                              <Option value="1day">1 Day</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[24, 16]}>
                        <Col span={12}>
                          <Form.Item
                            name="enableRateLimiting"
                            label="Enable Rate Limiting"
                            valuePropName="checked"
                          >
                            <Switch 
                              checkedChildren="Enabled" 
                              unCheckedChildren="Disabled"
                              defaultChecked
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="enableLogging"
                            label="Enable Request Logging"
                            valuePropName="checked"
                          >
                            <Switch 
                              checkedChildren="Enabled" 
                              unCheckedChildren="Disabled"
                              defaultChecked
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={[24, 16]}>
                        <Col span={12}>
                          <Form.Item
                            name="blockDuration"
                            label="Block Duration"
                            rules={[{ required: true, message: 'Please enter the block duration' }]}
                          >
                            <InputNumber
                              min={1}
                              max={1440}
                              className="duration-input"
                              placeholder="15"
                              addonAfter="minutes"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="whitelistIps"
                            label="Whitelist IPs"
                          >
                            <Input.TextArea
                              rows={3}
                              placeholder="Enter IP addresses separated by commas"
                              className="whitelist-input"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item>
                        <Space>
                          <Button 
                            type="primary" 
                            htmlType="submit" 
                            icon={<SaveOutlined />}
                            loading={loading}
                          >
                            Save Settings
                          </Button>
                          <Button icon={<ReloadOutlined />}>
                            Reset to Defaults
                          </Button>
                        </Space>
                      </Form.Item>
                    </Form>
                  </div>

                  <Divider />

                  <div className="settings-section">
                    <Title level={4}>Advanced Configuration</Title>
                    <Alert
                      message="Advanced Settings"
                      description="These settings affect system performance and security. Modify with caution."
                      type="warning"
                      showIcon
                      className="advanced-alert"
                    />
                    
                    <Row gutter={[24, 16]} className="advanced-settings">
                      <Col span={12}>
                        <Form.Item
                          name="burstLimit"
                          label="Burst Limit"
                        >
                          <InputNumber
                            min={1}
                            max={1000}
                            className="burst-input"
                            placeholder="50"
                            addonAfter="requests"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="rateLimitStrategy"
                          label="Rate Limiting Strategy"
                        >
                          <Select placeholder="Select strategy">
                            <Option value="sliding">Sliding Window</Option>
                            <Option value="fixed">Fixed Window</Option>
                            <Option value="leaky">Leaky Bucket</Option>
                            <Option value="token">Token Bucket</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Edit Rule Modal */}
      {editingRule && (
        <Card 
          title="Edit Rate Limiting Rule" 
          className="edit-rule-modal"
          extra={
            <Button type="text" icon={<CloseCircleOutlined />} onClick={handleCancelEdit}>
              Cancel
            </Button>
          }
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveRule}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="endpoint"
                  label="API Endpoint"
                  rules={[{ required: true, message: 'Please enter the endpoint' }]}
                >
                  <Input placeholder="/api/endpoint" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="method"
                  label="HTTP Method"
                  rules={[{ required: true, message: 'Please select the method' }]}
                >
                  <Select placeholder="Select method">
                    <Option value="GET">GET</Option>
                    <Option value="POST">POST</Option>
                    <Option value="PUT">PUT</Option>
                    <Option value="DELETE">DELETE</Option>
                    <Option value="ALL">ALL</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="limit"
                  label="Request Limit"
                  rules={[{ required: true, message: 'Please enter the limit' }]}
                >
                  <InputNumber
                    min={1}
                    max={10000}
                    className="limit-input"
                    placeholder="100"
                    addonAfter="requests"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="window"
                  label="Time Window"
                  rules={[{ required: true, message: 'Please select the time window' }]}
                >
                  <Select placeholder="Select time window">
                    <Option value="1 minute">1 Minute</Option>
                    <Option value="5 minutes">5 Minutes</Option>
                    <Option value="15 minutes">15 Minutes</Option>
                    <Option value="1 hour">1 Hour</Option>
                    <Option value="1 day">1 Day</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="userType"
                  label="User Type"
                  rules={[{ required: true, message: 'Please select the user type' }]}
                >
                  <Select placeholder="Select user type">
                    <Option value="Anonymous">Anonymous</Option>
                    <Option value="Authenticated">Authenticated</Option>
                    <Option value="Admin">Admin</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <Input placeholder="Enter rule description" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Update Rule
                </Button>
                <Button onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default ApiRateLimiting;
