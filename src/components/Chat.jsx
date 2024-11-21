import { sendMessage as apiSendMessage, 
    createInterviewSession as apiCreateInterviewSession, 
    getTranscript as apiGetTranscript 
} from './api.js';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';
import InterviewParameters from './interview-parameters/InterviewParameters';
import TranscriptDisplay from './TranscriptDisplay';
import axios from 'axios';

function Chat() {
    const [chatMessages, setChatMessages] = useState([]); 
    const [currentInterviewSession, setCurrentInterviewSession] = useState(null);
    const [userInput, setUserInput] = useState("");
    const [started, setStarted] = useState(false);
    const [isInterviewEnded, setIsInterviewEnded] = useState(false);
    const navigate = useNavigate();
    const [showTranscript, setShowTranscript] = useState(false);
    const [transcript, setTranscript] = useState([]);

    const MAX_CHARS = 500;

    function handleEnterPress(e){
        if (e.key === "Enter" && !isInterviewEnded) {
            fetchChatResponse();
        }
    }

    const startInterview = async (behavior, quality, interviewStyle, jobDescription) => {
        const parameters = {
            "beh" : behavior,
            "quality": quality,
            "int" : interviewStyle
        }

        const interviewId = await apiCreateInterviewSession(parameters, jobDescription);
        setCurrentInterviewSession(interviewId);
        setStarted(true);
        setIsInterviewEnded(false);
    }

    const getTranscript = async () => {
        if (!currentInterviewSession) return;

        try {
            // Use the existing getTranscript function from api.js
            await apiGetTranscript(currentInterviewSession);
        } catch (error) {
            console.error('Error getting transcript:', error);
        }
    }

    const endInterview = async () => {
        if (!currentInterviewSession) return;

        try {
            // Store the interview ID in local storage for feedback retrieval
            localStorage.setItem('lastInterviewId', currentInterviewSession);
            
            // Navigate to feedback page
            navigate('/feedback');
        } catch (error) {
            console.error('Error ending interview:', error);
        }
    }

    const handleInputChange = (e) => {
        const input = e.target.value;
        if (input.length <= MAX_CHARS && !isInterviewEnded) {
            setUserInput(input);
        }
    };

    const fetchChatResponse = async () => {
        if (!userInput || isInterviewEnded) {
            return;
        }

        const message = userInput.slice(0, MAX_CHARS);
        setChatMessages(prevMessages => [...prevMessages, { sender: 'user', text: message }]);
        setUserInput("");
        
        const reply = await apiSendMessage(message, currentInterviewSession);
        setChatMessages(prevMessages => [...prevMessages, { sender: 'ai', text: reply }]);

        // Check if the AI wants to end the interview
        if (reply.includes('/stop')) {
            setIsInterviewEnded(true);
            endInterview();
        }
    };

    const handleFeedbackClick = () => {
        if (currentInterviewSession) {
            localStorage.setItem('lastInterviewId', currentInterviewSession);
            navigate('/feedback');
        }
    };

    return (
        <div className="chat-container-with-parameters">
            {started && (
                <div className="chat-section">
                    <div className="chatbox-heading">AI Interview Assistant</div>
                    
                    <div className="chat-messages">
                        {chatMessages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    <div className="chat-input-wrapper">
                        <textarea
                            value={userInput}
                            onChange={handleInputChange}
                            className="chat-textarea"
                            placeholder={isInterviewEnded ? "Interview ended" : "Type your message..."}
                            onKeyDown={handleEnterPress}
                            disabled={isInterviewEnded}
                        />
                        <div className="chat-input-footer">
                            <span className="char-counter">
                                {MAX_CHARS - userInput.length} characters remaining
                            </span>
                            <div className="chat-buttons">
                                <button 
                                    className="submit-button" 
                                    onClick={endInterview}
                                    disabled={isInterviewEnded}
                                >
                                    End Interview
                                </button>
                                <button 
                                    className="transcript-button" 
                                    onClick={getTranscript}
                                >
                                    Get Transcript
                                </button>
                                <button 
                                    className="submit-button" 
                                    onClick={handleFeedbackClick}
                                >
                                    View Feedback
                                </button>
                                <button 
                                    className="submit-button" 
                                    onClick={fetchChatResponse}
                                    disabled={isInterviewEnded}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="interview-parameters-section">
                <InterviewParameters onStart={startInterview}/>
            </div>
        </div>
    );
}

export default Chat;