import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './Chat.css'; // Reuse styling for consistency
import NavBar from './NavBar';
import apiService from '../services/api-service';


const FeedbackPage = () => {
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchInterviewFeedback = async () => {
            // Get the last started interview ID from local storage
            const lastInterviewId = localStorage.getItem('lastInterviewId');
            
            if (!lastInterviewId) {
                setError('No recent interview found.');
                setLoading(false);
                return;
            }
            
            try {

                const response = await apiService.getInterviewFeedback(lastInterviewId);
            
                // Parse the feedback 
                const feedbackContent = response.message;
                console.log(response);
                // Try to parse the feedback, with fallback to default structure
                let parsedFeedback;
                try {
                    parsedFeedback = JSON.parse(feedbackContent);
                } catch (parseError) {
                    console.error('Failed to parse feedback:', parseError);
                    parsedFeedback = {
                        overallScore: 0,
                        positiveAspects: feedbackContent || 'No detailed feedback available.',
                        negativeAspects: 'No specific negative aspects noted.',
                        improvementTips: []
                    };
                }
                // const parsedFeedback = JSON.parse(feedbackContent);

                setFeedback({
                    score: parsedFeedback.overallScore || 0,
                    positive: parsedFeedback.positiveAspects || 'No specific positive aspects noted.',
                    negative: parsedFeedback.negativeAspects || 'No specific negative aspects noted.',
                    improvement: parsedFeedback.improvementTips || []
                });
                setLoading(false);
            } catch (err) {
                console.error('Error fetching feedback:', err);
                setError('Failed to fetch interview feedback. Please try again.');
                setLoading(false);
            }
        };

        fetchInterviewFeedback();
    }, []);

    if (loading) return <div className="chat-container-with-parameters">Loading feedback...</div>;
    if (error) return <div className="chat-container-with-parameters error-message">{error}</div>;

    return (
        <div className="chat-container-with-parameters">
            <NavBar/>
            <div className="chat-section">
                <h2 className="chatbox-heading">Interview Feedback</h2>
                {feedback ? (
                    <div className="feedback-container">
                        <h3>Overall Score: {feedback.score}%</h3>
                        <div>
                            <h4>Positive Aspects:</h4>
                            <p>{feedback.positive}</p>
                        </div>
                        <div>
                            <h4>Negative Aspects:</h4>
                            <p>{feedback.negative}</p>
                        </div>
                        <div>
                            <h4>Areas for Improvement:</h4>
                            {feedback.improvement.length > 0 ? (
                                <ul>
                                    {feedback.improvement.map((tip, index) => (
                                        <li key={index}>{tip}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No specific improvement tips provided.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p>No feedback available.</p>
                )}
            </div>
        </div>
    );
};

export default FeedbackPage;