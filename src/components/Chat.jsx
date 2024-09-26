import React, { useState } from 'react';
import './Chat.css';

function Chat() {
    const [messages, setMessages] = useState([]); // Stores both user and AI messages

    const fetchChatResponse = async () => {
        try {
            const textField = document.getElementById("user-message");
            const userMessage = textField.value;

            // Check if the message is empty
            if (!userMessage) {
                alert("Please enter a message before submitting.");
                return;  // Stop further execution if message is empty
            }

            textField.value = "";

            // Add user message to messages state
            setMessages(prevMessages => [...prevMessages, { sender: 'user', text: userMessage }]);

            const res = await fetch('http://localhost:3000/api/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                })
            });

            const data = await res.json();
            const aiResponse = data.choices[0].message.content;

            // Add AI response to messages state
            setMessages(prevMessages => [...prevMessages, { sender: 'ai', text: aiResponse }]);
        } catch (error) {
            console.error('Error:', error);
        }
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
                <input type="text" id="user-message" placeholder="Type your message..." />
                <button onClick={fetchChatResponse}>Submit</button>
            </div>
        </div>
    );
}

export default Chat;
