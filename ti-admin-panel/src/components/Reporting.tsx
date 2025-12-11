import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Space, Button, Card, Row, Col, Table, DatePicker, Select, Tag, Modal, Form, Input, message, Statistic, Divider, Tooltip, Badge, Dropdown } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import UserProfile from './UserProfile';
import { reportingAPI, beneficiaryAPI } from '../services/api';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  RiseOutlined,
  SettingOutlined,
  CalendarOutlined,
  CrownOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  MenuOutlined,
  BankOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  CalculatorOutlined,
  ReconciliationOutlined,
  DownOutlined,
  MailOutlined
} from '@ant-design/icons';
import './Reporting.css';
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';
import dayjs, { Dayjs } from 'dayjs';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface PayoutData {
  key: string;
  beneficiaryId: number;
  beneficiaryName: string;
  totalDonations: number;
  monthlyDonations: number;
  oneTimeDonations: number;
  donationCount: number;
  serviceFees: number; // $3 per donation
  ccProcessingFees: number; // If donor opted in
  netAmount: number; // Total - Service Fees - CC Fees
  platformFee: number; // 20% of net amount
  payoutAmount: number; // 80% of net amount
  stripeAmount: number; // Actual amount collected from Stripe
  reconciliationStatus: 'matched' | 'needs_review' | 'pending';
  bankInfo: {
    hasBankInfo: boolean;
    bankName?: string;
    accountHolderName?: string;
    routingNumber?: string;
    accountNumber?: string;
    paymentMethod: 'direct_deposit' | 'check';
  };
  payoutStatus: 'pending' | 'processing' | 'completed' | 'cancelled';
  payoutDate?: string;
  notes?: string;
}

const Reporting: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [payoutData, setPayoutData] = useState<PayoutData[]>([]);
  const [loading, setLoading] = useState(false);
  const [bankInfoModalVisible, setBankInfoModalVisible] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<PayoutData | null>(null);
  const [payoutStatusModalVisible, setPayoutStatusModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Menu items for sidebar
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
      label: 'Vendors',
      title: 'Vendor Management'
    },
    {
      key: 'discounts',
      icon: <CrownOutlined />,
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
      icon: <FileTextOutlined />,
      label: 'Referral Analytics',
      title: 'Referral Analytics & Tracking'
    },
    {
      key: 'geographic-analytics',
      icon: <CalendarOutlined />,
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

  const handleMenuClick = (e: any) => {
    const key = e.key;
    if (key === 'dashboard') navigate('/dashboard');
    else if (key === 'donors') navigate('/donors');
    else if (key === 'beneficiaries') navigate('/beneficiaries');
    else if (key === 'vendor') navigate('/vendor');
    else if (key === 'discounts') navigate('/discounts');
    else if (key === 'tenants') navigate('/tenants');
    else if (key === 'pending-approvals') navigate('/pending-approvals');
    else if (key === 'invitations') navigate('/invitations');
    else if (key === 'referral-analytics') navigate('/referral-analytics');
    else if (key === 'geographic-analytics') navigate('/geographic-analytics');
    else if (key === 'reporting') navigate('/reporting');
    else if (key === 'settings') navigate('/settings');
    setMobileSidebarVisible(false);
  };

  // Generate dummy data for preview
  const generateDummyData = (): PayoutData[] => {
    const beneficiaries = [
      { name: 'Hope Community Center', id: 1, hasBank: true, status: 'completed' as const },
      { name: 'Food Bank of America', id: 2, hasBank: true, status: 'processing' as const },
      { name: 'Shelter for Families', id: 3, hasBank: false, status: 'pending' as const },
      { name: 'Youth Education Program', id: 4, hasBank: true, status: 'completed' as const },
      { name: 'Medical Assistance Fund', id: 5, hasBank: true, status: 'pending' as const },
      { name: 'Community Garden Project', id: 6, hasBank: false, status: 'pending' as const },
      { name: 'Senior Care Services', id: 7, hasBank: true, status: 'completed' as const },
      { name: 'Homeless Outreach', id: 8, hasBank: true, status: 'processing' as const }
    ];

    return beneficiaries.map((ben, index) => {
      const monthlyDonations = Math.random() * 5000 + 2000; // $2000-$7000
      const oneTimeDonations = Math.random() * 3000 + 500; // $500-$3500
      const totalDonations = monthlyDonations + oneTimeDonations;
      const donationCount = Math.floor(Math.random() * 50 + 10); // 10-60 donations
      const serviceFees = donationCount * 3;
      const ccProcessingFees = Math.random() > 0.5 ? Math.random() * 200 + 50 : 0; // Sometimes covered
      const netAmount = totalDonations - serviceFees - ccProcessingFees;
      const platformFee = netAmount * 0.20;
      const payoutAmount = netAmount * 0.80;
      const stripeAmount = totalDonations + (Math.random() * 20 - 10); // Slight variance
      
      let reconciliationStatus: 'matched' | 'needs_review' | 'pending' = 'pending';
      const difference = Math.abs(stripeAmount - totalDonations);
      if (difference < 0.01) {
        reconciliationStatus = 'matched';
      } else if (difference > 1.00) {
        reconciliationStatus = 'needs_review';
      }

      return {
        key: ben.id.toString(),
        beneficiaryId: ben.id,
        beneficiaryName: ben.name,
        totalDonations: Math.round(totalDonations * 100) / 100,
        monthlyDonations: Math.round(monthlyDonations * 100) / 100,
        oneTimeDonations: Math.round(oneTimeDonations * 100) / 100,
        donationCount,
        serviceFees,
        ccProcessingFees: Math.round(ccProcessingFees * 100) / 100,
        netAmount: Math.round(netAmount * 100) / 100,
        platformFee: Math.round(platformFee * 100) / 100,
        payoutAmount: Math.round(payoutAmount * 100) / 100,
        stripeAmount: Math.round(stripeAmount * 100) / 100,
        reconciliationStatus,
        bankInfo: {
          hasBankInfo: ben.hasBank,
          bankName: ben.hasBank ? 'Chase Bank' : undefined,
          accountHolderName: ben.hasBank ? ben.name : undefined,
          routingNumber: ben.hasBank ? '021000021' : undefined,
          accountNumber: ben.hasBank ? '****1234' : undefined,
          paymentMethod: ben.hasBank ? 'direct_deposit' as const : 'check' as const
        },
        payoutStatus: ben.status,
        payoutDate: ben.status === 'completed' ? selectedMonth.format('YYYY-MM-15') : undefined,
        notes: ben.status === 'completed' ? 'Payout processed successfully' : undefined
      };
    });
  };

  // Load payout data for selected month
  const loadPayoutData = async () => {
    setLoading(true);
    try {
      const monthStart = selectedMonth.startOf('month').format('YYYY-MM-DD');
      const monthEnd = selectedMonth.endOf('month').format('YYYY-MM-DD');
      
      const response = await reportingAPI.getPayoutData(monthStart, monthEnd);
      
      if (response.success && response.data && response.data.length > 0) {
        // Transform API data to PayoutData format
        const transformed: PayoutData[] = response.data.map((item: any) => {
          const donationCount = item.monthly_donation_count + item.one_time_donation_count;
          const serviceFees = donationCount * 3; // $3 per donation
          const ccProcessingFees = item.cc_processing_fees || 0;
          const netAmount = item.total_donations - serviceFees - ccProcessingFees;
          const platformFee = netAmount * 0.20; // 20%
          const payoutAmount = netAmount * 0.80; // 80%
          
          // Calculate reconciliation status
          let reconciliationStatus: 'matched' | 'needs_review' | 'pending' = 'pending';
          const difference = Math.abs(item.stripe_amount - item.total_donations);
          if (difference < 0.01) {
            reconciliationStatus = 'matched';
          } else if (difference > 1.00) {
            reconciliationStatus = 'needs_review';
          }
          
          return {
            key: item.beneficiary_id?.toString() || Math.random().toString(),
            beneficiaryId: item.beneficiary_id,
            beneficiaryName: item.beneficiary_name || 'Unknown',
            totalDonations: item.total_donations || 0,
            monthlyDonations: item.monthly_donations || 0,
            oneTimeDonations: item.one_time_donations || 0,
            donationCount,
            serviceFees,
            ccProcessingFees,
            netAmount,
            platformFee,
            payoutAmount,
            stripeAmount: item.stripe_amount || 0,
            reconciliationStatus,
            bankInfo: {
              hasBankInfo: item.bank_info?.has_bank_info || false,
              bankName: item.bank_info?.bank_name,
              accountHolderName: item.bank_info?.account_holder_name,
              routingNumber: item.bank_info?.routing_number,
              accountNumber: item.bank_info?.account_number ? '****' + item.bank_info.account_number.slice(-4) : undefined,
              paymentMethod: item.bank_info?.payment_method || 'check'
            },
            payoutStatus: item.payout_status || 'pending',
            payoutDate: item.payout_date,
            notes: item.notes
          };
        });
        
        setPayoutData(transformed);
      } else {
        // Use dummy data when no real data is available
        console.log('No data from API, using dummy data for preview');
        setPayoutData(generateDummyData());
      }
    } catch (error: any) {
      console.error('Error loading payout data:', error);
      // Use dummy data on error for preview
      console.log('Error loading data, using dummy data for preview');
      setPayoutData(generateDummyData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayoutData();
  }, [selectedMonth]);

  // Calculate totals
  const totals = payoutData.reduce((acc, item) => ({
    totalDonations: acc.totalDonations + item.totalDonations,
    totalMonthlyDonations: acc.totalMonthlyDonations + item.monthlyDonations,
    totalOneTimeDonations: acc.totalOneTimeDonations + item.oneTimeDonations,
    totalServiceFees: acc.totalServiceFees + item.serviceFees,
    totalCCFees: acc.totalCCFees + item.ccProcessingFees,
    totalNetAmount: acc.totalNetAmount + item.netAmount,
    totalPlatformFee: acc.totalPlatformFee + item.platformFee,
    totalPayoutAmount: acc.totalPayoutAmount + item.payoutAmount,
    totalStripeAmount: acc.totalStripeAmount + item.stripeAmount,
    totalDonationCount: acc.totalDonationCount + item.donationCount
  }), {
    totalDonations: 0,
    totalMonthlyDonations: 0,
    totalOneTimeDonations: 0,
    totalServiceFees: 0,
    totalCCFees: 0,
    totalNetAmount: 0,
    totalPlatformFee: 0,
    totalPayoutAmount: 0,
    totalStripeAmount: 0,
    totalDonationCount: 0
  });

  // Handle bank info edit
  const handleEditBankInfo = (record: PayoutData) => {
    setSelectedBeneficiary(record);
    form.setFieldsValue({
      bankName: record.bankInfo.bankName || '',
      accountHolderName: record.bankInfo.accountHolderName || '',
      routingNumber: record.bankInfo.routingNumber || '',
      accountNumber: '', // Don't pre-fill for security
      paymentMethod: record.bankInfo.paymentMethod || 'direct_deposit'
    });
    setBankInfoModalVisible(true);
  };

  // Save bank info
  const handleSaveBankInfo = async () => {
    try {
      const values = await form.validateFields();
      
      if (!selectedBeneficiary) return;
      
      const response = await reportingAPI.updateBankInfo(selectedBeneficiary.beneficiaryId, {
        bank_name: values.bankName,
        account_holder_name: values.accountHolderName,
        routing_number: values.routingNumber,
        account_number: values.accountNumber,
        payment_method: values.paymentMethod
      });
      
      if (response.success) {
        message.success('Bank information updated successfully');
        setBankInfoModalVisible(false);
        form.resetFields();
        loadPayoutData();
      } else {
        message.error('Failed to update bank information');
      }
    } catch (error: any) {
      console.error('Error saving bank info:', error);
      message.error('Error saving bank information');
    }
  };

  // Handle payout status update
  const handleUpdatePayoutStatus = (record: PayoutData, newStatus: string) => {
    setSelectedBeneficiary(record);
    form.setFieldsValue({
      payoutStatus: newStatus,
      payoutDate: record.payoutDate ? dayjs(record.payoutDate) : dayjs(),
      notes: record.notes || ''
    });
    setPayoutStatusModalVisible(true);
  };

  // Save payout status
  const handleSavePayoutStatus = async () => {
    try {
      const values = await form.validateFields();
      
      if (!selectedBeneficiary) return;
      
      const response = await reportingAPI.updatePayoutStatus(selectedBeneficiary.beneficiaryId, {
        payout_status: values.payoutStatus,
        payout_date: values.payoutDate?.format('YYYY-MM-DD'),
        notes: values.notes
      });
      
      if (response.success) {
        message.success('Payout status updated successfully');
        setPayoutStatusModalVisible(false);
        form.resetFields();
        loadPayoutData();
      } else {
        message.error('Failed to update payout status');
      }
    } catch (error: any) {
      console.error('Error saving payout status:', error);
      message.error('Error saving payout status');
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Beneficiary Name',
      'Total Donations',
      'Monthly Donations',
      'One-Time Donations',
      'Donation Count',
      'Service Fees ($3 each)',
      'CC Processing Fees',
      'Net Amount',
      'Platform Fee (20%)',
      'Payout Amount (80%)',
      'Stripe Amount',
      'Reconciliation Status',
      'Payment Method',
      'Payout Status',
      'Payout Date',
      'Notes'
    ];
    
    const rows = payoutData.map(item => [
      item.beneficiaryName,
      item.totalDonations.toFixed(2),
      item.monthlyDonations.toFixed(2),
      item.oneTimeDonations.toFixed(2),
      item.donationCount,
      item.serviceFees.toFixed(2),
      item.ccProcessingFees.toFixed(2),
      item.netAmount.toFixed(2),
      item.platformFee.toFixed(2),
      item.payoutAmount.toFixed(2),
      item.stripeAmount.toFixed(2),
      item.reconciliationStatus,
      item.bankInfo.paymentMethod === 'direct_deposit' ? 'Direct Deposit' : 'Check',
      item.payoutStatus,
      item.payoutDate || '',
      item.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payouts_${selectedMonth.format('YYYY-MM')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    message.success('CSV exported successfully');
  };

  // Table columns
  const columns = [
    {
      title: 'Beneficiary',
      dataIndex: 'beneficiaryName',
      key: 'beneficiaryName',
      fixed: 'left' as const,
      width: 200,
      render: (text: string, record: PayoutData) => (
        <Space>
          <Text strong>{text}</Text>
          {!record.bankInfo.hasBankInfo && (
            <Tooltip title="Bank information missing - will need to write check">
              <Tag color="orange" icon={<ExclamationCircleOutlined />}>No Bank Info</Tag>
            </Tooltip>
          )}
        </Space>
      )
    },
    {
      title: 'Total Donations',
      dataIndex: 'totalDonations',
      key: 'totalDonations',
      width: 130,
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>${amount.toFixed(2)}</Text>
      ),
      sorter: (a: PayoutData, b: PayoutData) => a.totalDonations - b.totalDonations
    },
    {
      title: 'Monthly',
      dataIndex: 'monthlyDonations',
      key: 'monthlyDonations',
      width: 110,
      align: 'right' as const,
      render: (amount: number) => `$${amount.toFixed(2)}`
    },
    {
      title: 'One-Time',
      dataIndex: 'oneTimeDonations',
      key: 'oneTimeDonations',
      width: 110,
      align: 'right' as const,
      render: (amount: number) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Donations',
      dataIndex: 'donationCount',
      key: 'donationCount',
      width: 100,
      align: 'center' as const,
      render: (count: number) => <Tag>{count}</Tag>
    },
    {
      title: 'Service Fees',
      dataIndex: 'serviceFees',
      key: 'serviceFees',
      width: 120,
      align: 'right' as const,
      render: (fees: number) => (
        <Text type="secondary">${fees.toFixed(2)}</Text>
      ),
      tooltip: '$3 per donation'
    },
    {
      title: 'CC Fees',
      dataIndex: 'ccProcessingFees',
      key: 'ccProcessingFees',
      width: 100,
      align: 'right' as const,
      render: (fees: number) => (
        <Text type="secondary">{fees > 0 ? `$${fees.toFixed(2)}` : '-'}</Text>
      ),
      className: 'table-header-small'
    },
    {
      title: 'Net Amount',
      dataIndex: 'netAmount',
      key: 'netAmount',
      width: 120,
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong>${amount.toFixed(2)}</Text>
      )
    },
    {
      title: 'Platform Fee (20%)',
      dataIndex: 'platformFee',
      key: 'platformFee',
      width: 130,
      align: 'right' as const,
      render: (fee: number) => (
        <Text style={{ color: '#DB8633' }}>${fee.toFixed(2)}</Text>
      ),
      className: 'table-header-small'
    },
    {
      title: 'Payout (80%)',
      dataIndex: 'payoutAmount',
      key: 'payoutAmount',
      width: 130,
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
          ${amount.toFixed(2)}
        </Text>
      ),
      sorter: (a: PayoutData, b: PayoutData) => a.payoutAmount - b.payoutAmount,
      className: 'table-header-small'
    },
    {
      title: 'Stripe Amount',
      dataIndex: 'stripeAmount',
      key: 'stripeAmount',
      width: 130,
      align: 'right' as const,
      render: (amount: number) => `$${amount.toFixed(2)}`
    },
    {
      title: 'Reconciliation',
      dataIndex: 'reconciliationStatus',
      key: 'reconciliationStatus',
      width: 140,
      align: 'center' as const,
      render: (status: string, record: PayoutData) => {
        const difference = Math.abs(record.stripeAmount - record.totalDonations);
        const color = status === 'matched' ? 'green' : status === 'needs_review' ? 'red' : 'orange';
        const icon = status === 'matched' ? <CheckCircleOutlined /> : 
                     status === 'needs_review' ? <CloseCircleOutlined /> : 
                     <ClockCircleOutlined />;
        
        return (
          <Tooltip title={`Difference: $${difference.toFixed(2)}`}>
            <Tag color={color} icon={icon}>
              {status === 'matched' ? 'Matched' : 
               status === 'needs_review' ? 'Review' : 'Pending'}
            </Tag>
          </Tooltip>
        );
      }
    },
    {
      title: 'Payment Method',
      dataIndex: 'bankInfo',
      key: 'paymentMethod',
      width: 140,
      render: (bankInfo: PayoutData['bankInfo']) => (
        <Tag color={bankInfo.paymentMethod === 'direct_deposit' ? 'blue' : 'orange'}>
          {bankInfo.paymentMethod === 'direct_deposit' ? 'Direct Deposit' : 'Check'}
        </Tag>
      )
    },
    {
      title: 'Payout Status',
      dataIndex: 'payoutStatus',
      key: 'payoutStatus',
      width: 130,
      render: (status: string) => {
        const statusConfig: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
          pending: { color: 'default', icon: <ClockCircleOutlined />, text: 'Pending' },
          processing: { color: 'processing', icon: <ReloadOutlined spin />, text: 'Processing' },
          completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Completed' },
          cancelled: { color: 'error', icon: <CloseCircleOutlined />, text: 'Cancelled' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 200,
      render: (_: any, record: PayoutData) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditBankInfo(record)}
            size="small"
          >
            Bank Info
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'pending', label: 'Mark as Pending', icon: <ClockCircleOutlined /> },
                { key: 'processing', label: 'Mark as Processing', icon: <ReloadOutlined /> },
                { key: 'completed', label: 'Mark as Completed', icon: <CheckCircleOutlined /> },
                { key: 'cancelled', label: 'Mark as Cancelled', icon: <CloseCircleOutlined /> }
              ],
              onClick: ({ key }) => handleUpdatePayoutStatus(record, key)
            }}
          >
            <Button type="link" size="small">
              Status <DownOutlined />
            </Button>
          </Dropdown>
        </Space>
      )
    }
  ];

  return (
    <Layout className="reporting-layout">
      {/* Mobile Menu Button */}
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
          defaultSelectedKeys={['reporting']}
          selectedKeys={[location.pathname === '/reporting' ? 'reporting' : '']}
          items={menuItems}
          className="standard-menu"
          onClick={handleMenuClick}
        />

        <UserProfile className="standard-user-profile" showRole={true} />
      </Sider>

      {/* Main Content */}
      <Layout className="standard-main-content">
        <Header className="standard-header" style={{ background: colorBgContainer }}>
          <Title level={2} style={{ margin: 0 }}>Reporting & Payouts</Title>
        </Header>

        <Content style={{ margin: '24px', minHeight: 280, background: colorBgContainer, padding: 24, borderRadius: borderRadiusLG }}>
          {/* Summary Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Donations"
                  value={totals.totalDonations}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {totals.totalDonationCount} donations
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Fees"
                  value={totals.totalServiceFees + totals.totalCCFees}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#ff4d4f' }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Service: ${totals.totalServiceFees.toFixed(2)} | CC: ${totals.totalCCFees.toFixed(2)}
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Platform Fee (20%)"
                  value={totals.totalPlatformFee}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#DB8633' }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  THRIVE Initiative
                </Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Payouts (80%)"
                  value={totals.totalPayoutAmount}
                  prefix="$"
                  precision={2}
                  valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  To Beneficiaries
                </Text>
              </Card>
            </Col>
          </Row>

          {/* Filters and Actions */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Space>
                  <Text strong>Month:</Text>
                  <DatePicker
                    picker="month"
                    value={selectedMonth}
                    onChange={(date) => date && setSelectedMonth(date)}
                    format="MMMM YYYY"
                    style={{ width: 200 }}
                  />
                </Space>
              </Col>
              <Col xs={24} sm={12} md={16} style={{ textAlign: 'right' }}>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={loadPayoutData}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleExportCSV}
                    type="primary"
                    style={{ backgroundColor: '#DB8633', borderColor: '#DB8633' }}
                  >
                    Export CSV
                  </Button>
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={() => window.print()}
                  >
                    Print
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Payout Table */}
          <Card
            title={
              <Space>
                <CalculatorOutlined />
                <Text strong>Beneficiary Payouts - {selectedMonth.format('MMMM YYYY')}</Text>
              </Space>
            }
            extra={
              <Badge count={payoutData.filter(p => p.reconciliationStatus === 'needs_review').length} showZero>
                <Tag color="red" icon={<ReconciliationOutlined />}>
                  {payoutData.filter(p => p.reconciliationStatus === 'needs_review').length} Need Review
                </Tag>
              </Badge>
            }
          >
            <Table
              columns={columns}
              dataSource={payoutData}
              loading={loading}
              scroll={{ x: 1800 }}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} beneficiaries`
              }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <Text strong>Totals:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong style={{ color: '#52c41a' }}>
                        ${totals.totalDonations.toFixed(2)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} align="right">
                      ${totals.totalMonthlyDonations.toFixed(2)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      ${totals.totalOneTimeDonations.toFixed(2)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} align="center">
                      <Tag>{totals.totalDonationCount}</Tag>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={5} align="right">
                      ${totals.totalServiceFees.toFixed(2)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6} align="right">
                      ${totals.totalCCFees.toFixed(2)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={7} align="right">
                      <Text strong>${totals.totalNetAmount.toFixed(2)}</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={8} align="right">
                      <Text style={{ color: '#DB8633' }}>
                        ${totals.totalPlatformFee.toFixed(2)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={9} align="right">
                      <Text strong style={{ color: '#1890ff', fontSize: '18px' }}>
                        ${totals.totalPayoutAmount.toFixed(2)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={10} align="right">
                      ${totals.totalStripeAmount.toFixed(2)}
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={11} colSpan={4} />
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        </Content>
      </Layout>

      {/* Bank Info Modal */}
      <Modal
        title={`Bank Information - ${selectedBeneficiary?.beneficiaryName}`}
        open={bankInfoModalVisible}
        onOk={handleSaveBankInfo}
        onCancel={() => {
          setBankInfoModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true, message: 'Please select payment method' }]}
          >
            <Select>
              <Option value="direct_deposit">Direct Deposit (Preferred)</Option>
              <Option value="check">Check</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="bankName"
            label="Bank Name"
            rules={[{ required: true, message: 'Please enter bank name' }]}
          >
            <Input placeholder="Enter bank name" />
          </Form.Item>
          
          <Form.Item
            name="accountHolderName"
            label="Account Holder Name"
            rules={[{ required: true, message: 'Please enter account holder name' }]}
          >
            <Input placeholder="Enter account holder name" />
          </Form.Item>
          
          <Form.Item
            name="routingNumber"
            label="Routing Number"
            rules={[
              { required: true, message: 'Please enter routing number' },
              { pattern: /^\d{9}$/, message: 'Routing number must be 9 digits' }
            ]}
          >
            <Input placeholder="123456789" maxLength={9} />
          </Form.Item>
          
          <Form.Item
            name="accountNumber"
            label="Account Number"
            rules={[
              { required: true, message: 'Please enter account number' },
              { min: 4, message: 'Account number must be at least 4 digits' }
            ]}
          >
            <Input.Password placeholder="Enter account number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Payout Status Modal */}
      <Modal
        title={`Update Payout Status - ${selectedBeneficiary?.beneficiaryName}`}
        open={payoutStatusModalVisible}
        onOk={handleSavePayoutStatus}
        onCancel={() => {
          setPayoutStatusModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="payoutStatus"
            label="Payout Status"
            rules={[{ required: true, message: 'Please select payout status' }]}
          >
            <Select>
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="payoutDate"
            label="Payout Date"
            rules={[{ required: true, message: 'Please select payout date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={4} placeholder="Add any notes about this payout..." />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Reporting;

