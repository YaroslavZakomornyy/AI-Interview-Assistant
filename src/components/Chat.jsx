import apiService from '../services/api-service';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';
import InterviewParameters from './interview-parameters/InterviewParameters';
import TranscriptDisplay from './TranscriptDisplay';
import axios from 'axios';
import NavBar from './NavBar';
import { FaMicrophone } from 'react-icons/fa'; // Install with: npm install react-icons
import RecordRTC from 'recordrtc';


function Chat() {
    const [chatMessages, setChatMessages] = useState([]);
    const [currentInterviewSession, setCurrentInterviewSession] = useState(null);
    const [userInput, setUserInput] = useState("");
    const [started, setStarted] = useState(false);
    const [isInterviewEnded, setIsInterviewEnded] = useState(false);
    const navigate = useNavigate();
    const [showTranscript, setShowTranscript] = useState(false);
    const [transcript, setTranscript] = useState([]);
    const [isListening, setIsListening] = useState(false); // New state for microphone
    const [interviewMode, setInterviewMode] = useState("text");
    const [blobURL, setBlobURL] = useState('');
    const [isWaiting, setIsWaiting] = useState(false);
    const [speechError, setSpeechError] = useState(false);
    const recorderRef = useRef(null);
    const streamRef = useRef(null); // Reference to store the MediaStream

    const MAX_CHARS = 500;

    function handleEnterPress(e) {
        if (e.key === "Enter" && !isInterviewEnded)
        {
            fetchChatResponse();
        }
    }

    const startInterview = async (behavior, quality, interviewStyle, jobDescription, interviewMode, resume) => {
        const parameters = {
            "beh": behavior,
            "quality": quality,
            "int": interviewStyle,
            "mode": interviewMode
        }

        setInterviewMode(interviewMode);
        const interviewId = await apiService.createInterviewSession(parameters, jobDescription);
        setCurrentInterviewSession(interviewId);
        setStarted(true);
        setIsInterviewEnded(false);
    }

    const getTranscript = async () => {
        if (!currentInterviewSession) return;

        try
        {
            // Use the existing getTranscript function from api.js
            await apiService.getTranscript(currentInterviewSession);
        } catch (error)
        {
            console.error('Error getting transcript:', error);
        }
    }

    const endInterview = async () => {
        if (!currentInterviewSession) return;

        try
        {
            // Store the interview ID in local storage for feedback retrieval
            localStorage.setItem('lastInterviewId', currentInterviewSession);

            // Navigate to feedback page
            navigate('/feedback');
        } catch (error)
        {
            console.error('Error ending interview:', error);
        }
    }

    const handleInputChange = (e) => {
        const input = e.target.value;
        if (input.length <= MAX_CHARS && !isInterviewEnded)
        {
            setUserInput(input);
        }
    };

    const fetchChatResponse = async () => {
        if (!userInput || isInterviewEnded)
        {
            return;
        }

        const message = userInput.slice(0, MAX_CHARS);
        setChatMessages(prevMessages => [...prevMessages, { sender: 'user', text: message }]);
        setUserInput("");

        let reply = await apiService.sendMessage(message, currentInterviewSession);

        // Check if the AI wants to end the interview
        if (reply.includes('/stop'))
        {
            // console.log(reply);
            setIsInterviewEnded(true);
            reply = reply.replace('/stop', '');
        }

        setChatMessages(prevMessages => [...prevMessages, { sender: 'ai', text: reply }]);

    };

    const downloadAudio = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up the URL object
    };

    const sendRecording = async (file) => {
        setIsWaiting(true);
        const {response, error} = await apiService.sendRecording(file, currentInterviewSession);

        if (error){
            setIsWaiting(false);
            setSpeechError(error);
            return;
        }
        //Convert the AudioBuffer to blob
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);

        audio.addEventListener('ended', function handler(event) {
            setIsWaiting(false);
            audio.removeEventListener('ended', handler);
        });

        //Play it
        audio.play();

    }

    const startRecording = async () => {
        setSpeechError("");
        try
        {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream; // Store the stream for later use
            recorderRef.current = new RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/wav', // Explicitly set the MIME type to WAV
                recorderType: RecordRTC.StereoAudioRecorder, // Use StereoAudioRecorder for WAV format
                numberOfAudioChannels: 1, // Mono channel
                desiredSampRate: 16000, // Adjust sample rate if needed
            });

            recorderRef.current.startRecording();
            setIsListening(true);
        } catch (error)
        {
            console.error('Error accessing microphone:', error);
            setIsListening(false);
        }
    };

    const stopRecording = () => {
        recorderRef.current.stopRecording(() => {
            setIsListening(false);
            const blob = recorderRef.current.getBlob();
            // downloadAudio(blob);
            // const blobURL = URL.createObjectURL(blob);
            // setBlobURL(blobURL);
            

            // Release the microphone
            if (streamRef.current)
            {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }

            sendRecording(blob);
        });
    };

    const handleFeedbackClick = () => {
        if (currentInterviewSession)
        {
            localStorage.setItem('lastInterviewId', currentInterviewSession);
            navigate('/feedback');
        }
    };

    //Handles microphone state change
    const handleRecordStateChange = (e) => {
        if (isListening)
        {
            //Disable recording
            e.target.classList.remove("listening");
            stopRecording();
        }
        else
        {
            //Enable recording
            e.target.classList.add("listening");
            startRecording();
        }
    }

    return (
        <div className="chat-container-with-parameters">
            <NavBar />
            {started && (
                <div className="chat-section">
                    <div className="chatbox-heading">AI Interview Assistant</div>

                    {interviewMode === "text" && <div className="chat-messages">
                        {chatMessages.map((msg, index) => (
                            <div
                                key={index}
                                className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'ai-message'}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>}

                    <div className="chat-input-wrapper">
                        {interviewMode === "text" && <textarea
                            value={userInput}
                            onChange={handleInputChange}
                            className="chat-textarea"
                            placeholder={isInterviewEnded ? "Interview ended" : "Type your message..."}
                            onKeyDown={handleEnterPress}
                            disabled={isInterviewEnded}
                        />}
                        <div className="chat-input-footer">
                            {interviewMode === "text" && <span className="char-counter">
                                {MAX_CHARS - userInput.length} characters remaining
                            </span>}
                            <div className="chat-buttons">
                                {isInterviewEnded && <button
                                    className="transcript-button"
                                    onClick={getTranscript}
                                >
                                    Get Transcript
                                </button>}
                                {/* <button
                                    className={`mic-button-container`}
                                    // onClick={toggleListening}
                                    disabled={isInterviewEnded}
                                >
                                    <FaMicrophone
                                    /> */}
                                {/* style={{
                                            color: listening ? 'red' : 'white',
                                            fontSize: '20px',
                                        }} */}
                                {/* </button> */}
                                {interviewMode === "text" && !isInterviewEnded && <button
                                    className="submit-button"
                                    onClick={fetchChatResponse}
                                    disabled={isInterviewEnded}
                                >
                                    Submit
                                </button>}

                                {isInterviewEnded && <button
                                    className="submit-button"
                                    onClick={handleFeedbackClick}
                                    disabled={!isInterviewEnded}
                                >
                                    Get feedback!
                                </button>}
                            </div>
                        </div>
                    </div>

                    {interviewMode === "speech" && <div className="interview-speech-section">
                        <button className={`mic-button`} onClick={handleRecordStateChange} disabled={isWaiting}>
                            <FaMicrophone />
                        </button>
                        <span style={{color: "red"}}>{speechError}</span>
                    </div>}

                </div>
            )}

            <div className="interview-parameters-section">
                <InterviewParameters onStart={startInterview} areMutable={!started} />
            </div>
        </div>
    );
}

export default Chat;