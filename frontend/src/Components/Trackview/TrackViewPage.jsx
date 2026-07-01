import React, { useEffect , useState } from 'react';
import './TrackViewPage.css';
import Tracks from "./Tracks.jsx";
import api from '../../services/api.js';

export default function TrackViewPage({trackID}) {

    const [courses , setCourses] = useState([])
    const [trackDetails , setTrackDetails] = useState({
      'Name':null,
      'Difficulty': null,
      'Courses_Count':null,
    })
  
  useEffect(() => {
    const fetchTrackCourses = async () => {
     try { 
      const response = await api.get(`/api/tracks/${trackID}/`)
      setTrackDetails({
        'Name':response.data.name,
        'Difficulty':response.data.difficulty_level,
        'Courses_Count':response.data.courses.length,  
      })

      setCourses(response.data.courses)
     }
     catch(err) {
      console.error(err);
     }
    }

    fetchTrackCourses();

  } , [])



  return (
    <div>
      <div className="track-view-cont">
        <h1 className="track-name">{trackDetails.Name}</h1>
        <p className="learning-track">Learning Track</p>

        <div className="track-info-cont">
          {/* <div className="track-info">Duration</div> */}
          <div className="track-info">{trackDetails.Difficulty} level</div>
          <div className="track-info">{trackDetails.Courses_Count} Courses</div>
        </div>
      </div>
      <Tracks Courses={courses} />
    </div>
  );
}
