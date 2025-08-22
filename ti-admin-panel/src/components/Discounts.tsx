import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Input,
  Button,
  Avatar,
  Space,
  Pagination,
  Select,
  Card,
  Row,
  Col
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  StarOutlined,
  SettingOutlined,
  MenuOutlined,
  MoreOutlined,
  SearchOutlined,
  GiftOutlined,
  BankOutlined,
  UserAddOutlined,
  RiseOutlined,
  CalendarOutlined,
  CrownOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Discounts.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const { Sider, Content } = Layout;

const Discounts: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('Discounts component mounted');
  }, []);

  const handleMenuClick = ({ key }: { key: string }) => {
    console.log('Menu clicked:', key); // Debug log
    if (key === 'dashboard') {
      navigate('/dashboard');
    } else if (key === 'donors') {
      navigate('/donors');
    } else if (key === 'beneficiaries') {
      navigate('/beneficiaries');
    } else if (key === 'vendor') {
      navigate('/vendor');
    } else if (key === 'tenants') {
      navigate('/tenants');
    } else if (key === 'discounts') {
      console.log('Navigating to discounts...'); // Debug log
      navigate('/discounts');
    } else if (key === 'events') {
      navigate('/events');
           } else if (key === 'leaderboard') {
         navigate('/leaderboard');
       } else if (key === 'settings') {
         navigate('/settings');
       }
  };

  const discountsData = [
    {
      key: '1',
      companyName: 'Nike',
      companyLogo: 'N',
      discountOffer: '$25 off on appetizer',
      conditions: 'with a minimum purchase of $75',
      frequency: 'up to 2x per month',
      vendor: 'Nike Store',
      discountType: 'Percentage',
      frequencyType: 'Monthly'
    },
    {
      key: '2',
      companyName: 'P&G',
      companyLogo: 'P',
      discountOffer: 'Free appetizer',
      conditions: 'with any main course purchase',
      frequency: 'up to 1x per month',
      vendor: 'P&G Retail',
      discountType: 'Fixed Amount',
      frequencyType: 'Monthly'
    },
    {
      key: '3',
      companyName: 'Apple',
      companyLogo: 'A',
      discountOffer: '50% off on Office Membership',
      conditions: 'for first-time subscribers',
      frequency: 'up to 1x per year',
      vendor: 'Apple Store',
      discountType: 'Percentage',
      frequencyType: 'Yearly'
    },
    {
      key: '4',
      companyName: 'Samsung',
      companyLogo: 'S',
      discountOffer: '$15 off on electronics',
      conditions: 'with purchase over $100',
      frequency: 'up to 3x per month',
      vendor: 'Samsung Shop',
      discountType: 'Fixed Amount',
      frequencyType: 'Monthly'
    },
    {
      key: '5',
      companyName: 'Kellogg\'s',
      companyLogo: 'K',
      discountOffer: '30% off on breakfast items',
      conditions: 'with any beverage purchase',
      frequency: 'up to 2x per week',
      vendor: 'Kellogg\'s Market',
      discountType: 'Percentage',
      frequencyType: 'Weekly'
    },
    {
      key: '6',
      companyName: 'Coca-Cola',
      companyLogo: 'C',
      discountOffer: 'Buy 1 Get 1 Free',
      conditions: 'on any soft drink',
      frequency: 'up to 1x per day',
      vendor: 'Coca-Cola Store',
      discountType: 'BOGO',
      frequencyType: 'Daily'
    },
    {
      key: '7',
      companyName: 'Ford',
      companyLogo: 'F',
      discountOffer: '$500 off on new vehicles',
      conditions: 'with trade-in of any car',
      frequency: 'up to 1x per year',
      vendor: 'Ford Dealership',
      discountType: 'Fixed Amount',
      frequencyType: 'Yearly'
    },
    {
      key: '8',
      companyName: 'Under Armour',
      companyLogo: 'U',
      discountOffer: '25% off on athletic wear',
      conditions: 'with any shoe purchase',
      frequency: 'up to 2x per month',
      vendor: 'Under Armour Store',
      discountType: 'Percentage',
      frequencyType: 'Monthly'
    },
    {
      key: '9',
      companyName: 'Pampers',
      companyLogo: 'P',
      discountOffer: '$10 off on diapers',
      conditions: 'with purchase of 2 or more packs',
      frequency: 'up to 1x per week',
      vendor: 'Pampers Shop',
      discountType: 'Fixed Amount',
      frequencyType: 'Weekly'
    },
    {
      key: '10',
      companyName: 'Amazon',
      companyLogo: 'A',
      discountOffer: 'Free Prime membership',
      conditions: 'for students with valid ID',
      frequency: 'up to 1x per year',
      vendor: 'Amazon',
      discountType: 'Free Service',
      frequencyType: 'Yearly'
    },
    {
      key: '11',
      companyName: 'Levi\'s',
      companyLogo: 'L',
      discountOffer: '40% off on jeans',
      conditions: 'with any top purchase',
      frequency: 'up to 1x per month',
      vendor: 'Levi\'s Store',
      discountType: 'Percentage',
      frequencyType: 'Monthly'
    },
    {
      key: '12',
      companyName: 'PepsiCo',
      companyLogo: 'P',
      discountOffer: '$5 off on snacks',
      conditions: 'with any drink purchase',
      frequency: 'up to 3x per week',
      vendor: 'PepsiCo Market',
      discountType: 'Fixed Amount',
      frequencyType: 'Weekly'
    },
    {
      key: '13',
      companyName: 'Nike',
      companyLogo: 'N',
      discountOffer: '20% off on running shoes',
      conditions: 'with any apparel purchase',
      frequency: 'up to 1x per month',
      vendor: 'Nike Store',
      discountType: 'Percentage',
      frequencyType: 'Monthly'
    },
    {
      key: '14',
      companyName: 'Apple',
      companyLogo: 'A',
      discountOffer: 'Free AirPods',
      conditions: 'with iPhone purchase',
      frequency: 'up to 1x per year',
      vendor: 'Apple Store',
      discountType: 'Free Product',
      frequencyType: 'Yearly'
    },
    {
      key: '15',
      companyName: 'Samsung',
      companyLogo: 'S',
      discountOffer: '$100 off on Galaxy phones',
      conditions: 'with trade-in of any smartphone',
      frequency: 'up to 1x per year',
      vendor: 'Samsung Shop',
      discountType: 'Fixed Amount',
      frequencyType: 'Yearly'
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
      icon: <RiseOutlined />,
      label: 'Vendor',
    },
    {
      key: 'discounts',
      icon: <GiftOutlined />,
      label: 'Discounts',
    },
    {
      key: 'tenants',
      icon: <BankOutlined />,
      label: 'Tenants',
    },
    {
      key: 'events',
      icon: <CalendarOutlined />,
      label: 'Events',
    },
    {
      key: 'leaderboard',
      icon: <CrownOutlined />,
      label: 'Leaderboard',
    },
    {
      key: 'feeds',
      icon: <FileTextOutlined />,
      label: 'Feeds',
      children: [
        {
          key: 'newsfeed',
          label: 'Newsfeed',
        },
        {
          key: 'ads-management',
          label: 'Ads Management',
        },
      ],
    },
    {
      key: 'pending-approvals',
      icon: <ExclamationCircleOutlined />,
      label: 'Pending Approvals',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  return (
    <Layout className="discounts-layout">
      {/* Mobile Menu Button */}
      <Button
        className="mobile-menu-btn"
        icon={<MenuOutlined />}
        onClick={() => setMobileSidebarVisible(!mobileSidebarVisible)}
      />

      {/* Sidebar */}
      <Sider
        className="discounts-sider"
        width={280}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      >
        <div className="logo-section" style={{
          padding: '20px 16px 12px 16px',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'transparent'
        }}>
          {/* Simplified logo section with large centered logo */}
          <div className="logo-container" style={{
            position: 'relative',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img
              src="/white-logo.png"
              alt="Thrive Initiative Logo"
              className="logo-image"
              style={{
                width: '180px',
                height: 'auto',
                maxWidth: '100%',
                display: 'block',
                margin: '0 auto'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="logo-fallback" style={{ display: 'none' }}>
              <div className="fallback-text">THRIVE</div>
            </div>
          </div>
        </div>

        <Menu
          className="discounts-menu"
          mode="inline"
          selectedKeys={[location.pathname.split('/')[1] || 'dashboard']}
          items={menuItems}
          onClick={handleMenuClick}
        />

        <div className="user-profile">
          <Avatar size={40} icon={<UserOutlined />} />
          <div className="user-info">
            <Text strong>Stephanie Beverage</Text>
          </div>
          <Button type="text" icon={<MoreOutlined />} />
        </div>
      </Sider>

      <Layout className="main-content">
        <div className="discounts-header">
          <div className="header-left">
            <Title level={2} style={{ margin: 0 }}>Discounts</Title>
            <Text type="secondary" className="discounts-count">200 Discounts Found</Text>
          </div>
        </div>

        <Content className="discounts-content">
          <div className="content-wrapper">
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
              <div className="search-section">
                <Search
                  placeholder="Search Discount Name"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  className="discount-search"
                />
              </div>
              <div className="filter-section">
                <Text strong className="filter-label">Filters</Text>
                <div className="filter-dropdowns">
                  <Select
                    placeholder="Select Discount vendor"
                    size="large"
                    className="filter-dropdown"
                  >
                    <Option value="nike">Nike</Option>
                    <Option value="apple">Apple</Option>
                    <Option value="samsung">Samsung</Option>
                    <Option value="amazon">Amazon</Option>
                  </Select>
                  <Select
                    placeholder="Select Discount Options"
                    size="large"
                    className="filter-dropdown"
                  >
                    <Option value="percentage">Percentage</Option>
                    <Option value="fixed">Fixed Amount</Option>
                    <Option value="bogo">Buy 1 Get 1</Option>
                    <Option value="free">Free Product/Service</Option>
                  </Select>
                  <Select
                    placeholder="Select Frequency"
                    size="large"
                    className="filter-dropdown"
                  >
                    <Option value="daily">Daily</Option>
                    <Option value="weekly">Weekly</Option>
                    <Option value="monthly">Monthly</Option>
                    <Option value="yearly">Yearly</Option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Discounts Grid */}
            <div className="discounts-grid-section">
              <Row gutter={[16, 16]} className="discounts-grid">
                {discountsData.map((discount) => (
                  <Col xs={24} sm={12} md={8} lg={8} xl={8} key={discount.key}>
                    <Card className="discount-card">
                      <div className="discount-card-content">
                        <div className="company-info">
                          <Avatar 
                            size={48} 
                            style={{ backgroundColor: '#DB8633', color: '#ffffff' }}
                            className="company-logo"
                          >
                            {discount.companyLogo}
                          </Avatar>
                          <div className="company-details">
                            <Text strong className="company-name">{discount.companyName}</Text>
                            <Text className="discount-offer">{discount.discountOffer}</Text>
                            {discount.conditions && (
                              <Text type="secondary" className="discount-conditions">
                                {discount.conditions}
                              </Text>
                            )}
                            {discount.frequency && (
                              <Text type="secondary" className="discount-frequency">
                                {discount.frequency}
                              </Text>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Pagination */}
            <div className="pagination-section">
              <Pagination
                current={currentPage}
                total={200}
                pageSize={pageSize}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showQuickJumper
                className="discounts-pagination"
              />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Discounts; 