import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import './Login.css';

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const onFinish = async (values: LoginFormData) => {
    setLoading(true);
    // TODO: Implement login logic here
    console.log('Login attempt:', values);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // TODO: Handle successful login
    }, 1000);
  };

  const handleImageError = () => {
    setShowFallback(true);
  };

  return (
    <div className="login-container">
      <div className="login-card-wrapper">
        <Card className="login-card">
          <div className="logo-section">
            <div className="logo">
              {/* Piggy Bank Logo */}
              {!showFallback && (
                <img 
                  src="/piggy-logo.png" 
                  alt="Thrive Initiative Piggy Bank Logo" 
                  className="piggy-logo"
                  onError={handleImageError}
                />
              )}
              {showFallback && (
                <div style={{ fontSize: '48px', color: '#DB8633' }}>
                  🐷🌱
                </div>
              )}
            </div>
            
            {/* Text Logo - You can use either the image or text version */}
            <div className="text-logo">
              {/* Option 1: Use the text logo image */}
              <img 
                src="/text-logo.png" 
                alt="THRIVE INITIATIVE" 
                className="text-logo-image"
                style={{ maxWidth: '100%', height: 'auto' }}
                onError={() => {
                  // If image fails, fall back to text version
                  document.querySelector('.text-logo-text')?.classList.remove('hidden');
                  document.querySelector('.text-logo-image')?.classList.add('hidden');
                }}
              />
              
              {/* Option 2: Text version (fallback) */}
              <div className="text-logo-text hidden">
                <Title level={2} className="brand-name">
                  THRIVE INITIATIVE
                </Title>
                <div className="separator-line"></div>
                <Text className="tagline">
                  Change4Good.<span className="org">org</span>
                </Text>
              </div>
            </div>
          </div>

          <Title level={3} className="login-title">Login</Title>

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter Email"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please enter your password!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter Password"
                className="login-input"
              />
            </Form.Item>

            <div className="forgot-password">
              <Text className="forgot-link">Forgot your password?</Text>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                loading={loading}
                block
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login; 