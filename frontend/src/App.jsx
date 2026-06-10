import './App.css';
import Header from './Components/Global_Components/Header.jsx';
import Footer from './Components/Global_Components/Footer.jsx'; 
import Section from './Components/Home/Section.jsx';
import LoginPage from './Components/Login/LoginPage.jsx';
import SignupPage from './Components/Signup/SignupPage.jsx';
import Search from './Components/Courses_Page/Search.jsx';
import CourseVideos from './Components/Course_Videos/CourseVideos.jsx';
import ProfilePage from './Components/Profile/ProfilePage.jsx';
import TrackViewPage from './Components/Trackview/TrackViewPage.jsx';
import AI_Interviewer from './Components/AI_Interviewer/AI_Interviewer.jsx';
// import {useAuth , AuthProvider} from './Context/AuthContext.jsx'
// import {useUserDetails , UserDetailsProvider } from './Context/UserDetailsContext.jsx';
// import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

function App() {
  
  // const {token} = useAuth()
  // const {userDetails} = useUserDetails()
 
  // useEffect(()=> {
  //   console.log("user details :: " , userDetails);
  //   console.log("token :: " , token);
    
  // } , [])
 
  return (
      <BrowserRouter>
        <div className="App">
          <Header />
          {/* <Search/> */}
          {/* <Section/> */}
          {/* <LoginPage /> */}
          {/* <CourseVideos playlistId={0}/> */}
          {/* <AIInterviewer /> */}
          {/* <TrackViewPage /> */}
          {/* <Section/> */}
          {/* <LoginPage /> */}
          {/* <SignupPage /> */}
          {/* <ProfilePage /> */}
          <Footer />
        </div>
      </BrowserRouter>

  );
}

export default App;
