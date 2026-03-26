import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space, Modal, Alert } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { settingsAPI, TI_ADMIN_LOGIN_DEBUG_KEY } from '../services/api';
import './AdminLogin.css';

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

/** Map sessionStorage diagnostic payload + toast text to an operator hint (no network round-trip). */
function hintFromParsedDiag(parsed: unknown, summary: string): string | null {
  const sum = summary.toLowerCase();
  const snip = (() => {
    if (!parsed || typeof parsed !== 'object') return '';
    const s = (parsed as Record<string, unknown>).snippet;
    return typeof s === 'string' ? s.toLowerCase() : '';
  })();

  if (!parsed || typeof parsed !== 'object') {
    if (sum.includes('invalid jwt')) {
      return 'Supabase rejected the anon JWT. Set REACT_APP_SUPABASE_ANON_KEY to the current anon public key (Dashboard → Settings → API), redeploy, retry.';
    }
    if (sum.includes('admin auth failed') || sum.includes('admin secret')) {
      return 'REACT_APP_ADMIN_SECRET must match the Edge Function secret ADMIN_SECRET_KEY in Supabase. Redeploy after changing it.';
    }
    return null;
  }

  const d = parsed as Record<string, unknown>;
  const status = typeof d.status === 'number' ? d.status : NaN;
  const kind = typeof d.kind === 'string' ? d.kind : '';

  if (kind === 'network') {
    return 'The browser never got a response. Check VPN/ad blockers, corporate proxy, and that HTTPS requests to *.supabase.co are allowed.';
  }
  if (kind === 'bad-json') {
    return 'The response was not JSON (wrong host, HTML error page, or proxy). Confirm REACT_APP_API_BASE_URL and inspect the Network tab for this request.';
  }
  if (kind === 'http' && status === 404) {
    return 'Wrong URL path (404). Ensure the resolved base ends with …/functions/v1/api/admin. The app normalizes common mistakes; fix REACT_APP_API_BASE_URL if needed and redeploy.';
  }
  if (kind === 'http' && status === 401) {
    if (snip.includes('invalid jwt') || sum.includes('invalid jwt')) {
      return 'Anon key or Bearer token rejected at the gateway. Set REACT_APP_SUPABASE_ANON_KEY to the project anon key and redeploy.';
    }
    if (snip.includes('unauthorized admin')) {
      return 'REACT_APP_ADMIN_SECRET must equal ADMIN_SECRET_KEY in Supabase (Edge secrets), then redeploy. In Vercel, remove wrapping quotes/spaces from the value; the app now strips quotes/CR. Or delete REACT_APP_ADMIN_SECRET to fall back to the default only if it still matches Supabase.';
    }
    if (snip.includes('invalid email or password') || sum.includes('invalid email or password')) {
      return 'API and secrets are working; credentials failed. Reset password below, or in Supabase verify admin_team_members has your email, status active, and a password_hash.';
    }
  }
  if (kind === 'success-false') {
    return 'Handler returned success: false. Use the snippet below; often invalid credentials or inactive account.';
  }
  return null;
}

const AdminLogin: React.FC<{ onLogin: (username: string) => void }> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [loginDiagOpen, setLoginDiagOpen] = useState(false);
  const [loginDiagSummary, setLoginDiagSummary] = useState('');
  const [loginDiagJson, setLoginDiagJson] = useState('');
  const [loginDiagHint, setLoginDiagHint] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();

  const openLoginDiagModal = (summary: string) => {
    setLoginDiagSummary(summary);
    try {
      let raw = sessionStorage.getItem(TI_ADMIN_LOGIN_DEBUG_KEY);
      if (!raw && typeof window !== 'undefined') {
        const w = window as unknown as { __TI_ADMIN_LOGIN_LAST__?: Record<string, unknown> };
        if (w.__TI_ADMIN_LOGIN_LAST__) {
          raw = JSON.stringify(w.__TI_ADMIN_LOGIN_LAST__);
        }
      }
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        setLoginDiagJson(JSON.stringify(parsed, null, 2));
        setLoginDiagHint(hintFromParsedDiag(parsed, summary));
      } else {
        setLoginDiagJson('');
        setLoginDiagHint(hintFromParsedDiag(null, summary));
      }
    } catch {
      setLoginDiagJson('');
      setLoginDiagHint(hintFromParsedDiag(null, summary));
    }
    setLoginDiagOpen(true);
  };

  const copyLoginDiagnostics = async () => {
    try {
      let raw = sessionStorage.getItem(TI_ADMIN_LOGIN_DEBUG_KEY);
      if (!raw && typeof window !== 'undefined') {
        const w = window as unknown as { __TI_ADMIN_LOGIN_LAST__?: Record<string, unknown> };
        if (w.__TI_ADMIN_LOGIN_LAST__) raw = JSON.stringify(w.__TI_ADMIN_LOGIN_LAST__);
      }
      if (!raw) {
        message.warning('No diagnostics yet. Submit login once, then try again.');
        return;
      }
      await navigator.clipboard.writeText(raw);
      message.success('Copied login diagnostics');
    } catch {
      message.error('Could not copy to clipboard. Open DevTools → Console and find [ti-admin-login].');
    }
  };

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true);
    
    try {
      const response = await settingsAPI.loginTeamMember({
        email: values.email,
        password: values.password
      });

      if (response.data && response.success !== false) {
        const displayName = response.data.name || response.data.email || values.email;
        message.success('Login successful!');
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_username', displayName);
        localStorage.setItem('admin_email', response.data.email || values.email);
        onLogin(displayName);
      } else if (response.success === false) {
        message.error(response.error || 'Invalid email or password');
      } else {
        const summary =
          'Unexpected login response (missing profile data). Check the diagnostics or Network tab for the raw response.';
        message.error(summary);
        openLoginDiagModal(summary);
      }
    } catch (error: any) {
      const errorMessage =
        typeof error?.message === 'string' && error.message.trim()
          ? error.message
          : 'Login failed. Please try again.';
      message.error(errorMessage);
      openLoginDiagModal(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      const values = await resetForm.validateFields();
      setResetLoading(true);
      const response = await settingsAPI.resetTeamMemberPassword({ email: values.email });
      if (response.success) {
        message.success('Password reset email sent. Check your inbox.');
        setResetModalVisible(false);
        resetForm.resetFields();
      } else {
        message.error(response.error || 'Failed to send reset email');
      }
    } catch (error: any) {
      const errorMessage =
        typeof error?.message === 'string' && error.message.trim()
          ? error.message
          : 'Failed to send reset email. Please try again.';
      message.error(errorMessage);
    } finally {
      setResetLoading(false);
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
                <a
                  href="#"
                  className="forgot-link"
                  onClick={(event) => {
                    event.preventDefault();
                    setResetModalVisible(true);
                  }}
                >
                  Forgot your password?
                </a>
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

            <div style={{ textAlign: 'center', marginTop: -8, marginBottom: 8 }}>
              <Button type="link" size="small" onClick={copyLoginDiagnostics}>
                Copy login diagnostics
              </Button>
            </div>

            <div className="login-footer">
              <Text type="secondary" className="footer-text">
                Secure admin access for Thrive Initiative
              </Text>
            </div>
          </Card>
        </div>
      </div>
      <Modal
        title="Login diagnostics"
        open={loginDiagOpen}
        onCancel={() => {
          setLoginDiagOpen(false);
          setLoginDiagHint(null);
        }}
        footer={[
          <Button
            key="copy"
            onClick={async () => {
              const blob = [loginDiagSummary, loginDiagJson].filter(Boolean).join('\n\n---\n');
              try {
                await navigator.clipboard.writeText(blob || loginDiagSummary);
                message.success('Copied');
              } catch {
                message.error('Copy failed');
              }
            }}
          >
            Copy all
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => {
              setLoginDiagOpen(false);
              setLoginDiagHint(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={560}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Text>{loginDiagSummary}</Text>
          {loginDiagHint ? (
            <Alert type="info" showIcon message="What this usually means" description={loginDiagHint} />
          ) : null}
          {loginDiagJson ? (
            <pre
              style={{
                maxHeight: 280,
                overflow: 'auto',
                fontSize: 12,
                margin: 0,
                padding: 12,
                background: 'rgba(0,0,0,0.04)',
                borderRadius: 6,
              }}
            >
              {loginDiagJson}
            </pre>
          ) : (
            <Text type="secondary">
              No session diagnostics. Open Console: filter <code>[ti-admin-login]</code> or run{' '}
              <code>__TI_ADMIN_LOGIN_LAST__</code>.
            </Text>
          )}
        </Space>
      </Modal>

      <Modal
        title="Reset Password"
        open={resetModalVisible}
        onCancel={() => {
          setResetModalVisible(false);
          resetForm.resetFields();
        }}
        onOk={handleResetPassword}
        okText="Send Reset Email"
        confirmLoading={resetLoading}
        width={420}
      >
        <Form form={resetForm} layout="vertical" requiredMark="optional">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminLogin;
