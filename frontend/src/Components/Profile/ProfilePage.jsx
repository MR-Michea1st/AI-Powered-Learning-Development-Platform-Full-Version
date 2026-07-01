import React from 'react';
import './Profile.css';
import Info from './Info';
import Favourites from './EnrolledCourses';
import Skills from './Skills';
import { useAuth } from '../../Context/AuthContext';
import { useEffect , useState } from 'react';
import api from '../../services/api';
import EnrolledCourses from './EnrolledCourses';
import axios from 'axios';

export default function ProfilePage() {
    const { token } = useAuth()
    const [userData , setUserData] = useState({
      'email': null, 
      'full_name':null ,
      'profile_picture':null,
      'enrolledCourses':[],
      'interviewResults':[],
    })

    const [userInterviews , setUserInterviews] = useState([]);

    useEffect(()=> {
        console.log(token);
        
        const fetchUserDetails = async () => {
        try {
          const response = await api.get('/auth/profile/' , {
            headers: {
            'Authorization':`Bearer ${token}`,
            }
          })
          
          console.log(response);
          
          setUserData({
            'full_name':response.data.full_name,
            'email':response.data.email,
            'profile_picture':response.data.profile_picture,
            'enrolledCourses':response.data.enrolled_courses,
            'interviewResults':[],
          })

        }

        catch(err){
          console.error("because:: " , err);
        }

      }

      fetchUserDetails();

    }, [])

    const handleAddImage = () => {

      const img_val = document.getElementById('profile-img').files[0];
      if (!img_val) return;

      const updateImage = async () => {
        try {
          const formData = new FormData();
          formData.append('profile_picture', img_val);

          const response = await api.patch('/auth/profile/update/', formData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            }
          });

          console.log(response);

          setUserData({
            'full_name': userData.full_name,
            'email': userData.email,
            'enrolledCourses': userData.enrolledCourses,
            'profile_picture': response.data.profile_picture,
            'interviewResults': [],
          });
        }
        catch(err) {
          console.error(err);
        }
      };

      updateImage();
    } 


    useEffect(() => {
      const fetchInterviews = async () => {
        try {
          const response = await axios.get('http://127.0.0.1:8000/api/interviews/' , {
            headers:{
              Authorization:`Bearer ${token}`
            }
          });
          console.log(response);
          setUserInterviews(response.data.results)
        } catch (err) {
          console.error(err);
        }
      }

      fetchInterviews();
    } , [])


    return (
        <main className="profile-page">
           <div className='profile-hero'> 
              <div className='info-section'>
                  <Info name={userData.full_name} email={userData.email} avatar={userData.profile_picture} />
              </div>
              <button className='add-pic' onClick={()=> document.getElementById('profile-img').click()}>
                <span className='pic-icon'>📷</span>
                <span className='pic-text'>Change Profile Picture</span>
                <input id='profile-img' type='file' accept='image/*' hidden onChange={handleAddImage} />
              </button>
            </div>
            <section className="profile-sections">
                <EnrolledCourses enrolled_courses={userData.enrolledCourses} />
                <Skills skills={userInterviews} />
            </section>
        </main>
    );
}
