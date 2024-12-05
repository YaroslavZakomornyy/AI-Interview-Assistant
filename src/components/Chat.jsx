import apiService from '../services/api-service';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css';
import InterviewParameters from './interview-parameters/InterviewParameters';
import NavBar from './NavBar';
import { FaMicrophone } from 'react-icons/fa'; // Install with: npm install react-icons
import RecordRTC from 'recordrtc';
import InterviewerProfilePicture from './interviewer-profile-picture/InterviewerProfilePicture';
import PopupWindow from './popup-window/PopupWindow';
import transcriptParser from '../utils/transcript-parser';


function Chat() {
    const [chatMessages, setChatMessages] = useState([]);
    const [currentInterviewSession, setCurrentInterviewSession] = useState(null);
    const [userInput, setUserInput] = useState("");
    const [started, setStarted] = useState(false);
    const [isInterviewEnded, setIsInterviewEnded] = useState(false);
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false); // New state for microphone
    const [interviewMode, setInterviewMode] = useState("text");
    const [isWaiting, setIsWaiting] = useState(false);
    const [speechError, setSpeechError] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const recorderRef = useRef(null);
    const streamRef = useRef(null); // Reference to store the MediaStream
    const [shouldEnd, setShouldEnd] = useState(false);
    const [hasIncompleteSection, setHasIncompleteSection] = useState(false);

    const MAX_CHARS = 500;

    useEffect(() => {
        const getActiveSession = async () => {
            const response = await apiService.getActiveSession();

            const { interviewId } = response.data;

            if (!interviewId) return;

            setHasIncompleteSection(true);
            setCurrentInterviewSession(interviewId);
        }


        getActiveSession();
    }, [])

    function handleEnterPress(e) {
        if (e.key === "Enter" && !isInterviewEnded)
        {
            e.preventDefault();
            e.stopPropagation();
            fetchChatResponse();
        }
    }

    /**
     * Starts the interview
     * @param {string} behavior 
     * @param {string} quality 
     * @param {string} interviewStyle 
     * @param {string} jobDescription 
     * @param {string} interviewMode 
     * @param {*} resume 
     * @returns 
     */
    const startInterview = async (behavior, quality, interviewStyle, jobDescription, interviewMode, resume) => {
        const parameters = {
            "beh": behavior,
            "quality": quality,
            "int": interviewStyle,
            "mode": interviewMode.replace("\n", " ").trim()
        }

        try
        {
            const { error, response: interviewId } = await apiService.createInterviewSession(parameters, jobDescription, resume);

            if (error) return;

            setInterviewMode(interviewMode);
            setCurrentInterviewSession(interviewId);
            setStarted(true);
            setIsInterviewEnded(false);
        }
        catch (error)
        {
            console.error(error);
        }
    }

    const getTranscript = async () => {
        if (!currentInterviewSession) return;

        try
        {
            // Use the existing getTranscript function from api.js
            const file = await apiService.getTranscript(currentInterviewSession);

            const url = window.URL.createObjectURL(new Blob([file]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Transcript.txt');
            link.click();
            link.remove();


        } catch (error)
        {
            console.error('Error getting transcript:', error);
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

        const message = userInput.slice(0, MAX_CHARS).replace('\n', " ");
        setChatMessages(prevMessages => [...prevMessages, { sender: 'user', text: message }]);
        setUserInput("");

        let { response: reply, error } = await apiService.sendMessage(message, currentInterviewSession);

        if (error)
        {
            console.error(error);
            return;
        }

        // Check if the AI wants to end the interview
        if (reply.includes('/stop'))
        {
            // console.log(reply);
            setIsInterviewEnded(true);
            reply = reply.replace('/stop', '');
        }

        setChatMessages(prevMessages => [...prevMessages, { sender: 'ai', text: reply }]);

    };

    const sendRecording = async (file) => {
        setIsWaiting(true);

        //Convert speech to text
        let { response, error } = await apiService.speechToText(file, currentInterviewSession);

        if (error)
        {
            setIsWaiting(false);
            setSpeechError(error);
            return;
        }

        //Send the converted message 
        ({ response, error } = await apiService.sendMessage(response.data.message, currentInterviewSession));
        console.log(response);
        if (error)
        {
            setIsWaiting(false);
            setSpeechError(error);
            return;
        }

        //If the chat sent '/stop', we want to end the interview
        const ended = response.includes('/stop');

        if (ended)
        {
            response = response.replace('/stop', '');
            setShouldEnd(true);
        }

        //Convert text to speech
        ({ response, error } = await apiService.textToSpeech(response));
        if (error)
        {
            setIsWaiting(false);
            setSpeechError(error);
            return;
        }

        //Convert the received AudioBuffer to blob
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        setAudioUrl(URL.createObjectURL(blob));
    }

    const onAiSpeechEnded = () => {
        setIsWaiting(false);
        if (shouldEnd) setIsInterviewEnded(true);
        setAudioUrl(null);
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

    const handleContinueInterviewSession = async () => {
        const storedSession = await apiService.getInterviewData(currentInterviewSession);
        const transcript = await apiService.getTranscript(currentInterviewSession);

        setChatMessages(transcriptParser.parse(transcript));
        setStarted(true);

    }

    const handleRejectInterviewSession = async () => {
        const error = await apiService.deleteInterview(currentInterviewSession);

        if (error)
        {
            console.error(error);
            return;
        }

        setHasIncompleteSection(false);
        setCurrentInterviewSession(null);
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
                                {interviewMode === "text" && !isInterviewEnded && <button
                                    className="submit-button"
                                    onClick={fetchChatResponse}
                                    disabled={isInterviewEnded || userInput.length == 0}
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


                    {/* Speech mode */}
                    {interviewMode === "speech" && <div className="interview-speech-section">

                        {/* <input type='file' onChange={(e) => setAudioUrl(URL.createObjectURL(e.target.files[0]))}></input> */}
                        <InterviewerProfilePicture audioUrl={audioUrl} onSpeechEnded={onAiSpeechEnded} />
                        <button className={`mic-button`} onClick={handleRecordStateChange} disabled={isWaiting || isInterviewEnded}>
                            <FaMicrophone />
                        </button>
                        <span style={{ color: "red" }}>{speechError}</span>
                    </div>}

                </div>
            )}

            <div className="interview-parameters-section" style={{ flex: started ? 0.6 : 1 }}>
                <InterviewParameters onStart={startInterview} areMutable={!started} />
            </div>
            {hasIncompleteSection && !started && <PopupWindow title={"Warning!"}
                text={"You have an active interview session! You can either continue it, or reject it (you will not get the feedback and the transcript)"}
                acceptButtonText={"Resume"}
                onAcceptClick={handleContinueInterviewSession}
                rejectButtonText={"Abort"}
                onRejectClick={handleRejectInterviewSession} />}
        </div>

    );
}

export default Chat;