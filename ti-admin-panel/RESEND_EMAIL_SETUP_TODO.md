# Resend Email Service Setup - To-Do List

## 🔴 Current Issue
The resend invitation feature is returning a 403 error from Resend API because the email domain/address is not verified.

## ✅ Required Actions

### 1. Domain Verification in Resend Dashboard
- [ ] Log into Resend dashboard
- [ ] Add and verify your sending domain (e.g., `yourdomain.com`)
- [ ] Complete DNS verification:
  - [ ] Add SPF record
  - [ ] Add DKIM record
  - [ ] Add DMARC record (optional but recommended)
- [ ] Verify domain verification is complete

### 2. From Email Address Configuration
- [ ] Ensure the "from" email address in the backend matches a verified domain
- [ ] Update backend code to use verified email (e.g., `noreply@yourdomain.com`)
- [ ] Test that the email format is correct

### 3. API Key Verification
- [ ] Verify Resend API key is correctly set in backend environment variables
- [ ] Check that API key has proper permissions (send emails)
- [ ] Verify API key is active and not expired

### 4. Testing
- [ ] Test resend invitation functionality after configuration
- [ ] Verify email is received successfully
- [ ] Check email formatting and content
- [ ] Verify deep links work correctly in emails

## 📝 Notes
- Error message shows: `statusCode: 403` - domain/email verification required
- Frontend error handling is already implemented to show detailed error messages
- Once domain is verified, the resend invitation feature should work automatically

## 🔗 Resources
- Resend Dashboard: https://resend.com
- Resend Documentation: https://resend.com/docs
- Domain Verification Guide: https://resend.com/docs/dashboard/domains/introduction
