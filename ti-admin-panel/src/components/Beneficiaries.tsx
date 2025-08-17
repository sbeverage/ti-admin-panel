import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Input,
  Button,
  Table,
  Card,
  Avatar,
  Space,
  Dropdown,
  Pagination,
  Row,
  Col,
  Select,
  Badge,
  Tag
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  SettingOutlined,
  MenuOutlined,
  BellOutlined,
  PictureOutlined,
  MoreOutlined,
  SearchOutlined,
  DownOutlined,
  EditOutlined,
  CheckCircleFilled,
  UserAddOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Beneficiaries.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const Beneficiaries: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('30-days');
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggleChange = (key: string, field: 'active' | 'enabled') => {
    // This would typically update the backend
    console.log(`Toggling ${field} for beneficiary ${key}`);
  };

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
    }
  };

  const timeFilterMenu = [
    {
      key: '7-days',
      label: 'Last 7 Days',
      icon: <CheckCircleFilled />
    },
    {
      key: '30-days',
      label: 'Last 30 Days',
      icon: <CheckCircleFilled />
    },
    {
      key: '90-days',
      label: 'Last 90 Days',
      icon: <CheckCircleFilled />
    },
    {
      key: '1-year',
      label: 'Last 1 Year',
      icon: <CheckCircleFilled />
    }
  ];

  const beneficiariesData = [
    {
      key: '1',
      beneficiaryName: 'United Way',
      contactName: 'Keith Arnold',
      email: 'keitharnold@gmail.com',
      contactNumber: '+1 (555) 123-4567',
      bankAccount: '****1234',
      donation: '$25,000',
      dateOfJoin: 'July 17, 2023',
      cityState: 'Springfield, IL',
      beneficiaryCause: 'Health and Medical Charities',
      beneficiaryType: 'National',
      donors: 300,
      active: false,
      enabled: false
    },
    {
      key: '2',
      beneficiaryName: 'American Red Cross',
      contactName: 'Jean Atchison',
      email: 'Jeanatchison@gmail.com',
      contactNumber: '+1 (555) 234-5678',
      bankAccount: '****5678',
      donation: '$18,500',
      dateOfJoin: 'July 17, 2023',
      cityState: 'Portland, OR',
      beneficiaryCause: 'Education and Scholarship Charities',
      beneficiaryType: 'International',
      donors: 280,
      active: true,
      enabled: true
    },
    {
      key: '3',
      beneficiaryName: 'Feeding America',
      contactName: 'Tim Barber',
      email: 'Timbarber@gmail.com',
      contactNumber: '+1 (555) 345-6789',
      bankAccount: '****9012',
      donation: '$32,100',
      dateOfJoin: 'July 17, 2023',
      cityState: 'Charleston, SC',
      beneficiaryCause: 'Animal Welfare and Protection Charities',
      beneficiaryType: 'Local',
      donors: 265,
      active: true,
      enabled: true
    },
    {
      key: '4',
      beneficiaryName: 'St. Jude Children\'s Research Hospital',
      contactName: 'Meg Braff',
      email: 'Megbraff@gmail.com',
      contactNumber: '+1 (555) 456-7890',
      bankAccount: '****3456',
      donation: '$45,750',
      dateOfJoin: 'July 17, 2023',
      cityState: 'Austin, TX',
      beneficiaryCause: 'Environmental and Conservation Charities',
      beneficiaryType: 'National',
      donors: 240,
      active: true,
      enabled: true
    },
    {
      key: '5',
      beneficiaryName: 'Habitat for Humanity',
      contactName: 'Heidi Burwell',
      email: 'Heidiburwell@gmail.com',
      contactNumber: '+1 (555) 567-8901',
      bankAccount: '****7890',
      donation: '$28,900',
      dateOfJoin: 'July 17, 2023',
      cityState: 'Denver, CO',
      beneficiaryCause: 'Hunger Relief and Food Banks',
      beneficiaryType: 'Local',
      donors: 220,
      active: false,
      enabled: false
    },
    {
      key: '6',
      beneficiaryName: 'Make-A-Wish Foundation',
      contactName: 'Sarah Johnson',
      email: 'sarah.johnson@gmail.com',
      contactNumber: '+1 (555) 678-9012',
      bankAccount: '****2345',
      donation: '$38,200',
      dateOfJoin: 'July 17, 2023',
      cityState: 'Nashville, TN',
      beneficiaryCause: 'Children and Youth Charities',
      beneficiaryType: 'National',
      donors: 195,
      active: true,
      enabled: true
    },
    {
      key: '7',
      beneficiaryName: 'Doctors Without Borders USA',
      contactName: 'Michael Chen',
      email: 'michael.chen@gmail.com',
      contactNumber: '+1 (555) 789-0123',
      bankAccount: '****6789',
      donation: '$52,300',
      dateOfJoin: 'July 20, 2023',
      cityState: 'Boston, MA',
      beneficiaryCause: 'International Relief and Development',
      beneficiaryType: 'International',
      donors: 180,
      active: false,
      enabled: false
    },
    {
      key: '8',
      beneficiaryName: 'Save the Children USA',
      contactName: 'Emily Davis',
      email: 'emily.davis@gmail.com',
      contactNumber: '+1 (555) 890-1234',
      bankAccount: '****0123',
      donation: '$29,800',
      dateOfJoin: 'July 17, 2023',
      cityState: 'Seattle, WA',
      beneficiaryCause: 'Children and Youth Charities',
      beneficiaryType: 'International',
      donors: 175,
      active: true,
      enabled: true
    },
    {
      key: '9',
      beneficiaryName: 'The Nature Conservancy',
      contactName: 'David Wilson',
      email: 'david.wilson@gmail.com',
      contactNumber: '+1 (555) 901-2345',
      bankAccount: '****4567',
      donation: '$41,600',
      dateOfJoin: 'July 17, 2023',
      cityState: 'Atlanta, GA',
      beneficiaryCause: 'Environmental and Conservation Charities',
      beneficiaryType: 'National',
      donors: 168,
      active: true,
      enabled: true
    },
    {
      key: '10',
      beneficiaryName: 'American Cancer Society',
      contactName: 'Lisa Rodriguez',
      email: 'lisa.rodriguez@gmail.com',
      contactNumber: '+1 (555) 012-3456',
      bankAccount: '****8901',
      donation: '$35,400',
      dateOfJoin: 'July 17, 2023',
      cityState: 'Miami, FL',
      beneficiaryCause: 'Health and Medical Charities',
      beneficiaryType: 'National',
      donors: 162,
      active: true,
      enabled: true
    },
    {
      key: '11',
      beneficiaryName: 'Big Brothers Big Sisters of America',
      contactName: 'Robert Thompson',
      email: 'robert.thompson@gmail.com',
      contactNumber: '+1 (555) 123-4567',
      bankAccount: '****2345',
      donation: '$22,700',
      dateOfJoin: 'July 17, 2023',
      cityState: 'Phoenix, AZ',
      beneficiaryCause: 'Children and Youth Charities',
      beneficiaryType: 'Local',
      donors: 160,
      active: true,
      enabled: true
    },
    {
      key: '12',
      beneficiaryName: 'The Salvation Army',
      contactName: 'Jennifer Lee',
      email: 'jennifer.lee@gmail.com',
      contactNumber: '+1 (555) 234-5678',
      bankAccount: '****6789',
      donation: '$31,900',
      dateOfJoin: 'July 17, 2023',
      cityState: 'New York, NY',
      beneficiaryCause: 'Social Services and Community Charities',
      beneficiaryType: 'National',
      donors: 157,
      active: true,
      enabled: true
    }
  ];

  const columns = [
    {
      title: 'Beneficiary name',
      dataIndex: 'beneficiaryName',
      key: 'beneficiaryName',
      render: (text: string) => <Text strong>{text}</Text>,
      fixed: 'left' as const,
      width: 200
    },
    {
      title: 'Contact name',
      dataIndex: 'contactName',
      key: 'contactName',
      render: (text: string) => <Text>{text}</Text>,
      width: 150
    },
    {
      title: 'Emails',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 200
    },
    {
      title: 'Contact number',
      dataIndex: 'contactNumber',
      key: 'contactNumber',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 150
    },
    {
      title: 'Bank Account',
      dataIndex: 'bankAccount',
      key: 'bankAccount',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 120
    },
    {
      title: 'Donation',
      dataIndex: 'donation',
      key: 'donation',
      render: (text: string) => <Text strong style={{ color: '#DB8633' }}>{text}</Text>,
      width: 120
    },
    {
      title: 'Date of join',
      dataIndex: 'dateOfJoin',
      key: 'dateOfJoin',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 130
    },
    {
      title: 'City, State',
      dataIndex: 'cityState',
      key: 'cityState',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 130
    },
    {
      title: 'Beneficiary cause',
      dataIndex: 'beneficiaryCause',
      key: 'beneficiaryCause',
      render: (text: string) => <Text type="secondary">{text}</Text>,
      width: 200
    },
    {
      title: 'Beneficiary Type',
      dataIndex: 'beneficiaryType',
      key: 'beneficiaryType',
      render: (text: string) => {
        let color = 'default';
        if (text === 'International') color = 'blue';
        else if (text === 'National') color = 'green';
        else if (text === 'Local') color = 'orange';
        return <Tag color={color}>{text}</Tag>;
      },
      width: 120
    },
    {
      title: 'Donors',
      dataIndex: 'donors',
      key: 'donors',
      render: (text: number) => <Text strong>{text}</Text>,
      width: 100
    },
    {
      title: 'Active/De-active',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean, record: any) => (
        <div className="toggle-switch">
          <div 
            className={`toggle ${active ? 'active' : 'inactive'}`}
            onClick={() => handleToggleChange(record.key, 'active')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 120
    },
    {
      title: 'Enable/Disable',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: any) => (
        <div className="toggle-switch">
          <div 
            className={`toggle ${enabled ? 'active' : 'inactive'}`}
            onClick={() => handleToggleChange(record.key, 'enabled')}
          >
            <div className="toggle-slider"></div>
          </div>
        </div>
      ),
      width: 120
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Button type="text" icon={<EditOutlined />} className="edit-action-btn" />
      ),
      width: 100,
      fixed: 'right' as const
    }
  ];

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'donors',
      icon: <UserOutlined />,
      label: 'Donors',
    },
    {
      key: 'beneficiaries',
      icon: <StarOutlined />,
      label: 'Beneficiaries',
    },
    {
      key: 'vendor',
      icon: <SettingOutlined />,
      label: 'Vendor',
    },
    {
      key: 'discounts',
      icon: <SettingOutlined />,
      label: 'Discounts',
    },
    {
      key: 'tenants',
      icon: <SettingOutlined />,
      label: 'Tenants',
    },
    {
      key: 'events',
      icon: <SettingOutlined />,
      label: 'Events',
    },
    {
      key: 'leaderboard',
      icon: <SettingOutlined />,
      label: 'Leaderboard',
    },
    {
      key: 'feeds',
      icon: <SettingOutlined />,
      label: 'Feeds',
    },
    {
      key: 'pending-approvals',
      icon: <SettingOutlined />,
      label: 'Pending Approvals',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  return (
    <Layout className="beneficiaries-layout">
      {/* Mobile Menu Button */}
      <Button
        className="mobile-menu-btn"
        icon={<MenuOutlined />}
        onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      {/* Sidebar */}
      <Sider
        className="beneficiaries-sider"
        width={280}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div className="logo-section">
          <div className="logo-container">
            <img
              src="/piggy-logo.png"
              alt="Thrive Initiative Logo"
              className="logo-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="logo-fallback">TI</div>
          </div>
          <div className="white-logo-container">
            <img
              src="/white-logo.png"
              alt="Thrive Initiative White Logo"
              className="white-logo-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="white-logo-fallback" style={{ display: 'none' }}>
              <div className="fallback-text">TI</div>
            </div>
          </div>
          <div className="brand-name">THRIVE INITIATIVE</div>
          <div className="brand-subtitle">Change4Good.org</div>
        </div>

        <Menu
          className="beneficiaries-menu"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
        />

        <div className="user-profile">
          <Avatar size={40} icon={<UserOutlined />} />
          <div className="user-info">
            <Text strong>Shahryar Minhas</Text>
            <Text type="secondary">shahryarminhas@gmail.com</Text>
          </div>
          <Button type="text" icon={<MoreOutlined />} />
        </div>
      </Sider>

      <Layout className="main-content">
        <div className="beneficiaries-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Beneficiaries</Title>
            <Text type="secondary" className="beneficiaries-count">1000 Beneficiaries Found</Text>
          </div>
          <div className="header-right">
            <Button 
              type="primary" 
              icon={<UserAddOutlined />}
              size="large"
              className="invite-beneficiary-btn"
            >
              + Invite A Beneficiary
            </Button>
          </div>
        </div>

        <Content className="beneficiaries-content">
          <div className="content-wrapper">
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-section">
                <Search
                  placeholder="Search Beneficiaries"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="beneficiary-search"
                />
              </div>
              
              <div className="filter-section">
                <div className="filter-dropdowns">
                  <Text strong className="filter-label">Filters</Text>
                  <Select
                    placeholder="Select Cause"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="health">Health and Medical</Option>
                    <Option value="education">Education</Option>
                    <Option value="environment">Environment</Option>
                    <Option value="children">Children and Youth</Option>
                    <Option value="hunger">Hunger Relief</Option>
                    <Option value="animal">Animal Welfare</Option>
                  </Select>
                  
                  <Select
                    placeholder="Select Duration"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="1-week">1 Week</Option>
                    <Option value="1-month">1 Month</Option>
                    <Option value="3-months">3 Months</Option>
                    <Option value="6-months">6 Months</Option>
                  </Select>
                  
                  <Select
                    placeholder="Beneficiary Type"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="all">All Types</Option>
                    <Option value="international">International</Option>
                    <Option value="national">National</Option>
                    <Option value="local">Local</Option>
                  </Select>
                  
                  <Select
                    placeholder="City, State"
                    className="filter-dropdown"
                    size="large"
                  >
                    <Option value="springfield-il">Springfield, IL</Option>
                    <Option value="portland-or">Portland, OR</Option>
                    <Option value="charleston-sc">Charleston, SC</Option>
                    <Option value="austin-tx">Austin, TX</Option>
                    <Option value="denver-co">Denver, CO</Option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Beneficiaries Table */}
            <div className="beneficiaries-table-section">
              <Table
                columns={columns}
                dataSource={beneficiariesData}
                pagination={false}
                size="middle"
                className="beneficiaries-table"
                rowClassName="beneficiary-row"
                scroll={{ x: 2000 }}
                bordered={false}
              />
            </div>

            {/* Pagination */}
            <div className="pagination-section">
              <Pagination
                current={currentPage}
                total={1000}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showQuickJumper
                className="beneficiaries-pagination"
              />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Beneficiaries; 