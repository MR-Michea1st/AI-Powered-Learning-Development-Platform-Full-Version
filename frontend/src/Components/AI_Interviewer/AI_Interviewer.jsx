import React, { useState, useRef, useEffect, useMemo } from 'react';
import './AI_Interviewer.css';
import interviewerImg from '../../assets/imgs/AI_Interviewer.png';
import axios from 'axios'
import {useAuth} from '../../Context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom';

const API_INTERVIEW_START = '/api/interview/start';
const API_INTERVIEW_FINISH = '/api/interview/finish';
const API_HEALTH = '/health';
const TOTAL_QUESTIONS = 5;

function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function AI_Interviewer() {
    // Helper function to get initial session state from sessionStorage
    const getInitialSessionState = () => {
        try {
            const saved = sessionStorage.getItem('interviewSession');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (err) {
            console.error('Error restoring session:', err);
        }
        return null;
    };

    const initialSession = getInitialSessionState();

    const [specialization, setSpecialization] = useState(initialSession?.specialization || '');
    const [input, setInput] = useState(initialSession?.input || '');
    const [messages, setMessages] = useState(
        initialSession?.messages || [
            {
                id: uid(),
                role: 'assistant',
                content: 'Choose a specialization to begin a 5-question interview.'
            },
        ]
    );

    const {token} = useAuth();
    const navigate = useNavigate();
    const [userInfo , setUserInfo] = useState(null);
    const [tracks , setTracks] = useState([]);
    const [questions, setQuestions] = useState(initialSession?.questions || []);
    const [answers, setAnswers] = useState(initialSession?.answers || []);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(initialSession?.currentQuestionIndex ?? -1);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingAssistantId, setPendingAssistantId] = useState(null);
    const [sessionComplete, setSessionComplete] = useState(initialSession?.sessionComplete || false);
    const [meta, setMeta] = useState({ model: '', latencyMs: null, backendOk: null });
    const [error, setError] = useState('');

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const canSend = useMemo(
        () => !isLoading && !sessionComplete && currentQuestionIndex >= 0 && specialization.trim().length > 0 && input.trim().length > 0,
        [isLoading, sessionComplete, currentQuestionIndex, specialization, input]
    );

    const currentQuestionLabel = useMemo(() => {
        if (currentQuestionIndex < 0) return '';
        if (sessionComplete) return 'Completed';
        return `Question ${Math.min(currentQuestionIndex + 1, TOTAL_QUESTIONS)}/${TOTAL_QUESTIONS}`;
    }, [currentQuestionIndex, sessionComplete]);

    async function refreshHealth() {
        try {
            const r = await fetch(`http://127.0.0.1:8001/interviewer${API_HEALTH}`);
            const data = await r.json();
            setMeta((m) => ({ ...m, backendOk: !!data?.ok, model: data?.model || m.model }));
        } catch {
            setMeta((m) => ({ ...m, backendOk: false }));
        }
    }

    useEffect(() => {

        const fetchTracks = async () => {
           try {
            const response = await axios.get('http://127.0.0.1:8000/api/tracks/');
            console.log(response); 
            setTracks(response.data.results);
           }

           catch(err) {
            console.error("Error in fetching tracks because :: " , err);
           }
        } 

        fetchTracks();
    } , [])
    
    
    useEffect(() => {

        const fetchUserInfo = async () => {
           try {
            const response = await axios.get('http://127.0.0.1:8000/auth/profile/' , {
                headers: {
                    Authorization:`Bearer ${token}`
                }
            });

            console.log(response);
            setUserInfo(response.data);
           }

           catch(err) {
            console.error("Error in fetching user info because :: " , err);
           }
        }

        fetchUserInfo();
    } , [])

    // Save interview session to sessionStorage whenever key state changes
    useEffect(() => {
        const sessionData = {
            messages,
            questions,
            answers,
            currentQuestionIndex,
            specialization,
            sessionComplete,
            input,
        };
        sessionStorage.setItem('interviewSession', JSON.stringify(sessionData));
    }, [messages, questions, answers, currentQuestionIndex, specialization, sessionComplete, input]);

    useEffect(() => {
        const t = setTimeout(() => refreshHealth(), 0);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    function updateMessage(id, patch) {
        setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    }

    function formatFinalEvaluation(data) {
        const overallGrade = Number(data?.overallGrade);
        const summary = data?.summary ? `Summary: ${data.summary}` : 'Summary: No summary returned.';
        const evaluations = Array.isArray(data?.evaluations) ? data.evaluations : [];

        const parts = [
            'Interview completed',
            '',
            `Overall grade: ${Number.isFinite(overallGrade) ? overallGrade.toFixed(1) : 'N/A'}/10`,
            '',
            summary,
            '',
        ];

        evaluations.forEach((item, index) => {
            parts.push(`Q${index + 1}: ${item?.question || 'Unknown question'}`);
            parts.push(`Grade: ${item?.grade ?? 'N/A'}/10`);
            parts.push(`Feedback: ${item?.feedback || 'No feedback returned.'}`);
            parts.push(`Correct answer: ${item?.correctAnswer || 'No correct answer returned.'}`);
            parts.push('');
        });

        return parts.join('\n').trim();
    }

    async function startInterview(topic) {
        if (!topic.trim()) return;

        setError('');
        setIsLoading(true);
        setSessionComplete(false);
        setPendingAssistantId(null);
        setCurrentQuestionIndex(-1);
        setQuestions([]);
        setAnswers([]);
        setMessages([
            {
                id: uid(),
                role: 'assistant',
                content: 'Generating your 5-question interview...',
            },
        ]);

        const t0 = performance.now();
        try {
            const resp = await fetch(`http://127.0.0.1:8001/interviewer${API_INTERVIEW_START}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ specialization: topic }),
            });

            if (!resp.ok) {
                const t = await resp.text();
                throw new Error(t || `Request failed (${resp.status})`);
            }

            const data = await resp.json();
            const interviewQuestions = Array.isArray(data?.questions) ? data.questions.map((q) => String(q).trim()).filter(Boolean) : [];

            if (interviewQuestions.length !== TOTAL_QUESTIONS) {
                throw new Error('The backend did not return exactly 5 questions.');
            }

            const firstQuestionId = uid();
            setQuestions(interviewQuestions);
            setCurrentQuestionIndex(0);
            setMessages([
                {
                    id: firstQuestionId,
                    role: 'assistant',
                    content: interviewQuestions[0],
                },
            ]);
            setMeta((m) => ({ ...m, latencyMs: Math.round(performance.now() - t0) }));
        } catch (e) {
            setError(e?.message || 'Unable to start the interview.');
            setMessages([
                {
                    id: uid(),
                    role: 'assistant',
                    content: 'Choose a specialization to begin a 5-question interview.',
                },
            ]);
            setSpecialization('');
        } finally {
            setIsLoading(false);
            setPendingAssistantId(null);
            refreshHealth();
        }
    }

    async function send() {
        setError('');
        const text = input.trim();
        if (!text || !specialization.trim() || isLoading || currentQuestionIndex < 0 || sessionComplete) return;

        const question = questions[currentQuestionIndex];
        if (!question) return;

        const userMsg = { id: uid(), role: 'user', content: text };
        const nextAnswers = [...answers, text];
        const nextMessages = [...messages, userMsg];

        setMessages(nextMessages);
        setInput('');
        setAnswers(nextAnswers);

        if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
            const nextQuestionIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextQuestionIndex);
            setMessages((prev) => [...prev, { id: uid(), role: 'assistant', content: questions[nextQuestionIndex] }]);
            return;
        }

        setIsLoading(true);
        const pendingId = uid();
        setPendingAssistantId(pendingId);
        setMessages((prev) => [...prev, { id: pendingId, role: 'assistant', content: '' }]);

        const t0 = performance.now();
        try {
            const resp = await fetch(`http://127.0.0.1:8001/interviewer${API_INTERVIEW_FINISH}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    specialization,
                    questions,
                    answers: nextAnswers,
                    user_id: parseInt(userInfo.id),
                }),
            });

            console.log("sent :: " , resp);
            

            if (!resp.ok) {
                const t = await resp.text();
                throw new Error(t || `Request failed (${resp.status})`);
            }

            const data = await resp.json();
            const finalMessage = formatFinalEvaluation(data);

            updateMessage(pendingId, { content: finalMessage });
            setSessionComplete(true);
            setCurrentQuestionIndex(TOTAL_QUESTIONS);
            setMeta((m) => ({ ...m, latencyMs: Math.round(performance.now() - t0) }));
        } catch (e) {
            setError(e?.message || 'Unknown error');
            setMessages((prev) => prev.filter((m) => m.id !== pendingId));
            setCurrentQuestionIndex(TOTAL_QUESTIONS - 1);
            setAnswers(answers);
        } finally {
            setIsLoading(false);
            setPendingAssistantId(null);
            refreshHealth();
        }
    }

    function clearChat() {
        setError('');
        setMeta((m) => ({ ...m, latencyMs: null }));
        setQuestions([]);
        setAnswers([]);
        setCurrentQuestionIndex(-1);
        setSessionComplete(false);
        setInput('');
        setSpecialization('');
        setMessages([
            {
                id: uid(),
                role: 'assistant',
                content: 'Choose a specialization to begin a 5-question interview.',
            },
        ]);
        sessionStorage.removeItem('interviewSession');
    }

    function handleSpecializationChange(value) {
        setSpecialization(value);
        if (!value) {
            clearChat();
            return;
        }

        startInterview(value);
    }

    function onKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }

    return (
        <>
        {token? 
        <div className="ai-page">
            <div className="ai-header-card">
                <div className="ai-top">
                    <label className="ai-label" htmlFor="specialization-select">Specialization</label>
                    <select
                        id="specialization-select"
                        className="ai-select"
                        value={specialization}
                        onChange={(e) => handleSpecializationChange(e.target.value)}
                    >
                        <option value="">Choose a topic</option>
                        {
                        tracks.map((track)=> (
                        <option>{track.name}</option>
                        ))}

                    </select>
                </div>

                <div className="ai-status-row">
                    <span className={`status-pill ${meta.backendOk ? 'ok' : 'bad'}`}>
                        {meta.backendOk ? 'Backend online' : 'Backend unavailable'}
                    </span>
                    {meta.model && <span className="status-pill neutral">Model: {meta.model}</span>}
                    {currentQuestionLabel && <span className="status-pill neutral">{currentQuestionLabel}</span>}
                    {meta.latencyMs !== null && <span className="status-pill neutral">Latency: {meta.latencyMs} ms</span>}
                    <span className="shortcut-hint">Enter to send answer • Shift+Enter for new line</span>
                </div>
            </div>
                <div className="chat-shell">
                <div className="chat-messages-container">
                    {messages.map((message) => (
                        <div key={message.id} className={`message-wrapper ${message.role === 'user' ? 'user-message-wrapper' : 'ai-message-wrapper'}`}>
                            {message.role === 'assistant' && (
                                <div className="avatar">
                                    <img src={interviewerImg} alt="Interviewer" />
                                </div>
                            )}

                            <div className={`speech-bubble ${message.role === 'assistant' && message.id === pendingAssistantId ? 'streaming' : ''}`} style={{ whiteSpace: 'pre-line' }}>
                                <div className="speech-text">
                                    {message.role === 'assistant' && message.id === pendingAssistantId && !message.content ? (
                                        <span className="typing-inline" aria-label="Assistant typing">
                                            <span />
                                            <span />
                                            <span />
                                        </span>
                                    ) : (
                                        <>
                                            {message.content}
                                            {message.role === 'assistant' && message.id === pendingAssistantId && (
                                                <span className="streaming-caret" aria-hidden="true" />
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {message.role === 'user' && <div className="user-avatar"><img style={{
                                width:'100px',
                                height:'100px',
                                borderRadius:'50%',
                                padding:'10px',

                            }} src={userInfo?.profile_picture}/></div>}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="ai-bottom">
                    <textarea
                        ref={inputRef}
                        className="answer-input"
                        placeholder={!specialization ? 'Choose a specialization first...' : sessionComplete ? 'Interview finished. Click Clear to start again.' : 'Type your answer...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={onKeyDown}
                        disabled={isLoading || !specialization || sessionComplete || currentQuestionIndex < 0}
                        rows={1}
                        aria-label="Message input"
                    />

                    <div className="ai-actions">
                        <button className="send-btn primary" aria-label="send" onClick={send} disabled={!canSend}>
                            {isLoading ? 'Grading...' : 'Submit answer'}
                        </button>

                        <button className="send-btn ghost" onClick={clearChat}>
                            Clear Chat
                        </button>

                        <button className="send-btn ghost" onClick={() => setInput('')}>
                            Clear Input
                        </button>
                    </div>
                </div>
                </div> 
            {error && <div className="error-message">{error}</div>}
            
        </div>
         :
        <div className='log-in-first'>
            <h1>Login First to access The AI Interviewer Feature</h1>
            <button className='login-btn login-btn2' onClick={()=>navigate('/Login')}>Login</button>
        </div>
        } 
     </>          
    );
        
}




