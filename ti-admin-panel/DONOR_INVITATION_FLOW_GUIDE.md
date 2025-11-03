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

**React Native (Recommended Approach):**

```javascript
// In App.js or App.tsx
import React, { useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

export default function App() {
  const [initialUrl, setInitialUrl] = useState(null);
  
  useEffect(() => {
    // Handle deep links when app is opened from closed state
    Linking.getInitialURL().then(url => {
      if (url) {
        setInitialUrl(url);
        handleDeepLink(url);
      }
    });
    
    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  const handleDeepLink = (url) => {
    console.log('Deep link received:', url);
    
    // Parse URL: yourapp://verify?token=abc123
    // OR: https://yourapp.com/verify-email?token=abc123 (Universal Links)
    try {
      const parsedUrl = new URL(url);
      const token = parsedUrl.searchParams.get('token');
      
      if (parsedUrl.pathname.includes('verify') && token) {
        // Navigate to verification screen with token
        navigationRef.current?.navigate('EmailVerification', { token });
      }
    } catch (error) {
      console.error('Error parsing deep link:', error);
    }
  };
  
  // Create navigation ref for navigation from outside component
  const navigationRef = React.useRef(null);
  
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        // Handle initial URL after navigation is ready
        if (initialUrl) {
          handleDeepLink(initialUrl);
        }
      }}
    >
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="EmailVerification" 
          component={EmailVerificationScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Alternative: Using react-navigation with Linking**

```javascript
// Using React Navigation's built-in deep linking
import { NavigationContainer } from '@react-navigation/native';

const linking = {
  prefixes: ['yourapp://', 'https://yourapp.com'],
  config: {
    screens: {
      EmailVerification: {
        path: 'verify-email',
        parse: {
          token: (token) => token,
        },
      },
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

#### 2.2 Email Verification Screen (React Native)

Create a new screen in your mobile app that:

1. **Receives the verification token** (from deep link or manual entry)
2. **Verifies the token with backend**
3. **Pre-fills the email** (from backend response)
4. **Asks for password and other required info**
5. **Creates the authenticated account**

**Complete React Native Implementation:**

```typescript
// screens/EmailVerificationScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { API_BASE_URL } from '../config';

interface RouteParams {
  token?: string;
}

export default function EmailVerificationScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { token } = route.params as RouteParams;
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(!!token);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setError('No verification token provided');
      setVerifying(false);
    }
  }, [token]);
  
  const verifyToken = async (verificationToken: string) => {
    try {
      setVerifying(true);
      setError('');
      
      // Call your backend to verify token and get user info
      const response = await fetch(
        `${API_BASE_URL}/auth/verify-email?token=${verificationToken}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success && data.user) {
        setEmail(data.user.email);
        setName(data.user.name || '');
        setVerified(true);
        setVerifying(false);
      } else {
        setError(data.error || 'Invalid or expired verification link');
        setVerifying(false);
        Alert.alert(
          'Verification Failed',
          'This verification link is invalid or has expired. Please contact support.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login' as never)
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Token verification error:', error);
      setError('Failed to verify email. Please check your connection.');
      setVerifying(false);
      Alert.alert('Error', 'Failed to verify email. Please try again.');
    }
  };
  
  const completeSignup = async () => {
    // Validation
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 1. Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: undefined, // We've already verified email
          data: {
            name: name,
            role: 'donor'
          }
        }
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }
      
      // 2. Update user record with auth user ID and mark as active
      const { error: updateError } = await supabase
        .from('users')
        .update({
          auth_user_id: authData.user.id,
          status: 'active',
          completed_at: new Date().toISOString(),
          email_verified_at: new Date().toISOString()
        })
        .eq('email', email);
      
      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
      
      // 3. Sign in the user automatically
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (signInError) throw signInError;
      
      // 4. Navigate to main app (reset navigation stack)
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }]
      });
      
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to complete signup');
      Alert.alert('Error', error.message || 'Failed to complete signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (verifying) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#DB8633" />
        <Text style={styles.loadingText}>Verifying your email...</Text>
      </View>
    );
  }
  
  if (!verified) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Verification failed'}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Signup</Text>
          <Text style={styles.subtitle}>Your email has been verified!</Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={email}
              editable={false}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          
          {name && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={name}
                editable={false}
                placeholder="Name"
              />
            </View>
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password (min 8 characters)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
          </View>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={completeSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Complete Signup</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 400,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#324E58',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8c8c8c',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#324E58',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#8c8c8c',
  },
  button: {
    backgroundColor: '#DB8633',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8c8c8c',
  },
});
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

## 📱 React Native Specific Setup

### Required Packages

```bash
# Install React Navigation
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# For deep linking (optional - React Navigation has built-in support)
npm install react-native-linking  # Usually already included

# Supabase client
npm install @supabase/supabase-js

# For forms and validation (optional but recommended)
npm install react-hook-form yup @hookform/resolvers
```

### Configuration Files

#### 1. app.json / app.config.js (Expo) or AndroidManifest.xml & Info.plist

**For Expo:**
```json
{
  "expo": {
    "scheme": "yourapp",
    "ios": {
      "bundleIdentifier": "com.yourapp.app",
      "associatedDomains": ["applinks:yourapp.com"]
    },
    "android": {
      "package": "com.yourapp.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "yourapp.com",
              "pathPrefix": "/verify-email"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

**For React Native CLI - AndroidManifest.xml:**
```xml
<manifest>
  <application>
    <activity android:name=".MainActivity">
      <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
          android:scheme="https"
          android:host="yourapp.com"
          android:pathPrefix="/verify-email" />
      </intent-filter>
      <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="yourapp" />
      </intent-filter>
    </activity>
  </application>
</manifest>
```

**For React Native CLI - Info.plist (iOS):**
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>yourapp</string>
    </array>
  </dict>
</array>
```

### Navigation Setup Example

```typescript
// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import EmailVerificationScreen from '../screens/EmailVerificationScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';

const Stack = createStackNavigator();

const linking: LinkingOptions = {
  prefixes: ['yourapp://', 'https://yourapp.com'],
  config: {
    screens: {
      EmailVerification: {
        path: 'verify-email/:token?',
        parse: {
          token: (token: string) => token,
        },
      },
      Home: 'home',
      Login: 'login',
    },
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Supabase Service Example

```typescript
// services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mdqgndyhzlnwojtubouh.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native
  },
});
```

### API Config Example

```typescript
// config/api.ts
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api' // Development
  : 'https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api'; // Production

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

---

## 🧪 Testing the Flow

### 1. Test Deep Linking (iOS Simulator)

```bash
# In terminal
xcrun simctl openurl booted "yourapp://verify-email?token=test-token-123"
```

### 2. Test Deep Linking (Android Emulator)

```bash
# In terminal
adb shell am start -W -a android.intent.action.VIEW -d "yourapp://verify-email?token=test-token-123" com.yourapp.app
```

### 3. Test Universal Links (iOS - requires device)

1. Send test email with verification link
2. Open email on iOS device
3. Tap link → Should open app directly

### 4. Test App Links (Android - requires device)

1. Send test email with verification link
2. Open email on Android device
3. Tap link → Should open app directly

---

## 📞 Support & Questions

If you need help implementing any part of this flow:
- Backend API endpoints
- React Native deep linking setup
- Email service configuration
- Token generation and validation
- Supabase authentication integration
- Navigation flow implementation

Let me know which part you'd like to start with!

