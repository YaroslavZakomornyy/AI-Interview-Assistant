import React, { useState } from 'react';
import "./Chat.css"

function Chat() {
    const [response, setResponse] = useState('');

    const fetchChatResponse = async () => {
        try
        {
            const textField = document.getElementById("user-message");
            const text = textField.value;
            textField.value = "";
            const res = await fetch('http://localhost:3000/api/message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                })
            });

            const data = await res.json();
            console.log(data);
            const responce = data.choices[0].message.content;
            console.log(responce);
            setResponse(responce);
        } catch (error)
        {
            console.error('Error:', error);
        }
    };

    return (
        <div className="chat-container">
        {/* Chatbox heading */}
        <div className="chatbox-heading">AI Interview Assistant</div>

        <div className="App">
            <input type="text" id="user-message"></input>
            <button onClick={fetchChatResponse}>Submit</button>
            {/* <div className='AI-text'>{`${JSON.stringify(response, null, 2)}`}</div> */}
            <div className='AI-text'>{`${response}`}</div>
        </div>
        </div>
    );
}

export default Chat;