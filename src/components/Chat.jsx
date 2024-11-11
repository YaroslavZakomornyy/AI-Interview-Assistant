import { sendMessage as apiSendMessage, 
    createInterviewSession as apiCreateInterviewSession, getTranscript as apiGetTranscript} from './api.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';
import InterviewParameters from './interview-parameters/InterviewParameters'

function Chat() {
    const [chatMessages, setChatMessages] = useState([]); // Stores both user and AI messages
    const [currentInterviewSession, setCurrentInterviewSession] = useState(null);
    const [userInput, setUserInput] = useState("");
    const [started, setStarted] = useState(false);
    const navigate = useNavigate();

    function handleEnterPress(e){
        if (e.key === "Enter") {
            fetchChatResponse();
        }
      }

    const startInterview = async (behavior, quality, interviewStyle) => {
        const parameters = {
            "beh" : behavior,
            "quality": quality,
            "int" : interviewStyle
        }

        setCurrentInterviewSession(await apiCreateInterviewSession(parameters));
        setStarted(true);
    }

    const getTranscript = async () => {
        if (!currentInterviewSession) return;

        apiGetTranscript(currentInterviewSession);
    }

    const fetchChatResponse = async () => {
        // Check if the message is empty
        if (!userInput) {
            return;
        }

        const message = userInput;

        // Add user message to messages state
        setChatMessages(prevMessages => [...prevMessages, { sender: 'user', text: message }]);
        setUserInput("");
        
        const reply = await apiSendMessage(message, currentInterviewSession);

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
                <div className="chat-input">
                    <input value={userInput} onChange={(e) => setUserInput(e.target.value)} type="text" id="user-message" placeholder="Type your message..." onKeyUp={handleEnterPress}/>
                    <button onClick={fetchChatResponse}>Submit</button>
                </div>
                
                <div className="chat-input">
                    {/* <input value={userInput} onChange={(e) => setUserInput(e.target.value)} type="text" id="user-message" placeholder="Type your message..." onKeyUp={handleEnterPress}/> */}
                    <button onClick={getTranscript}>Get transcript</button>
                </div>
            </div>
            }   
            
            {/* Interview Parameters section */}
            <div className="interview-parameters-section">
                <InterviewParameters onStart={startInterview}/>
            </div>
        </div>
    );
}

export default Chat;
