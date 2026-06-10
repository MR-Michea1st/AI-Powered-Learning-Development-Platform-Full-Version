import React, { useState } from "react";
import TrackItem from "./TrackItem.jsx";
import './TrackViewPage.css';
import { useEffect } from "react";
import api from "../../services/api.js";
import { useAuth } from '../../Context/AuthContext.jsx';

export default function Tracks({ Courses }) {

    const [userEnrolledCourses , setUserEnrolledCourses] = useState([]);
    const { token } = useAuth();

    useEffect(() => {
    const fetchUserProfileDetails = async () => {
        try {
            const response = await api.get('/auth/profile/' , {
                headers:{
                   Authorization: `Bearer ${token}`, 
                },
            })

            console.log(response);
            setUserEnrolledCourses(response.data.enrolled_courses)
        }

        catch(err) {
            console.error("Can't fetch profile details because of :: " , err);       
        }


    }
    fetchUserProfileDetails();
  } , [])

    return (
        <section className="courses">
            <div className="courses-list">
                {Courses.map((s) => (
                    <TrackItem key={s.id} course={s.course}  userEnrolledCourses = {userEnrolledCourses}/>
                ))}
            </div>
        </section>
    );
}

