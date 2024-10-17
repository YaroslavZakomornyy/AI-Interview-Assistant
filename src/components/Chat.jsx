import { useState, useRef } from 'react';
import './Chat.css';
import { sendMessage as apiSendMessage, setParameters as apiSetParameters } from './api';

function Chat() {
    const [messages, setMessages] = useState([]); // Stores both user and AI messages
    const chatInputFieldRef = useRef(null);

    function handleEnterPress(e){
        if (e.key === "Enter") {
            fetchChatResponse();
        }
      }


    const fetchChatResponse = async () => {
        const userMessage = chatInputFieldRef.current.value;

        // Check if the message is empty
        if (!userMessage) {
            return;  // Stop further execution if message is empty
        }

        chatInputFieldRef.current.value = "";

        // Add user message to messages state
        setMessages(prevMessages => [...prevMessages, { sender: 'user', text: userMessage }]);
        
        const reply = await apiSendMessage(userMessage);

        setMessages(prevMessages => [...prevMessages, { sender: 'ai', text: reply }]);
    };

    return (
        <div className="chat-container">
            <div className="chatbox-heading">AI Interview Assistant</div>
            
            {/* Messages section */}
            <div className="chat-messages">
                {messages.map((msg, index) => (
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
                <input ref={chatInputFieldRef} type="text" id="user-message" placeholder="Type your message..." onKeyUp={handleEnterPress}/>
                <button onClick={fetchChatResponse}>Submit</button>
            </div>
        </div>
    );
}

export default Chat;
