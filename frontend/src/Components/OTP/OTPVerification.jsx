import React, { useState, useEffect, useRef } from 'react';
import * as Yup from 'yup';
import api from '../../services/api';
import './OTPVerification.css';
import { useNavigate } from 'react-router-dom';

// Validation Schema
const OTPValidationSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{6}$/, 'OTP must be 6 digits')
    .required('OTP is required'),
});

const OTPVerification = ({ onVerificationSuccess, email }) => {
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [modalError, setModalError] = useState({ show: false, message: '', type: 'error' });
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const otpInputRefs = useRef([]);
  const navigate = useNavigate();
  // Handle resend timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0 && isResendDisabled) {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendTimer, isResendDisabled]);

  // Handle OTP input change
  const handleOTPChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear error when user starts typing
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Resend OTP
  const handleResendOTP = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      // Send request to backend
      await api.post('/auth/resend-otp/', {
        email: email,
      });

      setModalError({
        show: true,
        message: 'OTP sent successfully to your email',
        type: 'success',
      });
      setIsResendDisabled(true);
      setResendTimer(60); // 60 seconds before resend
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.email?.[0] ||
        'Failed to send OTP. Please try again.';

      setModalError({
        show: true,
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    const otpString = otp.join('');

    // Validate OTP
    try {
      await OTPValidationSchema.validate({ otp: otpString });
    } catch (error) {
      setOtpError(error.message);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/auth/verify-otp/', {
        email: email,
        otp: otpString,
      });

      setModalError({
        show: true,
        message: 'OTP verified successfully!',
        type: 'success',
      });

      // Call success callback with response data
      if (onVerificationSuccess) {
        setTimeout(() => {
          onVerificationSuccess(response.data);
        }, 500);
      }

      setTimeout( () => {
      navigate('/Login');
      navigate(0);
      } , 2000);

    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.otp?.[0] ||
        'Invalid OTP. Please try again.';

      setModalError({
        show: true,
        message: errorMessage,
        type: 'error',
      });

      // Clear OTP on wrong attempt
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2 className="otp-title">Verify Your Email</h2>
        <p className="otp-subtitle">
          We've sent a 6-digit code to your email address
        </p>

        <form onSubmit={handleOTPSubmit}>
          <div className="otp-form-group">
            <label className="otp-label">Enter 6-Digit Code</label>

            <div className="otp-input-group">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="otp-digit-input"
                  placeholder="-"
                  disabled={isLoading}
                />
              ))}
            </div>

            {otpError && (
              <p className="otp-error">{otpError}</p>
            )}

            <button
              type="submit"
              className="otp-verify-btn"
              disabled={otp.join('').length !== 6 || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <div className="otp-resend-section">
              <p className="otp-resend-text">Didn't receive the code?</p>
              <button
                type="button"
                className="otp-resend-btn"
                onClick={handleResendOTP}
                disabled={isResendDisabled || isLoading}
              >
                {isResendDisabled
                  ? `Resend in ${resendTimer}s`
                  : 'Resend OTP'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Modal for Messages */}
      {modalError.show && (
        <div className="otp-modal-overlay" onClick={() => setModalError({ ...modalError, show: false })}>
          <div
            className={`otp-modal-content ${modalError.type}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="otp-modal-icon">
              {modalError.type === 'success' ? '✓' : '✕'}
            </div>
            <p className="otp-modal-message">{modalError.message}</p>
            <button
              className="otp-modal-btn"
              onClick={() => setModalError({ ...modalError, show: false })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
