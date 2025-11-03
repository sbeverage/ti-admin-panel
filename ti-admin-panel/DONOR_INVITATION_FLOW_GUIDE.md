# 📧 Donor Invitation & Email Verification Flow Guide

## 🎯 Overview

This guide covers implementing a complete donor invitation flow where:
1. Admin adds a donor in the admin panel
2. Donor receives an invitation email
3. Donor verifies their email address
4. Donor downloads the mobile app
5. Donor completes signup in the app using the verified token

---

## ✅ Recommended Flow (Best Practice)

### Step-by-Step Process

```
1. Admin Panel → Add Donor
   ↓
2. Backend → Create pending donor record + Generate verification token
   ↓
3. Backend → Send invitation email with verification link
   ↓
4. Donor → Clicks email link → Email verified
   ↓
5. Donor → Redirected to app store (iOS/Android) or opens app via deep link
   ↓
6. Mobile App → Opens with verification token
   ↓
7. Mobile App → Pre-fills email, asks for password & completes signup
   ↓
8. Mobile App → Creates authenticated user account
```

---

## 🔧 Implementation Details

### Phase 1: Backend Changes

#### 1.1 Update Donor Creation Endpoint

When creating a donor from the admin panel, the backend should:

```typescript
// In your Supabase Edge Function: POST /api/admin/donors

// 1. Create donor with pending status
const { data: donor, error } = await supabase
  .from('users')
  .insert({
    email: donorData.email,
    name: donorData.name,
    phone: donorData.phone,
    role: 'donor',
    status: 'pending_verification', // NEW: Track verification status
    invited_by: adminUserId, // Track who invited them
    invited_at: new Date().toISOString(),
    // Don't create auth user yet - wait for email verification
  })
  .select()
  .single();

// 2. Generate email verification token
const verificationToken = crypto.randomUUID(); // Or use a library like uuid
const tokenExpiry = new Date();
tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 24 hours

// 3. Store verification token
await supabase
  .from('email_verification_tokens')
  .insert({
    user_id: donor.id,
    token: verificationToken,
    email: donorData.email,
    expires_at: tokenExpiry.toISOString(),
    type: 'donor_invitation'
  });

// 4. Send invitation email
await sendInvitationEmail({
  to: donorData.email,
  name: donorData.name,
  verificationLink: `https://yourapp.com/verify-email?token=${verificationToken}`,
  appStoreLinks: {
    ios: 'https://apps.apple.com/app/your-app',
    android: 'https://play.google.com/store/apps/details?id=your.app'
  }
});
```

#### 1.2 Create Email Verification Endpoint

```typescript
// GET /api/auth/verify-email?token={verificationToken}

// 1. Verify token exists and is valid
const { data: tokenData } = await supabase
  .from('email_verification_tokens')
  .select('*, users(*)')
  .eq('token', token)
  .eq('type', 'donor_invitation')
  .single();

if (!tokenData || new Date(tokenData.expires_at) < new Date()) {
  return { success: false, error: 'Invalid or expired token' };
}

// 2. Mark email as verified
await supabase
  .from('users')
  .update({
    status: 'email_verified',
    email_verified_at: new Date().toISOString()
  })
  .eq('id', tokenData.user_id);

// 3. Delete used token
await supabase
  .from('email_verification_tokens')
  .delete()
  .eq('id', tokenData.id);

// 4. Return app deep link or redirect
return {
  success: true,
  appDeepLink: `yourapp://verify?token=${token}`, // For mobile app
  fallbackUrl: 'https://apps.apple.com/app/your-app' // Fallback to app store
};
```

#### 1.3 Email Service Setup

You'll need an email service. Recommended options:

**Option A: Supabase Email Templates**
- Configure in Supabase Dashboard → Authentication → Email Templates
- Customize the invitation email template

**Option B: Third-party Service (Recommended for Production)**
- **SendGrid** (Recommended) - Free tier: 100 emails/day
- **Resend** - Modern API, great developer experience
- **AWS SES** - Cost-effective at scale
- **Postmark** - Best deliverability

**Example with SendGrid:**

```typescript
// supabase/functions/send-invitation-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { to, name, verificationLink, appStoreLinks } = await req.json();
  
  const emailContent = `
    <html>
      <body>
        <h2>Welcome to [Your App Name]!</h2>
        <p>Hello ${name},</p>
        <p>You've been invited to join as a donor. Please verify your email address to get started:</p>
        <a href="${verificationLink}" style="background: #DB8633; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Verify Email & Download App
        </a>
        <p>Or copy this link: ${verificationLink}</p>
        <hr>
        <p>Download our app:</p>
        <a href="${appStoreLinks.ios}">Download for iOS</a> | 
        <a href="${appStoreLinks.android}">Download for Android</a>
      </body>
    </html>
  `;

  // Send via SendGrid, Resend, etc.
  await sendEmail({
    to,
    subject: 'Verify your email to join [Your App]',
    html: emailContent
  });
});
```

---

### Phase 2: Mobile App Frontend Changes

#### 2.1 Deep Linking Setup

**iOS (Swift/SwiftUI):**

```swift
// In AppDelegate.swift or App.swift
import SwiftUI

@main
struct YourApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .onOpenURL { url in
                    handleDeepLink(url)
                }
        }
    }
    
    func handleDeepLink(_ url: URL) {
        if url.scheme == "yourapp" && url.host == "verify" {
            // Extract token from query parameters
            if let token = URLComponents(url: url, resolvingAgainstBaseURL: true)?
                .queryItems?.first(where: { $0.name == "token" })?.value {
                // Navigate to verification screen
                navigateToVerificationScreen(token: token)
            }
        }
    }
}
```

**Android (Kotlin/Compose):**

```kotlin
// In AndroidManifest.xml
<activity
    android:name=".MainActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="yourapp"
            android:host="verify" />
    </intent-filter>
</activity>

// In MainActivity.kt
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Handle deep link if app was opened via link
    intent?.data?.let { uri ->
        if (uri.scheme == "yourapp" && uri.host == "verify") {
            val token = uri.getQueryParameter("token")
            token?.let {
                navigateToVerificationScreen(it)
            }
        }
    }
}
```

**React Native:**

```javascript
// Install: npm install react-native-deep-linking
import { Linking } from 'react-native';
import DeepLinking from 'react-native-deep-linking';

// In App.js or App.tsx
useEffect(() => {
  // Handle deep links when app is already open
  const subscription = Linking.addEventListener('url', handleDeepLink);
  
  // Handle deep links when app is opened from closed state
  Linking.getInitialURL().then(url => {
    if (url) handleDeepLink({ url });
  });
  
  // Configure deep link routes
  DeepLinking.addScheme('yourapp://');
  DeepLinking.addRoute('/verify/:token', (response) => {
    navigateToVerificationScreen(response.token);
  });
  
  return () => subscription.remove();
}, []);

const handleDeepLink = ({ url }) => {
  if (url.includes('verify')) {
    const token = extractTokenFromUrl(url);
    navigateToVerificationScreen(token);
  }
};
```

#### 2.2 Email Verification Screen

Create a new screen in your mobile app that:

1. **Receives the verification token** (from deep link or manual entry)
2. **Verifies the token with backend**
3. **Pre-fills the email** (from backend response)
4. **Asks for password and other required info**
5. **Creates the authenticated account**

**Example Flow (React Native):**

```typescript
// screens/EmailVerificationScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';

export default function EmailVerificationScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const token = route.params?.token;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  
  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);
  
  const verifyToken = async (verificationToken: string) => {
    try {
      // Call your backend to verify token and get user info
      const response = await fetch(
        `https://your-api.com/auth/verify-email?token=${verificationToken}`
      );
      const data = await response.json();
      
      if (data.success) {
        setEmail(data.email); // Pre-fill email from backend
        setVerifying(false);
      } else {
        Alert.alert('Error', 'Invalid or expired verification link');
        navigation.navigate('Login');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify email');
      navigation.navigate('Login');
    }
  };
  
  const completeSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: undefined // We've already verified email
        }
      });
      
      if (authError) throw authError;
      
      // 2. Update user record with auth user ID
      const { error: updateError } = await supabase
        .from('users')
        .update({
          auth_user_id: authData.user?.id,
          status: 'active',
          completed_at: new Date().toISOString()
        })
        .eq('email', email);
      
      if (updateError) throw updateError;
      
      // 3. Sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (signInError) throw signInError;
      
      // 4. Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }]
      });
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete signup');
    } finally {
      setLoading(false);
    }
  };
  
  if (verifying) {
    return (
      <View>
        <Text>Verifying your email...</Text>
      </View>
    );
  }
  
  return (
    <View>
      <Text>Complete Your Signup</Text>
      <Text>Email: {email}</Text>
      
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      
      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      
      <Button
        title="Complete Signup"
        onPress={completeSignup}
        disabled={loading}
      />
    </View>
  );
}
```

#### 2.3 Universal Links / App Links (Advanced)

For better user experience, set up Universal Links (iOS) and App Links (Android):

**iOS Universal Links:**
- Configure `apple-app-site-association` file on your web server
- Allows direct app opening without redirects

**Android App Links:**
- Configure `.well-known/assetlinks.json` on your web server
- Allows direct app opening from verification email

**Example verification link structure:**

```
https://yourapp.com/verify-email?token={token}
```

When clicked:
- **Mobile device**: Opens app directly via Universal/App Link
- **Desktop**: Shows "Download App" page with QR code or links

---

### Phase 3: Web Verification Page (Fallback)

Create a web page for users who click the link on desktop:

```typescript
// pages/verify-email.tsx (Next.js example)
export default function VerifyEmail() {
  const router = useRouter();
  const { token } = router.query;
  
  useEffect(() => {
    if (token) {
      verifyAndRedirect(token);
    }
  }, [token]);
  
  const verifyAndRedirect = async (verificationToken: string) => {
    try {
      // Verify token
      const response = await fetch(
        `/api/auth/verify-email?token=${verificationToken}`
      );
      const data = await response.json();
      
      if (data.success) {
        // Show success message with app download links
        setShowSuccess(true);
      }
    } catch (error) {
      setError('Invalid verification link');
    }
  };
  
  return (
    <div>
      <h1>Email Verified!</h1>
      <p>Download our app to continue:</p>
      <a href="https://apps.apple.com/app/your-app">Download for iOS</a>
      <a href="https://play.google.com/store/apps/details?id=your.app">
        Download for Android
      </a>
      <p>Or open this link on your mobile device to continue in the app.</p>
    </div>
  );
}
```

---

## 📋 Implementation Checklist

### Backend Tasks
- [ ] Add `status` field to users table (pending_verification, email_verified, active)
- [ ] Create `email_verification_tokens` table
- [ ] Update POST `/api/admin/donors` to generate tokens and send emails
- [ ] Create GET `/api/auth/verify-email` endpoint
- [ ] Set up email service (SendGrid, Resend, etc.)
- [ ] Create email template for invitation
- [ ] Configure deep link handling

### Mobile App Tasks
- [ ] Configure deep linking scheme (yourapp://)
- [ ] Set up Universal Links (iOS) / App Links (Android)
- [ ] Create EmailVerificationScreen component
- [ ] Add navigation route for verification screen
- [ ] Implement token verification API call
- [ ] Implement password creation flow
- [ ] Handle Supabase auth signup
- [ ] Connect verified user to existing donor record
- [ ] Test deep link flow from email

### Web/Admin Panel Tasks
- [ ] Update admin panel to show invitation status
- [ ] Create verification status indicator in donor list
- [ ] Add resend invitation functionality
- [ ] Create web fallback page for desktop users

---

## 🔐 Security Considerations

1. **Token Expiration**: Tokens should expire after 24-48 hours
2. **Single Use**: Tokens should be deleted after successful verification
3. **Rate Limiting**: Limit email sending to prevent abuse
4. **Email Validation**: Verify email format before sending
5. **Password Requirements**: Enforce strong password policies
6. **HTTPS Only**: All verification links must use HTTPS

---

## 🎨 User Experience Flow

### Email Content Example

```
Subject: Welcome to [Your App] - Verify Your Email

Hi [Donor Name],

You've been invited to join [Your App] as a donor!

Click below to verify your email and get started:

[VERIFY EMAIL & DOWNLOAD APP]

Your verification link will expire in 24 hours.

Need help? Contact support@yourapp.com
```

### Mobile App Flow

1. User clicks email link → App opens automatically
2. App shows: "Email Verified! Complete your signup"
3. Pre-filled email field (read-only)
4. Password and confirm password fields
5. "Complete Signup" button
6. After signup → Navigate to onboarding/main app

---

## 🚀 Next Steps

1. **Start with backend**: Implement token generation and email sending
2. **Test email delivery**: Verify emails are being sent correctly
3. **Set up deep linking**: Configure mobile app deep links
4. **Build verification screen**: Create the mobile app verification flow
5. **Test end-to-end**: Test the complete flow from admin panel to app signup
6. **Add error handling**: Handle expired tokens, invalid links, etc.
7. **Add resend functionality**: Allow admins to resend invitations

---

## 📞 Support & Questions

If you need help implementing any part of this flow:
- Backend API endpoints
- Mobile app deep linking
- Email service setup
- Token generation and validation
- User authentication flow

Let me know which part you'd like to start with!

