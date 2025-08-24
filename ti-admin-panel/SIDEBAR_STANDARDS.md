# 🎨 Admin Panel Sidebar Design Standards

## 📋 Overview

All admin panel pages **MUST** follow the exact same sidebar design. This ensures perfect consistency across the entire application.

## 🎯 Standard Design Reference

The **Tenant page** serves as the perfect reference design. All other pages must match it exactly.

## 📁 Required Files

### 1. CSS Standards File
```
src/styles/sidebar-standard.css
```
This file contains all the standardized CSS rules that every page must use.

### 2. Import in Every Component
```tsx
import '../styles/sidebar-standard.css';
```

## 🏗️ Required HTML Structure

```tsx
<Layout className="standard-layout">
  <Sider className="standard-sider">
    {/* Logo Section */}
    <div className="standard-logo-section">
      <div className="standard-logo-container">
        <img src="/logo.png" className="standard-logo-image" alt="Logo" />
        {/* OR fallback */}
        <div className="standard-logo-fallback">
          <Icon className="standard-fallback-icon" />
        </div>
      </div>
      <div className="standard-brand-name">Your App Name</div>
      <div className="standard-brand-subtitle">Admin Panel</div>
    </div>

    {/* Navigation Menu */}
    <Menu className="standard-menu" selectedKeys={[selectedKey]}>
      <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
        Dashboard
      </Menu.Item>
      <Menu.Item key="pending-approvals" icon={<ExclamationCircleOutlined />}>
        Pending Approvals
      </Menu.Item>
      {/* Add other menu items */}
    </Menu>

    {/* User Profile */}
    <div className="standard-user-profile">
      <Avatar className="standard-avatar">U</Avatar>
      <div className="standard-user-info">
        <Typography.Text>User Name</Typography.Text>
        <Typography.Text type="secondary">Admin</Typography.Text>
      </div>
      <Button type="text" icon={<LogoutOutlined />} />
    </div>
  </Sider>

  <Layout className="standard-main-content">
    {/* Your page content goes here */}
  </Layout>
</Layout>
```

## 🎨 Required CSS Classes

### ✅ DO USE These Classes:
- `.standard-layout` - Main layout container
- `.standard-sider` - Sidebar container
- `.standard-logo-section` - Logo area
- `.standard-menu` - Navigation menu
- `.standard-user-profile` - User profile section
- `.standard-main-content` - Main content area

### ❌ DO NOT USE These Classes:
- `.dashboard-sider`, `.donors-sider`, `.vendor-sider` (page-specific)
- `.dashboard-menu`, `.donors-menu`, `.vendor-menu` (page-specific)
- Custom CSS that overrides the standards

## 📏 Design Specifications

### Colors
- **Sidebar Background**: `#324E58`
- **Menu Item Text**: `#ffffff`
- **Menu Item Hover**: `rgba(255, 255, 255, 0.1)`
- **Selected Item**: `#DB8633` (brand orange)
- **Selected Item Hover**: `#c6752a` (darker orange)
- **Hover Font Color**: `#ffffff` (MUST stay white, never black)

### Spacing
- **Menu Item Margin**: `4px 16px`
- **Menu Item Padding**: `12px 24px`
- **Logo Section Padding**: `12px 16px`
- **User Profile Position**: `bottom: 24px, left: 16px, right: 16px`

### Sizing
- **Sidebar Width**: `280px`
- **Logo Size**: `80px × 80px`
- **Main Content Margin**: `margin-left: 280px`

## 🚨 CRITICAL HOVER COLOR RULES

### ❌ NEVER Allow Black Font on Hover
The most common issue is Ant Design changing font color to black on hover. This is **FORBIDDEN**.

### ✅ ALWAYS Maintain White Font on Hover
```css
/* REQUIRED: All menu items must keep white text on hover */
.standard-menu .ant-menu-item:hover,
.standard-menu .ant-menu-item:hover *,
.standard-menu .ant-menu-item:hover span,
.standard-menu .ant-menu-item:hover div,
.standard-menu .ant-menu-item:hover .anticon {
  color: #ffffff !important;
}
```

### 🔧 Required CSS Imports
Every page MUST import these files:
```tsx
import '../styles/sidebar-standard.css';
import '../styles/menu-hover-overrides.css';
```

## 🔧 Required Menu Items

Every page **MUST** include these menu items:

```tsx
const standardMenuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'donors',
    icon: <HeartOutlined />,
    label: 'Donors',
  },
  {
    key: 'beneficiaries',
    icon: <UserOutlined />,
    label: 'Beneficiaries',
  },
  {
    key: 'vendor',
    icon: <ShopOutlined />,
    label: 'Vendor',
  },
  {
    key: 'tenants',
    icon: <TeamOutlined />,
    label: 'Tenants',
  },
  {
    key: 'pending-approvals',
    icon: <ExclamationCircleOutlined />,
    label: 'Pending Approvals',
  },
  {
    key: 'events',
    icon: <CalendarOutlined />,
    label: 'Events',
  },
  {
    key: 'leaderboard',
    icon: <TrophyOutlined />,
    label: 'Leaderboard',
  },
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Settings',
  },
];
```

## 🔗 Required Navigation Handler

Every page **MUST** include this navigation handler:

```tsx
const handleMenuClick = (e: { key: string }) => {
  switch (e.key) {
    case 'dashboard':
      navigate('/');
      break;
    case 'donors':
      navigate('/donors');
      break;
    case 'beneficiaries':
      navigate('/beneficiaries');
      break;
    case 'vendor':
      navigate('/vendor');
      break;
    case 'tenants':
      navigate('/tenants');
      break;
    case 'pending-approvals':
      navigate('/pending-approvals');
      break;
    case 'events':
      navigate('/events');
      break;
    case 'leaderboard':
      navigate('/leaderboard');
      break;
    case 'settings':
      navigate('/settings');
      break;
    default:
      break;
  }
};
```

## 🚫 What NOT to Do

### ❌ Don't Create Page-Specific Styles
```css
/* BAD - Don't do this */
.dashboard-menu { ... }
.donors-sider { ... }
.vendor-menu .ant-menu-item { ... }
```

### ❌ Don't Override Standard Classes
```css
/* BAD - Don't do this */
.standard-menu {
  background: blue !important; /* Overriding standards */
}
```

### ❌ Don't Use Different Menu Items
```tsx
// BAD - Don't do this
<Menu.Item key="custom-page">Custom Page</Menu.Item>
```

## ✅ What TO Do

### ✅ Use Standard Classes
```css
/* GOOD - Import the standards */
@import '../styles/sidebar-standard.css';
```

### ✅ Follow Exact Structure
```tsx
// GOOD - Use exact structure
<Menu className="standard-menu" onClick={handleMenuClick}>
  {standardMenuItems.map(item => (
    <Menu.Item key={item.key} icon={item.icon}>
      {item.label}
    </Menu.Item>
  ))}
</Menu>
```

## 🧪 Testing Checklist

Before deploying any page, ensure:

- [ ] Sidebar looks identical to Tenant page
- [ ] All menu items are present and clickable
- [ ] Hover effects match exactly
- [ ] Selected states use brand orange (`#DB8633`)
- [ ] User profile section is positioned correctly
- [ ] Logo section matches standard sizing
- [ ] Main content has correct margin (`280px`)
- [ ] Mobile responsiveness works

## 🔄 Future Updates

When adding new pages:

1. **Copy** the exact structure from an existing compliant page
2. **Import** `sidebar-standard.css`
3. **Use** standard class names only
4. **Test** against the Tenant page reference
5. **Never** create page-specific sidebar styles

## 📞 Questions?

If you need to modify the sidebar design:

1. **Don't** modify individual pages
2. **Do** update `src/styles/sidebar-standard.css`
3. **Test** changes across ALL pages
4. **Ensure** consistency is maintained

---

**Remember**: The goal is 100% visual consistency across all admin panel pages. Every sidebar should look and behave identically! 🎯 