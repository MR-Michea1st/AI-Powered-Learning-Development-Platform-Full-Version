import api from '../services/api';
import React, { useEffect } from 'react'
import {createContext , useState , useContext} from 'react'
import { useAuth } from './AuthContext';

const UserDetailsContext = createContext({ userDetails: null, setUserDetails: null })

export function UserDetailsProvider({children}) {
   
  const [userDetails, setUserDetails] = useState(null);
  const { token } = useAuth();
 
  useEffect(() => {
    const fetchUserDetails = async () => {
        
       try { 
            const res = await api.get('/auth/profile/' , {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
           // console.log(res.data);
            
            setUserDetails(res.data);

        }

        catch(err) {
            console.error("failed to fetch user info because :: " , err);
        }
    }

    if (token) {
      fetchUserDetails();
    }
  } , [token])

  return (
    <UserDetailsContext.Provider value={{userDetails , setUserDetails}}>
      {children}
    </UserDetailsContext.Provider>
  );
}

export function useUserDetails() {
  return useContext(UserDetailsContext);
}