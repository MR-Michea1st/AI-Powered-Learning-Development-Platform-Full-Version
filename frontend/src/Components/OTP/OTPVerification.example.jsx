import React, { useEffect } from 'react';
import OTPVerification from '../OTP/OTPVerification';
import { useUserDetails } from '../../Context/UserDetailsContext';
import { useLocation } from 'react-router-dom';
/**
 * Example: How to use the OTPVerification component
 *
 * This example shows how to integrate the OTPVerification component
 * in your signup or email verification flow.
 */

export const OTPVerificationExample = () => {
  const location = useLocation();
  const {email} = location.state;
  
  useEffect(()=> {
    console.log(email);
    
  } , [])

  const handleVerificationSuccess = (data) => {
    console.log('OTP verified successfully:', data);
    // Redirect to next page or update app state
    // Example: navigate('/dashboard') or setUser(data.user)
  };

  return (
    <OTPVerification
      onVerificationSuccess={handleVerificationSuccess}
      email={email} // Optional: pre-fill email
    />
  );
};

/**
 * INTEGRATION STEPS:
 *
 * 1. Backend API Endpoints Required:
 *
 *    a) POST /auth/send-otp/
 *       Request body: { email: string }
 *       Response: { success: true, message: "OTP sent successfully" }
 *       Error responses:
 *       - 400: { email: ["Invalid email format"] }
 *       - 400: { message: "Email already verified" }
 *
 *    b) POST /auth/verify-otp/
 *       Request body: { email: string, otp: string }
 *       Response: { success: true, message: "OTP verified", user: {...}, token: "..." }
 *       Error responses:
 *       - 400: { otp: ["Invalid OTP"] }
 *       - 400: { otp: ["OTP expired"] }
 *       - 400: { message: "Invalid email" }
 *
 * 2. Usage in Signup Flow:
 *    - Component will first show email input and "Send OTP" button
 *    - After user enters email and clicks "Send OTP", backend sends OTP to that email
 *    - Component then shows 6 OTP input fields
 *    - User enters the 6-digit code received in email
 *    - Backend verifies and returns user data/token
 *
 * 3. Props:
 *    - onVerificationSuccess (Function): Callback after successful OTP verification
 *      Receives response data from backend (e.g., user info, tokens)
 *    - initialEmail (String, optional): Pre-fill email field
 *
 * 4. Component State Flow:
 *    - Initial: Email input visible, OTP inputs hidden
 *    - After "Send OTP": OTP inputs visible, email field disabled
 *    - After "Resend OTP": Timer shows before resend is allowed (60 seconds)
 *    - After successful verification: onVerificationSuccess callback called
 *
 * 5. Features:
 *    ✓ Email validation (format check)
 *    ✓ OTP input with auto-focus between fields
 *    ✓ Backspace navigation between OTP fields
 *    ✓ Resend functionality with 60-second cooldown timer
 *    ✓ Error handling with modal popups
 *    ✓ Success notifications
 *    ✓ Loading states for async operations
 *    ✓ Dark mode support (via CSS variables)
 *    ✓ Responsive design (mobile, tablet, desktop)
 *    ✓ Accessibility (disabled states, proper labels)
 */

/**
 * EXAMPLE BACKEND IMPLEMENTATIONS:
 *
 * Django (Python):
 *
 * @api_view(['POST'])
 * @permission_classes([AllowAny])
 * def send_otp(request):
 *     email = request.data.get('email')
 *     if not email:
 *         return Response({'email': ['Email is required']}, status=400)
 *
 *     # Generate 6-digit OTP
 *     otp_code = ''.join(random.choices(string.digits, k=6))
 *
 *     # Store in cache/database with 10-minute expiry
 *     cache.set(f'otp_{email}', otp_code, timeout=600)
 *
 *     # Send email
 *     send_mail(
 *         'Your OTP Code',
 *         f'Your verification code is: {otp_code}',
 *         'from@example.com',
 *         [email]
 *     )
 *
 *     return Response({'success': True, 'message': 'OTP sent successfully'})
 *
 * @api_view(['POST'])
 * @permission_classes([AllowAny])
 * def verify_otp(request):
 *     email = request.data.get('email')
 *     otp = request.data.get('otp')
 *
 *     stored_otp = cache.get(f'otp_{email}')
 *
 *     if not stored_otp or stored_otp != otp:
 *         return Response({'otp': ['Invalid OTP']}, status=400)
 *
 *     # OTP verified, create user or update status
 *     user = User.objects.get(email=email)
 *     user.email_verified = True
 *     user.save()
 *
 *     # Generate token
 *     refresh = RefreshToken.for_user(user)
 *
 *     cache.delete(f'otp_{email}')  # Clean up
 *
 *     return Response({
 *         'success': True,
 *         'message': 'Email verified successfully',
 *         'access': str(refresh.access_token),
 *         'user': UserSerializer(user).data
 *     })
 */

export default OTPVerificationExample;
