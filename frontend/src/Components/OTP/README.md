# OTP Verification Component

A clean, professional React component for OTP verification. Designed to work after email has been sent during signup. Features 6 individual input fields with smart keyboard navigation, resend functionality, and responsive design.

## Features

✅ **6-Digit OTP Input** - Individual input fields with auto-focus navigation
✅ **Smart Keyboard Navigation** - Auto-focus next field, backspace to previous
✅ **Resend Functionality** - 60-second cooldown timer with countdown display
✅ **Error Handling** - Modal alerts for errors and success messages
✅ **Loading States** - Disabled states during API calls
✅ **Dark Mode Support** - CSS variables for theme switching
✅ **Fully Responsive** - Mobile, tablet, and desktop optimized
✅ **Accessibility** - Proper labels, keyboard navigation, disabled states

## Installation

The component is already in your project:
- Component: `src/Components/OTP/OTPVerification.jsx`
- Styles: `src/Components/OTP/OTPVerification.css`
- Example: `src/Components/OTP/OTPVerification.example.jsx`

## Quick Start

### Import the Component

```jsx
import OTPVerification from '../Components/OTP/OTPVerification';
```

### Basic Usage

```jsx
import React from 'react';
import OTPVerification from '../Components/OTP/OTPVerification';

function OTPPage() {
  const handleVerificationSuccess = (data) => {
    // Store token and redirect
    localStorage.setItem('access', data.access);
    navigate('/dashboard');
  };

  return (
    <OTPVerification
      email="user@example.com" // Email passed from signup form
      onVerificationSuccess={handleVerificationSuccess}
    />
  );
}

export default OTPPage;
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `email` | String | Yes | User's email address to verify OTP for |
| `onVerificationSuccess` | Function | Yes | Callback function called after OTP verification |

### Callback Data Structure

After successful OTP verification, the callback receives:

```javascript
{
  success: true,
  message: "Email verified successfully",
  access: "jwt_token_here",
  user: {
    id: 1,
    email: "user@example.com",
    full_name: "John Doe",
    email_verified: true
  }
}
```

## Component Flow

### Step 1: User Receives OTP
```
Email was sent during signup → User receives 6-digit code
```

### Step 2: Enter Code
```
Component displays 6 input fields → User enters digits
Auto-focus moves between fields → Backspace navigates back
```

### Step 3: Verify
```
User taps "Verify OTP" → Backend validates code
Success: callback triggered → Redirect to dashboard
```

### Step 4: Resend (if needed)
```
"Resend OTP" button shows countdown (60 seconds)
After timer expires → Can click "Resend OTP" again
```

## Backend API Requirements

Your backend must implement this endpoint:

### Verify OTP Endpoint

**URL:** `POST /auth/verify-otp/`

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200/201):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}
```

**Error Response (400):**
```json
{
  "otp": ["Invalid OTP"]
}
// or
{
  "otp": ["OTP expired"]
}
```

## Styling & Customization

### CSS Variables

```css
--otp-primary: #0031e1;      /* Main button color */
--otp-success: #14a44d;      /* Success message color */
--otp-error: #dc3545;        /* Error message color */
--otp-bg: #fafafa;           /* Background */
--otp-text: #0a0a0a;         /* Text color */
--otp-border: #e0e0e0;       /* Border color */
--otp-light-gray: #f5f5f5;   /* Light background */
```

## Keyboard Navigation

| Key | Behavior |
|-----|----------|
| `0-9` | Enter digit, auto-focus next field |
| `Backspace` | Delete digit, focus previous field |
| `Tab` | Move to next field |
| `Shift+Tab` | Move to previous field |
| `Enter` | Submit form when OTP complete |

## Integration with Signup Flow

### Example: Complete Signup with OTP

```jsx
import React, { useState } from 'react';
import SignupForm from './SignupForm';
import OTPVerification from '../OTP/OTPVerification';

function SignupPage() {
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [userEmail, setUserEmail] = useState('');

  const handleSignupSubmit = async (formData) => {
    try {
      // Send OTP to email
      await api.post('/auth/send-otp/', {
        email: formData.email
      });
      setUserEmail(formData.email);
      setStep('otp');
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  const handleOTPVerified = (data) => {
    // Save token
    localStorage.setItem('access', data.access);
    localStorage.setItem('user', JSON.stringify(data.user));
    // Redirect
    navigate('/dashboard');
  };

  return (
    <>
      {step === 'form' && (
        <SignupForm onSubmit={handleSignupSubmit} />
      )}
      {step === 'otp' && (
        <OTPVerification
          email={userEmail}
          onVerificationSuccess={handleOTPVerified}
        />
      )}
    </>
  );
}

export default SignupPage;
```

## Input Validation

- **OTP Input**: Must be exactly 6 digits
- **Only numeric characters** allowed
- **Auto-validates** as user enters digits

## Error Handling

Component handles various error scenarios:

1. **Invalid OTP** - Shows modal with error, clears input
2. **Expired OTP** - Shows resend option
3. **Invalid Email** - Shows error message
4. **Network Error** - Modal with error message
5. **Server Error** - Shows backend error in modal

## Responsive Breakpoints

| Breakpoint | Changes |
|-----------|---------|
| < 600px | Reduced padding, smaller fonts |
| < 420px | Mobile optimized, compact layout |

## Dark Mode Support

The component automatically uses dark mode colors when `body.dark-mode` class is present.

## Accessibility Features

- Proper `<label>` elements
- Keyboard navigation support
- Focus indicators on all interactive elements
- Disabled states clearly indicated
- ARIA-friendly error messages

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Minimal re-renders using React hooks
- Efficient state management
- GPU-accelerated CSS animations
- ~11 KB total size (with styles)

## Troubleshooting

### OTP Verification Failing
- Check OTP matches exactly (60-second expiry typical)
- Verify backend `/auth/verify-otp/` endpoint
- Check browser console for API errors
- Ensure email matches between send and verify

### Styling Issues
- Verify CSS file is imported
- Check for CSS variable conflicts
- Confirm dark mode class is properly applied

### Button State Not Updating
- Verify API calls are completing
- Check browser console for errors
- Ensure loading state is working

## API Integration Tips

1. **Use the existing api service**:
   ```javascript
   import api from '../../services/api';
   await api.post('/auth/verify-otp/', { email, otp });
   ```

2. **Store tokens after verification**:
   ```javascript
   localStorage.setItem('access', data.access);
   ```

3. **Error format from backend**:
   ```json
   {
     "field_name": ["error message"],
     // or
     "message": "general error"
   }
   ```

## Component Size

- **JSX:** ~4.2 KB
- **CSS:** ~6.8 KB
- **Total:** ~11 KB

## Part of Learn Programming Platform
