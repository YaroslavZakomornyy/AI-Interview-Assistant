import { sendMessage as apiSendMessage, setParameters as apiSetParameters } from './api';
import { useState } from 'react';
import './Chat.css';
import InterviewParameters from './interview-parameters/InterviewParameters'

function Chat() {
    const [chatMessages, setChatMessages] = useState([]); // Stores both user and AI messages
    const [message, setMessage] = useState("");
    const [started, setStarted] = useState(false);

    function handleEnterPress(e){
        if (e.key === "Enter") {
            fetchChatResponse();
        }
      }

    const updateParameters = async (behavior, quality, interviewStyle) => {
        const parameters = {
            "beh" : behavior,
            "quality": quality,
            "int" : interviewStyle
        }

        apiSetParameters(parameters);
        setStarted(true);
    }


    const fetchChatResponse = async () => {

        // Check if the message is empty
        if (!message) {
            return;  // Stop further execution if message is empty
        }

        // Add user message to messages state
        setChatMessages(prevMessages => [...prevMessages, { sender: 'user', text: message }]);
        
        const reply = await apiSendMessage(message);

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
                    <input value={message} onChange={(e) => setMessage(e.target.value)} type="text" id="user-message" placeholder="Type your message..." onKeyUp={handleEnterPress}/>
                    <button onClick={fetchChatResponse}>Submit</button>
                </div>
            </div>
            }   
            
            {/* Interview Parameters section */}
            <div className="interview-parameters-section">
                <InterviewParameters onUpdateParameters={updateParameters}/>
            </div>
        </div>
    );
}

export default Chat;
