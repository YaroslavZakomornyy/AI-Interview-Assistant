import { sendMessage as apiSendMessage, 
    createInterviewSession as apiCreateInterviewSession, getTranscript as apiGetTranscript} from './api.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';
import InterviewParameters from './interview-parameters/InterviewParameters';
import TranscriptDisplay from './TranscriptDisplay';

function Chat() {
    const [chatMessages, setChatMessages] = useState([]); // Stores both user and AI messages
    const [currentInterviewSession, setCurrentInterviewSession] = useState(null);
    const [userInput, setUserInput] = useState("");
    const [started, setStarted] = useState(false);
    const navigate = useNavigate();
    const [showTranscript, setShowTranscript] = useState(false);
    const [transcript, setTranscript] = useState([]);

    const MAX_CHARS = 500;

    function handleEnterPress(e){
        if (e.key === "Enter") {
            fetchChatResponse();
        }
      }

    const startInterview = async (behavior, quality, interviewStyle, jobDescription) => {
        const parameters = {
            "beh" : behavior,
            "quality": quality,
            "int" : interviewStyle
        }

        setCurrentInterviewSession(await apiCreateInterviewSession(parameters, jobDescription));
        setStarted(true);
    }

    const getTranscript = async () => {
        if (!currentInterviewSession) return;

        const transcriptData = await apiGetTranscript(currentInterviewSession);
        setTranscript(chatMessages); // Or use transcriptData if the API returns formatted data
        setShowTranscript(true);
    }

    const handleInputChange = (e) => {
        const input = e.target.value;
        if (input.length <= MAX_CHARS) {
            setUserInput(input);
        }
    };

    const fetchChatResponse = async () => {
        // Check if the message is empty
        if (!userInput) {
            return;
        }

        const message = userInput.slice(0, MAX_CHARS);
        // Add user message to messages state
        setChatMessages(prevMessages => [...prevMessages, { sender: 'user', text: message }]);
        setUserInput("");
        
        const reply = await apiSendMessage(message, currentInterviewSession);
        const limitedReply = reply.slice(0, MAX_CHARS);
        setChatMessages(prevMessages => [...prevMessages, { sender: 'ai', text: reply }]);
    };

    return (
        <div className="chat-container-with-parameters">

            {/* Chat section */}
            {
                started && <div className="chat-section">
                <div className="chatbox-heading">AI Interview Assistant</div>
                
                {/* Messages section */}
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

                {/* Input section */}
                
                <div className="chat-input-wrapper">
                        <textarea
                            value={userInput}
                            onChange={handleInputChange}
                            className="chat-textarea"
                            placeholder="Type your message..."
                            onKeyDown={handleEnterPress}
                        />
                        <div className="chat-input-footer">
                            <span className="char-counter">
                                {MAX_CHARS - userInput.length} characters remaining
                            </span>
                            <div className="chat-buttons">
                                <button className="transcript-button" onClick={getTranscript}>
                                    Get transcript
                                </button>
                                <button className="submit-button" onClick={fetchChatResponse}>
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
            </div>
            }   
            
            {/* Interview Parameters section */}
            <div className="interview-parameters-section">
                <InterviewParameters onStart={startInterview}/>
            </div>

            {showTranscript && (
            <TranscriptDisplay 
                transcript={transcript}
                onClose={() => setShowTranscript(false)}
            />
        )}
        </div>
    );
}

export default Chat;
