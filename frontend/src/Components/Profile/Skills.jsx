import React from 'react';
import SkillItem from './SkillItem';

export default function Skills({ skills = [] }) {
    return (
        <section className="skills">
            <h2 className="section-title">Interviews Made:</h2>
            <div className="skills-list">
                {skills.length > 0? skills.map((s) => (
                    <SkillItem key={s.id} name={s.track_name} percent={s.percentage_result} details={JSON.parse(s.interview_result)} interviewd_at={s.interviewed_at} />
                )) :
                <h3 style={{textAlign:'center'}}>No Interviews Made</h3>
                }
            </div>
            {skills.length > 4 && <div className="see-more-wrap">
                {/* <button className="see-more">See More..</button> */}
            </div>}
        </section>
    );
}
