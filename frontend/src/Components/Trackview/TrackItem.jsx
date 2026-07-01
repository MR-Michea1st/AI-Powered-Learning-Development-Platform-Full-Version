import React, { useEffect, useState } from 'react';
import './TrackViewPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import EnrollmentModal from '../Global_Components/EnrollmentModal';
import LoginNeededModal from '../Global_Components/LoginNeededModal';
import { useAuth } from '../../Context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function TrackItem({ course , userEnrolledCourses }) {

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const { token } = useAuth();
    const [isLoggingModalOpen , setIsLoggingModalOpen] = useState(false);
    const navigate = useNavigate()
    
    useEffect(()=>{
        console.log(userEnrolledCourses);
        console.log(course);
        
    })
   
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
            const response = await axios.post(`${API_URL}/api/courses/enroll/`,
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

 
  
  const handleCourseCancelEnrollment = () => {
    setIsModalOpen(false)
    setSelectedCourse(null)
  }


    return (
        <div className="course-item">
            <div className="course-row">
                <div className="course-name">{course.name}</div>
                {
                  !userEnrolledCourses.some((el)=>course.name === el.course_name) ?  
                 <button className='course-btn' onClick={() => handleCourseEnrollClick(course)}> Enroll</button>
                 
                 :
                 <button className='course-btn' onClick={() =>  navigate(`/Courses-and-Tracks/Course/${course.slug}`)
           }>Continue</button>
                
                }
            </div>
            {/* <div className="course-bar">
                <div className="course-fill" style={{ width: `${percent}%` }}></div>
            </div> */}

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


        </div>
    );
}
