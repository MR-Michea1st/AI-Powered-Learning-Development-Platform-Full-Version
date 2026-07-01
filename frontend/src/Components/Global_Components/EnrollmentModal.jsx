import React, { useEffect } from 'react'
import './EnrollmentModal.css'

function EnrollmentModal({ isOpen, course, onConfirm, onCancel }) {
  if (!isOpen || !course) return null;
  
  useEffect(()=> {
    console.log(course);
    
  } , []);
  return (
    <>
      {/* Darkened Backdrop */}
      <div className='enrollment-backdrop' onClick={onCancel}></div>

      {/* Modal Window */}
      <div className='enrollment-modal'>
        <div className='modal-header'>
          <h2>Confirm Enrollment</h2>
        </div>

        <div className='modal-content'>
          <div className='course-preview'>
            <img src={course.thumbnail} alt={course.name} className='modal-course-img' />
          </div>

          <div className='enrollment-details'>
            <h3>{course.name}</h3>
            <div className='course-rating'>
              {course.tags && <span className='rating-text'>Categories: {course.tags?.split(',').map((tag)=> (
                tag && <span style={{
                  padding:'8px',
                  backgroundColor:'azure',
                  margin:'5px',
                  borderRadius:'30px',
                }}>{tag}</span>
              ))} </span>}
              {/* <span className='rating-stars'>&#11088;</span> */}
            </div>
            <p className='confirmation-message'>Are you sure you want to enroll in this course?</p>
          </div>
        </div>

        <div className='modal-footer'>
          <button className='btn-cancel' onClick={onCancel}>Cancel</button>
          <button className='btn-confirm' onClick={onConfirm}>Confirm Enrollment</button>
        </div>
      </div>
    </>
  )
}

export default EnrollmentModal
