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
      if (values.username === 'admin' && values.password === 'Thr1v3@dm1n!') {
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
              className="login-form"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: 'Please enter your username' },
                  { min: 3, message: 'Username must be at least 3 characters' }
                ]}
              >
                <Input
                  placeholder="Enter Username"
                  className="login-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
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
