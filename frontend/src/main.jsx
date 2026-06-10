import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './Context/AuthContext.jsx'
import { UserDetailsProvider } from './Context/UserDetailsContext.jsx'
import {GoogleOAuthProvider} from '@react-oauth/google'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider> 
        <UserDetailsProvider>      
          <App />
        </UserDetailsProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
