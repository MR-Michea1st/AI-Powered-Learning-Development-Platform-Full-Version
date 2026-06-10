import React, { useState } from 'react';

export default function SkillItem({ name, percent = 0, details = {} , interviewd_at = ""}) {
    const [showModal, setShowModal] = useState(false);
    
    const handleShowResult = () => {
        setShowModal(true);
    }
    
    const closeModal = () => {
        setShowModal(false);
    }
    
    return (
        <div className="skill-item">
            <div className="skill-row">
                <div className="skill-name">{name}</div>
                <span style={{display:'flex', flexDirection:'row', gap:'10px', margin:'2px 10px'}}>
                    <button className='showRes' onClick={handleShowResult}>Show Result</button>
                    <div className="skill-percent">{interviewd_at}</div>
                    <div className="skill-percent">{parseFloat(percent*10)}%</div>
                </span>
            </div>
            <div className="skill-bar">
                <div className="skill-fill" style={{ width: `${percent*10}%` }}></div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={closeModal} style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{
                        backgroundColor: '#fff',
                        padding: '30px',
                        borderRadius: '10px',
                        maxWidth: '500px',
                        width: '90%',
                        color: '#333',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ marginTop: 0, marginBottom: '15px' }}>{name} Interview Result</h3>
                        <p><strong>Score:</strong> {parseFloat(percent)}%</p>
                        {details.summary && <p><strong>Summary:</strong> {details.summary}</p>}
                        {details.feedback && <p><strong>Feedback:</strong> {details.feedback}</p>}
                        
                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button onClick={closeModal} style={{
                                padding: '8px 16px',
                                backgroundColor: '#131e50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
