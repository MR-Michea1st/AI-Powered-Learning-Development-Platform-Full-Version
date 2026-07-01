import api from '../../services/api.js';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext.jsx';

export default function EnrolledItem({ id , title }) {

    const { token } = useAuth();
    const navigate = useNavigate();
   
    const handleUnenrollClick = async() => {

       try { 
        console.log(id);
        
            const response = await api.delete(`/api/courses/enrollments/${id}/delete/` , {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            console.log(response);
            navigate(0);    
       
        }

       catch(err) {
        console.error("Faild to Unenroll because :: " , err);
       }
    }

    return (
        <div className={`fav-item`} title={title}>
            <span className="fav-title">{title}</span>
            <button className='unenroll-btn' onClick={handleUnenrollClick}>Unenroll</button>
        </div>
    );
}