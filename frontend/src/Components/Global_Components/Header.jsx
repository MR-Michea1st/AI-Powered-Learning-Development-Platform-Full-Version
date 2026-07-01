import {useState, useEffect} from 'react'; 
import './Header.css';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import Search from '../Courses_Page/Search';
import Section from '../Home/Section';
import LoginPage from '../Login/LoginPage';
import SignupPage from '../Signup/SignupPage';
import CourseVideos from '../Course_Videos/CourseVideos';
import AIInterviewer from '../AI_Interviewer/AI_Interviewer'
import ProfilePage from '../Profile/ProfilePage';
import { useAuth } from '../../Context/AuthContext.jsx';
import axios from 'axios';
import TrackViewPage from '../Trackview/TrackViewPage.jsx'
import GitHubCallback from './GitHubCallback.jsx';
import OTPVerification from '../OTP/OTPVerification.jsx';
import api from '../../services/api.js';
import OTPVerificationExample from '../OTP/OTPVerification.example.jsx';
// import {jwtDecode} from 'jwt-decode'


const Header = () => {  
  const [allCourses , setAllCourses] = useState([])
  const [allTracks , setAllTracks] = useState([])
  const [userData , setUserData] = useState({
    'email': null, 
    'full_name':null ,
    'profile_picture':null,
  })
  const [isLoggedIn , setIsLoggedIn] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark';
    } catch (err) {
      console.error("Error: " , err);
    }
  });

  const { token, setToken } = useAuth();
  const {navigate} = useNavigate() 
  
  useEffect(()=> {
    const fetchUserDetails = async () => {
      try {
          const response = await api.get('/auth/profile/' , {
            headers: {
            'Authorization':`Bearer ${token}`,
          }
        })
        
        //  console.log(response);
          
          setUserData({
            'email':response.data.email,
            'full_name':response.data.full_name,
            'profile_picture':response.data.profile_picture,
          })

        }
        
        catch(err) {
          console.log(err.code);  
          // console.log(err.response.status);
          console.error("failed to fetch user details because:: " , err);
        
          }
          
        }
        
        if (token) fetchUserDetails();
    }, [token])

    /* Route List for Courses playlist pages */
    const routList = [];
    useEffect(() => {
      const fetchAll = async() => {
        try {
          const response1 = await api.get('/api/courses/')
          const response2 = await api.get('/api/tracks/')
          
          // console.log(response1);
          
          setAllCourses(response1.data.results)
          setAllTracks(response2.data.results)
        }

        catch(err) {
          console.error(err);
        }
      }

      fetchAll();

    } , []) 


    allCourses.forEach(course => {
      routList.push(<Route path={`/Courses-and-Tracks/Course/${course.slug}`} element={<CourseVideos courseSlug={course.slug}/>} />)
    }); 
    
    allTracks.forEach(track => {
      routList.push(<Route path={`/Courses-and-Tracks/Track/${track.id}`} element={<TrackViewPage trackID={track.id}/>} />)
    }); 
    
    /* Ended Creating the Route List */
    
    useEffect(()=> {
      setIsLoggedIn(token !== null)
    } , [token])
    
    useEffect(() => {
      try {
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch (err) {
        // ignore in environments without localStorage
        console.error(err);
        
      }
    }, [isDark]);
    
    const handleLogout = async () => {
      try {
        const response = await api.post('/auth/logout/' , {
          'refresh':localStorage.getItem('refresh'),
        })
        
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        setToken(null)
        setIsLoggedIn(false)
      }
      
      catch(err) {
        console.error("failed to logout because :: " , err);
      }
      window.location.reload()
      navigate('/');
      
    }
    
   
    return (
        <>
        
          <ul className='header-ulist'>
            <NavLink className='link-to' to = "/"><li className='nav-link'>Home</li></NavLink>
            <NavLink className='link-to' to = "/Courses-and-Tracks"><li className='nav-link'>Courses & Tracks</li> </NavLink>
            <NavLink className='link-to' to="/AI-Interview"><li className='nav-link'>AI Interviewer</li></NavLink>

            {
                !isLoggedIn ?  
                <li className="nav-auth">
                  <div className="auth-buttons">
                    <NavLink className='link-to' to='/Signup'><button className='signUp'>Sign Up</button> </NavLink>
                    <NavLink className='link-to' to='/Login'><button className='logIn'>Login</button> </NavLink>
                  </div>
                </li>

                :
                <li className='nav-auth'>
                     
                        <img className='profile-pic' src={userData.profile_picture || 'https://www.w3schools.com/howto/img_avatar.png'} alt='Profile Pic' />
                     <NavLink className='link-to' to='/Profile'>
                        <i className='userName'>{userData.full_name}</i>
                     </NavLink>
                    <button className='logOut' onClick={handleLogout} style={{
                      backgroundColor:'red',
                      border:'none',
                      padding:'5px 10px 5px 10px',
                      
                      borderRadius:'5px',
                      cursor:'pointer',

                    }}>Log Out</button>
                </li>
            }

            <button
              className="theme-toggle"
              onClick={() => setIsDark(prev => !prev)}
              aria-label="Toggle theme"
              title="Toggle light / dark"
            >
              {isDark ? '☀️' : '🌙'}
            </button>


          </ul>

           {/* Routes  */}
          
            <Routes>
              <Route path="/" element={<Section />} />
              <Route path="/Courses-and-Tracks" element={<Search />} />
              <Route path="/Login" element={<LoginPage />} />
              <Route path="/Signup" element={<SignupPage />} />
              <Route path="/AI-Interview" element={<AIInterviewer />} />
              <Route path="/Profile" element={<ProfilePage />} />
              <Route path="/github/callback" element={<GitHubCallback />} />
              <Route path="/OTP-Verification" element={<OTPVerificationExample />} />
              {routList}
            </Routes>

        </>
    )


}

export default Header;