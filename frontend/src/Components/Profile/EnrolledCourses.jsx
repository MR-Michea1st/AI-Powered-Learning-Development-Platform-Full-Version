import React, { useState } from 'react';
import EnrolledItem from './Enrolledtem';


export default function EnrolledCourses({ enrolled_courses = [] }) {

    const [numberOfShowedCourses , setNumberOfShowedCourses] = useState(3)
    
    return (
        <section className="favourites">
            <h2 className="section-title">Enrolled Courses:</h2>
                { enrolled_courses.length > 0 ?
                 <>
                    <div className="favs-list">
                        {enrolled_courses.slice(0,numberOfShowedCourses).map((f) => (
                            <EnrolledItem key={f.id} id = {f.id} title={f.course_name} />
                        ))}
                    
                    </div>
                    <div className="see-more-wrap">
                       { numberOfShowedCourses < enrolled_courses.length ? 
                        <button className="see-more" onClick={()=>setNumberOfShowedCourses(enrolled_courses.length)}>See more</button>
                         :
                          <></> 
                        }
                    </div>
                </>
                : <h3 style={{textAlign:'center'}}>There are No Enrolled Courses</h3>
                }
        </section>
    );
}
