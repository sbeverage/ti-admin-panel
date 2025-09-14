import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import './AdminLogin.css';

const { Title, Text } = Typography;

interface LoginFormData {
  username: string;
  password: string;
}

const AdminLogin: React.FC<{ onLogin: (username: string) => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true);
    
    try {
      // Simulate API call - replace with real authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check credentials (in production, this would be server-side)
      if (values.username === 'admin' && values.password === 'ThriveAdmin2024!') {
        message.success('Login successful!');
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_username', values.username);
        onLogin(values.username);
      } else {
        message.error('Invalid username or password');
      }
    } catch (error) {
      message.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-background">
        <div className="login-content">
          <Card className="login-card">
            <div className="login-header">
              <div className="logo-container">
                <img 
                  src="/white-logo.png" 
                  alt="Thrive Initiative" 
                  className="login-logo"
                />
              </div>
              <Title level={2} className="login-title">
                Admin Panel
              </Title>
              <Text type="secondary" className="login-subtitle">
                Sign in to manage your platform
              </Text>
            </div>

            <Form
              form={form}
              name="admin-login"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
              className="login-form"
            >
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: 'Please enter your username' },
                  { min: 3, message: 'Username must be at least 3 characters' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="Enter your username"
                  className="login-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter your password' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Enter your password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  className="login-input"
                />
              </Form.Item>

              <Form.Item className="login-button-container">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="login-button"
                  block
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            <div className="login-footer">
              <Text type="secondary" className="footer-text">
                Secure admin access for Thrive Initiative
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
