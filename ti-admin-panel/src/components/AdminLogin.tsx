import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { settingsAPI } from '../services/api';
import './AdminLogin.css';

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

const AdminLogin: React.FC<{ onLogin: (username: string) => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true);
    
    try {
      const response = await settingsAPI.loginTeamMember({
        email: values.email,
        password: values.password
      });

      if (response.success && response.data) {
        const displayName = response.data.name || response.data.email || values.email;
        message.success('Login successful!');
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_username', displayName);
        onLogin(displayName);
      } else {
        message.error(response.error || 'Invalid email or password');
      }
    } catch (error: any) {
      const errorMessage = error?.message?.includes('HTTP error!')
        ? error.message
        : 'Login failed. Please try again.';
      message.error(errorMessage);
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
                  src="/piggy-logo.png" 
                  alt="Thrive Initiative" 
                  className="login-logo"
                />
              </div>
              <Text className="login-title">
                THRIVE INITIATIVE
              </Text>
              <Title level={3} className="login-heading">
                Admin Login
              </Title>
            </div>

            <Form
              form={form}
              name="admin-login"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
              requiredMark="optional"
              className="login-form"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                  placeholder="Enter Email"
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
                  placeholder="Enter Password"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  className="login-input"
                />
              </Form.Item>

              <div className="forgot-password">
                <a href="#" className="forgot-link">Forgot your password?</a>
              </div>

              <Form.Item className="login-button-container">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="login-button"
                  block
                >
                  {loading ? 'Signing In...' : 'Login'}
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
