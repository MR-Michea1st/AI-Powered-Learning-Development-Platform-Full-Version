# AI Interviewer Component - Code Explanation

## Overview
This React component creates an interactive AI-powered interview system where users select a specialization and answer 5 generated questions. The component fetches interview questions from a backend API, displays them conversationally, and evaluates user answers.

---

## Line-by-Line Code Breakdown

### Imports and Constants (Lines 1-15)

**Line 1:** `import React, { useState, useRef, useEffect, useMemo } from 'react';`
- Imports React and essential hooks for state management, refs, side effects, and performance optimization

**Line 2:** `import './AI_Interviewer.css';`
- Imports the CSS stylesheet for styling this component

**Line 3:** `import interviewerImg from '../../assets/imgs/AI_Interviewer.png';`
- Imports the interviewer avatar image used in the chat UI

**Line 4:** `import axios from 'axios'`
- Imports axios HTTP client for making API requests

**Line 5:** `import {useAuth} from '../../Context/AuthContext.jsx'`
- Imports the custom authentication hook to access the user's auth token

**Line 6:** `import { useNavigate } from 'react-router-dom';`
- Imports navigation hook for redirecting users to the login page if needed

**Lines 8-11:** API Constants
- `API_INTERVIEW_START`: Endpoint to generate 5 interview questions
- `API_INTERVIEW_FINISH`: Endpoint to submit answers and receive evaluation
- `API_HEALTH`: Endpoint to check backend availability
- `TOTAL_QUESTIONS`: Set to 5, defines the interview length

**Lines 13-15:** `uid()` function
- Generates unique IDs for each message using timestamp and random numbers
- Used to uniquely identify messages in the chat for React keys and message tracking

---

### Component State Variables (Lines 17-39)

**Line 18:** `const [specialization, setSpecialization] = useState('');`
- Stores the currently selected interview topic (e.g., "JavaScript", "React")

**Lines 19-26:** `const [messages, setMessages] = useState([...])`
- Stores the chat history as an array of message objects
- Each message has: `id` (unique identifier), `role` (either 'assistant' or 'user'), and `content` (message text)
- Initializes with an assistant message prompting user to choose a specialization

**Line 28:** `const {token} = useAuth();`
- Destructures the auth token from the AuthContext for authenticated API requests

**Line 29:** `const navigate = useNavigate();`
- React Router hook for programmatic navigation

**Line 30:** `const [userInfo , setUserInfo] = useState(null);`
- Stores logged-in user's profile information (including profile picture)

**Line 31:** `const [tracks , setTracks] = useState([]);`
- Stores the list of available specializations fetched from backend

**Line 32:** `const [questions, setQuestions] = useState([]);`
- Stores the 5 interview questions generated for the current session

**Line 33:** `const [answers, setAnswers] = useState([]);`
- Stores the user's answers as they progress through the interview

**Line 34:** `const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);`
- Tracks which question (0-4) is currently being asked. `-1` means no interview has started

**Line 35:** `const [isLoading, setIsLoading] = useState(false);`
- Boolean flag indicating if an API request is in progress (grading, evaluation, etc.)

**Line 36:** `const [pendingAssistantId, setPendingAssistantId] = useState(null);`
- Stores the ID of the pending assistant message being evaluated (shows loading animation)

**Line 37:** `const [sessionComplete, setSessionComplete] = useState(false);`
- Boolean flag indicating if all 5 questions have been answered and evaluation received

**Line 38:** `const [meta, setMeta] = useState({ model: '', latencyMs: null, backendOk: null });`
- Stores metadata: AI model name, backend latency, and backend availability status

**Line 39:** `const [error, setError] = useState('');`
- Stores error messages to display to the user

---

### Refs (Lines 41-42)

**Line 41:** `const messagesEndRef = useRef(null);`
- Ref used to scroll to the bottom of the messages when new messages arrive

**Line 42:** `const inputRef = useRef(null);`
- Ref to focus on the textarea input field when component is ready

---

### Computed Values with useMemo (Lines 44-53)

**Lines 44-47:** `const canSend`
- Computes whether the "Submit answer" button should be enabled
- Returns `true` only when: not loading, interview not complete, question selected, specialization chosen, and text entered
- Memoized for performance to avoid recalculating on every render

**Lines 49-53:** `const currentQuestionLabel`
- Computes the display text for current question progress (e.g., "Question 3/5")
- Shows "Completed" when interview is done
- Shows empty string if interview hasn't started

---

### API Functions (Lines 55-275)

**Lines 55-63:** `refreshHealth()`
- Fetches the health endpoint to check if the backend AI service is available
- Updates `meta` state with `backendOk` status and model name
- Wrapped in try-catch for network errors

**Lines 65-80:** First useEffect - Fetch Tracks
- Runs once on component mount (empty dependency array `[]`)
- Fetches available specializations from the backend
- Sets `tracks` state with the list of topics users can choose from

**Lines 83-103:** Second useEffect - Fetch User Info
- Runs once on component mount
- Fetches the logged-in user's profile data
- Includes authorization header with the auth token

**Lines 105-108:** Third useEffect - Check Backend Health
- Runs once on component mount
- Checks if the AI backend is running
- Uses `setTimeout(..., 0)` for deferred execution

**Lines 110-112:** Fourth useEffect - Auto-scroll Messages
- Dependency: `[messages]`
- Whenever messages change, smooth-scroll to the bottom of the chat

**Lines 114-116:** Fifth useEffect - Focus Input
- Runs once on component mount
- Auto-focuses the textarea for better UX

**Lines 118-120:** `updateMessage(id, patch)`
- Helper function to update a specific message by ID
- Used to update pending messages with actual content

**Lines 122-145:** `formatFinalEvaluation(data)`
- Formats the final interview evaluation into readable text
- Displays: overall grade, summary, and per-question feedback
- Organizes data: question, grade, feedback, and correct answer for each question

**Lines 147-211:** `startInterview(topic)`
- Called when user selects a specialization
- Resets all interview state to initial values (clears previous interview)
- Sends POST request to backend with selected specialization
- Backend returns 5 questions
- Validates that exactly 5 questions were returned
- Sets the first question as current and displays it
- Handles errors by showing error message and resetting specialization

**Lines 213-275:** `send()`
- Called when user submits an answer
- Validates: has text, specialization selected, not loading, interview active, not complete
- Adds user's answer to `answers` array
- If not on last question: increments `currentQuestionIndex` and displays next question
- If on last question (5th answer submitted):
  - Sends POST request to `/api/interview/finish` with all questions and answers
  - Backend returns evaluation data
  - Formats and displays the final evaluation
  - Marks session as complete
- Error handling: removes pending message and shows error to user

**Lines 277-292:** `clearChat()`
- Resets all state to initial values
- Clears any errors, questions, answers, and messages
- Returns to the starting state "Choose a specialization to begin..."

**Lines 294-302:** `handleSpecializationChange(value)`
- Called when user changes the specialization dropdown
- If empty, clears chat
- Otherwise, calls `startInterview()` to begin a new interview

**Lines 304-309:** `onKeyDown(e)`
- Keyboard handler for the textarea
- Submits answer on Enter key press
- Allows Shift+Enter for new lines instead of submit

---

### JSX Render (Lines 311-419)

**Lines 313-414:** Conditional Render
- Shows interview UI if user is authenticated (`token` exists)
- Otherwise shows login prompt with redirect button

**Lines 315-340:** Header Card
- Specialization dropdown (populated with `tracks` options)
- Status row displaying: backend status, model name, question progress, latency

**Lines 342-381:** Chat Messages Container
- Maps through `messages` array and renders each message
- Shows avatar for assistant messages, user profile picture for user messages
- Displays typing animation while waiting for evaluation
- Auto-scrolls with `messagesEndRef`

**Lines 383-404:** Input Area
- Textarea for typing answers
- Disabled states: when loading, no specialization, interview complete, or interview not started
- Placeholder text changes based on state
- "Submit answer" button: disabled when `canSend` is false
- "Clear" button: resets entire interview

**Line 407:** Error Display
- Shows error messages if any API calls fail

---

## Why Interview Data Clears on Page Refresh

### The Problem
When you refresh the page, all interview data (questions, answers, messages) is lost.

### Root Cause
**All state is stored in React's memory only**, using `useState` hooks. This state is volatile because:

1. **No Persistence**: The component uses `useState` hooks which only persist data during the current browser session
2. **Component Remount**: When you refresh, the React component unmounts completely and remounts from scratch
3. **No Storage Mechanism**: The code doesn't save state to:
   - `localStorage` (browser storage)
   - `sessionStorage` (browser session storage)
   - Backend database with session tracking
   - Browser's IndexedDB

### State That Gets Reset on Refresh
- `messages` (line 20) - chat history cleared
- `questions` (line 32) - interview questions cleared
- `answers` (line 33) - user answers cleared
- `currentQuestionIndex` (line 34) - reset to -1
- `sessionComplete` (line 37) - reset to false
- `specialization` (line 18) - reset to empty string
- `input` (line 19) - textarea emptied

### What Happens During Refresh
1. Browser reloads → React re-initializes all state to default values
2. Component mounts with initial state (messages show "Choose a specialization...")
3. `useEffect` hooks run again, fetching tracks and user info fresh
4. Previous interview session is completely lost

### How to Fix This (Recommendations)
To persist interview state across page refreshes, you would need to implement one of these approaches:

**Option 1: localStorage (Simple, Client-side)**
```javascript
// Save state to localStorage
useEffect(() => {
  localStorage.setItem('interviewSession', JSON.stringify({
    questions,
    answers,
    currentQuestionIndex,
    specialization,
  }));
}, [questions, answers, currentQuestionIndex, specialization]);

// Restore from localStorage on mount
useEffect(() => {
  const saved = localStorage.getItem('interviewSession');
  if (saved) {
    const data = JSON.parse(saved);
    setQuestions(data.questions);
    setAnswers(data.answers);
    // ... restore other state
  }
}, []);
```

**Option 2: Backend Session Management (Robust)**
- Store interview session data on the backend database
- Generate a session ID when user starts interview
- Save questions/answers to database after each submission
- Fetch incomplete sessions on component mount
- Resume interviews from last saved state

**Option 3: Browser SessionStorage (Session-only)**
- Similar to localStorage but clears when tab closes
- Good for single-session-only interviews

---

## Key Features

✅ Question Generation: Backend AI generates 5 unique questions per interview
✅ Chat Interface: Conversational Q&A format with smooth scrolling
✅ Answer Validation: Tracks answers and prevents skipping questions
✅ Auto-Evaluation: Backend grades all answers after last submission
✅ User Profile: Displays user's profile picture in chat
✅ Backend Health Check: Shows if AI service is available
✅ Authentication: Only accessible to logged-in users
✅ Error Handling: Graceful error display with retry capability
✅ UX Features: Auto-focus, keyboard shortcuts, loading states, animations

---

## Summary

This component creates a complete interview experience by combining frontend React state management with backend AI evaluation. The chat-like interface makes interviews feel conversational and engaging. However, session data is not preserved on page refresh because all state lives only in React memory without any persistence layer.
