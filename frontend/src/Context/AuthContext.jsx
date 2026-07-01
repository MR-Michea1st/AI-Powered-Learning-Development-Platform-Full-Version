import React, { useEffect } from 'react'
import {createContext , useState , useContext} from 'react'

const AuthContext = createContext({ token: null, setToken: null })

export function AuthProvider({children}) {
    const [token, setToken] = useState(() => localStorage.getItem('access'));

    useEffect(() => {
      if (token) {
        localStorage.setItem('access', token);
      } else {
        localStorage.removeItem('access');
      }
    }, [token]);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}