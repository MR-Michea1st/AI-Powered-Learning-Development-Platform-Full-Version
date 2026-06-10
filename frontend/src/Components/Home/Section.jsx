import React, { useEffect, useState } from 'react'
import './Section.css';
import courseImg from '../../assets/imgs/Technologies.jpg'
import aiInterviewerImg from '../../assets/imgs/aiAgent.jpg'
import learnerIcon from '../../assets/imgs/learner.png'
import laptopIcon from '../../assets/imgs/onlineCourse.png'
import interviewer from '../../assets/imgs/Interviewer.png';
import arrow from '../../assets/imgs/arrow.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useUserDetails } from '../../Context/UserDetailsContext';
import api from '../../services/api';

function Section() {

  const { token } = useAuth();
  const {userDetails} = useUserDetails()
  const [userCourses , setUserCourses] = useState([]);
  const [allCourses , setAllCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => { 
    if (userDetails?.enrolled_courses) {
      console.log(userDetails.enrolled_courses);
      
      setUserCourses(userDetails.enrolled_courses);
    }
  }, [userDetails]);
 
  useEffect(()=> {
    
    const fetchCourses = async () => {
    
      try {
        const response = await api.get('/api/courses/');
        //console.log(response.data.results);
        
        setAllCourses(response.data.results);  
      }

      catch(err) {
        console.error("failed to fetch courses because :: " , err);
        
      }

    }

    fetchCourses();
  } , []);
    
  return (


    <div className='sect-cont'>
       
     { !token ?  
        <div className='Hero'>
          <h1 className='sect-title'>CodeVerse</h1>
          <h3 className='sect-subtitle'>Your Gateway to Coding Mastery.< br/> <br/>
          Start learning and developing your future software, It is your time<br/> to shine in the development Universe!
          </h3>
        
          <br/>
    
          <div className='btns'>
            <Link to='/Signup'> <button className='get-started'>Get Started</button> </Link>
          </div>
        </div>
        :
        <> 
          <h1 style={{textAlign:'center', fontSize:'350%'}}>Hello Again {userDetails?.full_name}</h1> 
          <div className='cont-learn'>
            { userCourses.length > 0 ?  
              <h2>Continue your learning: </h2>
              :
              <h2 style={{textAlign:'center'}}>You are not enrolled in any course yet ! </h2>
            }

            { userCourses?.length > 0 ?
              userCourses?.map((course) => (
                <div key={course.id} className = "cont-learn-course">
                  <p>{course.course_name}</p>
                  <button onClick={()=> navigate(`/Courses-and-Tracks/Course/${allCourses?.find((el) => course.course === el.id).slug}/`)}>Continue</button>
                </div>
              
                )
              )
              :
              <></>
            }
          </div>
        </>   
      }

          <br/>
          <br/>
        <h1 className='Why'>Why CodeVerse ?</h1>
        <div className='features-cont'>
        
          <div className='feature-box'>
            <img src = {learnerIcon} alt='Online Learner' />
            <h3 className='feature-title'>Learn at your own<br/> pace</h3>
          </div>
          
          <hr className='features-hr'/>
            
          <div className='feature-box'>
            <img src = {laptopIcon} alt='Online Courses' />
            <h3 className='feature-title'>+20 Courses in <br/> Different Aspects</h3>
          </div>
           
          <hr className='features-hr'/>
          
          <div className='feature-box'>
            <img src = {interviewer} alt='Interviewer' />
            <h3 className='feature-title'>Get ready for your<br/> job interview</h3>
          </div>
        
        </div>



     <Link className='link-to' to='/Courses-and-Tracks'>
      <div className='exp-courses'> 
           <img src = {courseImg} alt='Technologies' />
           <hr className='exp-courses-hr'/>
           <h2 className='exp-courses-h2'>Explore Our Courses <br/> in Different fields and <br/> stacks</h2>   
           <img src={arrow} alt = 'Arrow'/>
        
      </div>    
     </Link> 
      
     <Link className='link-to' to='/AI-Interview'> 
      <div className='check-out'> 
           <img src={arrow} alt = 'Arrow'/>
           <h2 className='check-out-h2'>Check out your <br/> experience with our <br/> AI-Powered <br/>Interviewer</h2>   
           <hr className='check-out-hr'/>
           <img src = {aiInterviewerImg} alt='AI Agent' />
            
      </div>    
     </Link>
       
    </div>
  )
}

export default Section