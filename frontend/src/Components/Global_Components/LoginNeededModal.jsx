import React from 'react'
import './LoginNeededModal.css'

function LoginNeededModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleLogin = () => {
    window.location.href = '/Login';
  };

  const handleSignup = () => {
    window.location.href = '/Signup';
  };

  return (
    <>
      {/* Darkened Backdrop */}
      <div className='login-backdrop' onClick={onClose}></div>

      {/* Modal Window */}
      <div className='login-modal'>
        <div className='modal-header'>
          <h2>Login Required</h2>
        </div>

        <div className='modal-content'>
          <div className='login-icon'>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="30" r="15" fill="#667eea" />
              <path d="M20 50C20 40 28 32 40 32C52 32 60 40 60 50V70H20V50Z" fill="#667eea" />
            </svg>
          </div>

          <div className='login-details'>
            <h3>Access This Feature</h3>
            <p className='login-message'>You need to be logged in to access this feature. Join us today and start learning!</p>
          </div>
        </div>

        <div className='modal-footer'>
          <button className='btn-cancel' onClick={onClose}>Cancel</button>
          <div className='button-group'>
            <button className='btn-secondary' onClick={handleLogin}>Login</button>
            <button className='btn-primary' onClick={handleSignup}>Sign Up</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginNeededModal