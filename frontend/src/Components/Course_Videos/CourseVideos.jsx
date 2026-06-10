import React, {useEffect, useState } from 'react'
import './CourseVideos.css'
import {fetchPlaylistName , fetchCourseVideos } from '../../API/youtube.jsx';
import api from '../../services/api.js';
import axios from 'axios';

function CourseVideos({courseSlug}) {

    const [activeVideo, setActiveVideo] = useState(null);
    const [Videos, setVideos] = useState([]);
    const [idxPlaying , setIdxPlaying] = useState(0);
    const [isAsideOpen, setIsAsideOpen] = useState(true);
    const [courseDetails , setCourseDetails] = useState({
      'courseID':null,
      'courseName':null,
      'courseInstructor':null,
      'courseDescription':null,
    })
    const [videoSummary , setVideoSummary] = useState('');
    const [loadingSummary , setLoadingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState('');

    useEffect(() => {
      const fetchCourseID = async () => {
         try {
          const res = await api.get(`/api/courses/${courseSlug}/`);
          console.log("the response: " , res);
          
          setCourseDetails({
            'courseID':res.data.playlist_id,
            'courseName':res.data.name,
            'courseInstructor':res.data.instructor.full_name,
            'courseDescription':res.data.description,
          })

          // console.log(res.data.playlist_id)

        } catch (error) {
          console.error("failed because" , error);
        } 
        
      }

      fetchCourseID()
      

    } , [])
    
    useEffect(()=> {
        if (!courseDetails.courseID) return;
        fetchCourseVideos(courseDetails.courseID).then(data => {
            //console.log(data);
            setVideos(data);
            setActiveVideo(data[0]);
        }).catch(err => console.error("Error fetching videos" , err)); 
      } , [courseDetails.courseID]);

    function changeVid(e) {
      // console.log(activeVideo);
      
      let idx = Number(e.target.closest('.thumb-wrapper').dataset.id);
      setVideoSummary('');
      setActiveVideo(Videos[idx]);
      setIdxPlaying(idx);
      if (window.innerWidth <= 768) setIsAsideOpen(false);
    }

    function nextVid() {
      let idx = idxPlaying;
      // console.log(idx+1);
      
      if (idx + 1 < Videos.length) {
        setVideoSummary('')
        setActiveVideo(Videos[idx+1]);
        setIdxPlaying(idx+1);
      }
    }

    function prevVid() {
      let idx = idxPlaying;
      // console.log(idx-1);
      
      if (idx - 1 >= 0) {
        setVideoSummary('');
        setActiveVideo(Videos[idx-1]);
        setIdxPlaying(idx-1);
      }
    }
    
    const handleSummerizeClick = async () => {
      setLoadingSummary(true);
      setSummaryError('');
      try {
        const response = await axios.post('http://127.0.0.1:8001/summary/api/youtube' , {
          url:`https://www.youtube.com/embed/${activeVideo.snippet.resourceId.videoId}`,
          mode:'summary'
        })
        console.log('summary response :: ' , response);
        setVideoSummary(response.data.summary);
        
      } catch (err) {
        console.error("failed to fetch summary because :: " , err);        
        setSummaryError("Failed to generate summary. Please try again later.");
      } finally {
        setLoadingSummary(false);
      }
    }
    
    return (
    <>
      <div className={`vid-cont ${isAsideOpen ? 'aside-open' : 'aside-closed'}`}> 
        <aside className={`playlist-aside ${isAsideOpen ? 'open' : 'closed'}`}>
                <h2 className='course-name'>{courseDetails.courseName || "Loading..."}</h2>
          
                {Videos?  Videos.map((vid , index) => (
                    <div className = 'thumb-wrapper' data-id={`${index}`}  key={index}>
                      <img
                        src={vid.snippet.thumbnails.medium.url}
                        className={`thumb ${idxPlaying === index && 'act-vid'}`}
                        key = {vid.snippet.resourceId.videoId}
                        width='100%'
                        height='100%'
                        //controls={true} // Shows YouTube play/pause buttons
                        onClick={(e) => changeVid(e)}
                      />
                      
                    </div>
                )) : <span className="loader"></span>}
              
                
            </aside>
    
            <div className='main-vid-cont'>
              <button
                className='toggle-playlist-btn'
                aria-expanded={isAsideOpen}
                onClick={() => setIsAsideOpen(open => !open)}
                aria-label={isAsideOpen ? 'Hide playlist' : 'Show playlist'}
              >{isAsideOpen ? '‹' : '›'}</button>
              <div className={`mobile-aside-backdrop ${isAsideOpen ? 'open' : ''}`} onClick={() => setIsAsideOpen(false)} />
                <h1 className='main-h1'>{activeVideo?.snippet?.title || "Loading..."}</h1>
                <div className='main-player-wrapper'>
                  
                  { activeVideo? 
                    <>
                    <iframe
                      src={`https://www.youtube.com/embed/${activeVideo.snippet.resourceId.videoId}`}
                      className='main-react-player'
                      key={activeVideo.snippet.resourceId.videoId}
                      width='80%'
                      height='100%'
                      controls={true} // Shows YouTube play/pause buttons
                    ></iframe>
                    </> 
                    : <span className="loader"></span>
                  }
                </div>
                  {activeVideo?
                  <div style={{padding:'20px', margin:'30px',}}>
                    <h3>Instructor: {courseDetails.courseInstructor}</h3>
                    <h4>Description: {courseDetails.courseDescription}</h4>
                    <div className='vid-controls'>
                      <button className='prev-btn' onClick={(e)=> prevVid(e)}>Previous Video</button>
                      <button className='nxt-btn' onClick={(e)=> nextVid(e)}>Next Video</button>
                    </div>
                    { !videoSummary && !loadingSummary && 
                      <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                        <button className='summrize-btn' onClick={handleSummerizeClick}>Summarize Video</button>
                        {summaryError && <p style={{color:'red', marginTop: '10px'}}>{summaryError}</p>}
                      </div>
                    }

                    {loadingSummary &&
                      <div style={{display:'flex',justifyContent:'center', margin:'20px'}}>
                        <span className="loader small-loader" style={{margin: '0'}}></span>
                      </div>
                    }

                    {videoSummary && 
                      <div className='summary-box'>
                        <p>AI Summary:</p>
                        {videoSummary}
                      </div>
                    } 
                  </div> 
                  :
                  <></>
                  }
            </div>
        </div>
    </>
  )
}

export default CourseVideos;