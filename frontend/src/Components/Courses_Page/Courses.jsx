import React, { useEffect, useState } from 'react'
import './Courses.css'
// import youtubeCoursesIDs from '../Course_Videos/CourseVideos.jsx'
import { BrowserRouter , Route , Routes , NavLink , Link, useNavigate} from 'react-router-dom'
import CourseVideos from '../Course_Videos/CourseVideos.jsx'
import { Courses_Data } from '../../Data/CoursesData.jsx'
import EnrollmentModal from '../Global_Components/EnrollmentModal.jsx'
import LoginNeededModal from '../Global_Components/LoginNeededModal.jsx'
import { useUserDetails } from '../../Context/UserDetailsContext.jsx'
import { useAuth } from '../../Context/AuthContext.jsx'
import api from '../../services/api.js'

function Courses({ searchResults }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [allCourses, setAllCourses] = useState([])
  const [allTracks, setAllTracks] = useState([])
  const [isLoggingModalOpen , setIsLoggingModalOpen] = useState(false);
  const {token} = useAuth();
  const [numberOfShowedCourses  , setNumberOfShowedCourses] = useState(12);
  const {userDetails} = useUserDetails()
  const navigate = useNavigate();


  const handleCourseEnrollClick = (course) => {
   if (token) { 
    setSelectedCourse(course)
    setIsModalOpen(true)
   }

   else {
    setIsLoggingModalOpen(true);
   }
  }
  
  const handleCourseConfirmEnrollment = (ev) => {
    ev.preventDefault();
    const EnrollCourse = async () => {

      try {
        const response = await api.post('/api/courses/enroll/',
           {
            "course": selectedCourse.id,
           },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            }
          }
        )

        console.log(response);
        
        setIsModalOpen(false)
        setSelectedCourse(null)
        navigate(`/Courses-and-Tracks/Course/${selectedCourse.slug}`)
        console.log('Enrolled in course:', selectedCourse.name)
        
      }

      catch(err) {
        console.error("cannot enroll because: " , err);
      }

    }
    
    EnrollCourse();
  }
  
  const handleTrackViewClick = (track) => {
      if (!token) {
        setIsLoggingModalOpen(true);
        return ;
      }

      const EnrollTrack = async () => {
        navigate(`/Courses-and-Tracks/Track/${track.id}`)
      }

    EnrollTrack()
  }

  useEffect(() => {

    const fetchAllCoursesAndTracks = async () => {
    try {  
       
        const allCoursesRespone = await api.get('/api/courses');
        const allTracksRespone = await api.get('/api/tracks')
        setAllCourses(allCoursesRespone.data.results)
        setAllTracks(allTracksRespone.data.results)
      }

    catch(error) {
        console.error("error: " , error);
    }

    }

    fetchAllCoursesAndTracks()
  } , [])

  const handleCourseCancelEnrollment = () => {
    setIsModalOpen(false)
    setSelectedCourse(null)
  }

 

  const tracksToDisplay = allTracks
  
  return (
    <>
     {
       searchResults && searchResults.length > 0 ?
       <div>
         <h2 className='rec-h2'>Search Results</h2>
         
         <div className='rec-courses'>
          {
            searchResults.map((el, index) => (
              <div key={index} className='course-card'>
                    <img src={el.img || el.thumbnail} className='course-img' alt={el.name}/>
                    <h4>{el.name}</h4>
                    <h4>Instructor: {el.instructor.full_name}</h4>
                    {   !userDetails?.enrolled_courses.some(course => course.course_name === el.name) ?
                      
                      <button className='enroll-btn' onClick={() => handleCourseEnrollClick(el)}>   
                          Enroll Now
                      </button>
                      :
                      <button className='enroll-btn' onClick={() => navigate(`/Courses-and-Tracks/Course/${el.slug}`)}>   
                          Continue
                      </button>
                      
                    }
              </div>
            ))
          }
         </div>
       </div>
      :
      <></>
     }

     <h2 className='rec-h2'>Recommended Courses</h2>
     <div className='rec-courses'>
        {
          allCourses.slice(0,numberOfShowedCourses).map((el , index)=> {
              return (
                  <div key={index} className='course-card'>
                    <img src={el.img || el.thumbnail} className='course-img' alt={el.name}/>
                    <h4>{el.name}</h4>
                    <h4>Instructor: {el.instructor.full_name}</h4>
                    {   !userDetails?.enrolled_courses.some(course => course.course_name === el.name) ?
                      
                      <button className='enroll-btn' onClick={() => handleCourseEnrollClick(el)}>   
                          Enroll Now
                      </button>
                      :
                      <button className='enroll-btn' onClick={() => navigate(`/Courses-and-Tracks/Course/${el.slug}`)}>   
                          Continue
                      </button>
                      
                    }
                  </div>

              );
          })
        }
     </div>
     
     { numberOfShowedCourses < allCourses.length ?
      <button className='see-more' onClick = {()=>setNumberOfShowedCourses(allCourses.length)}>See More Courses</button>
      :
      <></>
     }

<h2 className='rec-h2'>All Tracks: </h2> 
     <div className='rec-courses'>
        {tracksToDisplay.length > 0 ? (
          tracksToDisplay.map((el , index)=> {
              return (
                  <div key={index} className='course-card'>
                    <img src={el.img || el.thumbnail} className='course-img' alt={el.name}/>
                    <h4>{el.name}</h4>
                    <h4>Description: {el.description}</h4>
                    <button className='enroll-btn' onClick={() => handleTrackViewClick(el)}>
                      View Track
                    </button>
                  </div>

              );
          })
        ) : (
          <p>No Tracks found. Try adjusting your filters or search terms.</p>
        )}
     </div>

    <EnrollmentModal
      isOpen={isModalOpen}
      course={selectedCourse}
      onConfirm={handleCourseConfirmEnrollment}
      onCancel={handleCourseCancelEnrollment}
    />


    <LoginNeededModal 
      isOpen={isLoggingModalOpen}
      onClose={() => setIsLoggingModalOpen(false)}
    />

    </>
  )
}

export default Courses