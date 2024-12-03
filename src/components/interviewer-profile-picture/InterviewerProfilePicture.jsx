import { useState, useEffect, useRef } from 'react';
import './InterviewerProfilePicture.css'

export default function InterviewerProfilePicture({ audioUrl, onSpeechEnded }) {
    const audioContextRef = useRef();
    const analyzerRef = useRef();
    const audioRef = useRef(null);
    const [volume, setVolume] = useState(0);
    const sourceRef = useRef(null);
    const animationFrameRef = useRef();

    const handleSpeechEnd = () => {
        cancelAnimationFrame(animationFrameRef.current);
        setVolume(0);
        onSpeechEnded();
    }

    useEffect(() => {
        audioContextRef.current = new AudioContext(window.AudioContext || window.webkitAudioContext);
        analyzerRef.current = audioContextRef.current.createAnalyser();
        analyzerRef.current.fftSize = 256;
    }, [])


    useEffect(() => {
        if (!audioUrl || !audioContextRef || !audioRef) return;

        if (!sourceRef.current){
            sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
            sourceRef.current.connect(analyzerRef.current);
            analyzerRef.current.connect(audioContextRef.current.destination);
        } 

        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);

        audioRef.current.play();

        const updateVisualization = () => {
            analyzerRef.current.getByteFrequencyData(dataArray);
            // Use dataArray to update your visual elements
            const avgVolume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            console.log(avgVolume);
            console.log("Loop");
            setVolume(avgVolume);
            // Loop the visualization
            animationFrameRef.current = requestAnimationFrame(updateVisualization);
        };

        updateVisualization();

    }, [audioUrl])

    return (
        <div>
            <audio src={audioUrl} ref={audioRef} onEnded={handleSpeechEnd}/>
            <div className='interviewer-picture'>
                <img src="/InterviewerPfpFemale.png" />
                <div
                    style={{
                        position: 'absolute',
                        width: `calc(100% + 2px + ${volume / 25 * 5}px)`,
                        height: `calc(100% + 2px + ${volume / 25 * 5}px)`,
                        backgroundColor: '#6366F1',
                        transform: "translate(-50%, -50%)",
                        top: '50%',
                        left: '50%',

                        // opacity: 1,
                        opacity: Math.min(volume / 65, 1),
                        transition: 'opacity 0.05s linear',
                        borderRadius: '100%',
                        zIndex: '0',

                    }}
                />
            </div>

        </div>
    );
};