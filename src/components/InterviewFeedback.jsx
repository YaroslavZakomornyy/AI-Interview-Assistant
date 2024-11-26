import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import apiService from '../services/api-service';
import './InterviewFeedback.css';

const FeedbackPage = () => {
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchInterviewFeedback = async () => {
            const lastInterviewId = localStorage.getItem('lastInterviewId');
            if (!lastInterviewId) {
                setError('No recent interview found.');
                setLoading(false);
                return;
            }
            try {
                const response = await apiService.getInterviewFeedback(lastInterviewId);
                const feedbackContent = response.message;

                let parsedFeedback;
                try {
                    parsedFeedback = JSON.parse(feedbackContent);
                } catch {
                    parsedFeedback = {
                        overallScore: 0,
                        positiveAspects: feedbackContent || 'No detailed feedback available.',
                        negativeAspects: 'No specific negative aspects noted.',
                        improvementTips: []
                    };
                }
                setFeedback({
                    score: parsedFeedback.overallScore || 0,
                    positive: parsedFeedback.positiveAspects || 'No specific positive aspects noted.',
                    negative: parsedFeedback.negativeAspects || 'No specific negative aspects noted.',
                    improvement: parsedFeedback.improvementTips || []
                });
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch interview feedback. Please try again.');
                setLoading(false);
            }
        };
        fetchInterviewFeedback();
    }, []);

    if (loading) return <div className="feedback-container">Loading feedback...</div>;
    if (error) return <div className="feedback-container error-message">{error}</div>;

    return (
        <div className="feedback-page">
            <NavBar />
            {/* <div className="feedback-container"> */}
                <div className="feedback-content">
                    <h2 className="page-heading">Interview Feedback</h2>
                    {feedback ? (
                        <div className="feedback-box">
                            {/* Score Section */}
                            <div className="score-highlight">
                                <h3>Overall Score</h3>
                                <div className="score-circle">{feedback.score}%</div>
                            </div>
        
                            {/* Positive Aspects */}
                            <div className="feedback-section">
                                <h4 className="category-heading">Positive Aspects</h4>
                                <p style={{ textAlign: 'center' }}>{feedback.positive}</p>
                            </div>
        
                            {/* Negative Aspects */}
                            <div className="feedback-section">
                                <h4 className="category-heading">Negative Aspects</h4>
                                <p style={{ textAlign: 'center' }}>{feedback.negative}</p>
                            </div>
        
                            {/* Areas for Improvement */}
                            <div className="feedback-section">
                                <h4 className="category-heading">Areas for Improvement</h4>
                                {feedback.improvement.length > 0 ? (
                                    <ul style={{ textAlign: 'center' }}>
                                        {feedback.improvement.map((tip, index) => (
                                            <li key={index} className="list-item">{tip}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ textAlign: 'center' }}>No specific improvement tips provided.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p>No feedback available.</p>
                    )}
                </div>
            </div>
        // </div>
    );
}    
export default FeedbackPage;
