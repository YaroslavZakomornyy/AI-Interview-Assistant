import React, { useState } from 'react';
import './Chat.css'; // Reuse styling for consistency
import axios from 'axios';

const FeedbackPage = ({ interviewId }) => {
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFeedback = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/feedback/${interviewId}`);
            setFeedback(response.data.message);
        } catch (err) {
            setError('Error fetching feedback. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-container-with-parameters">
            <div className="chat-section">
                <h2 className="chatbox-heading">Interview Feedback</h2>
                {loading ? (
                    <p>Loading feedback...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : feedback ? (
                    <div className="feedback-container">
                        <h3>Score: {feedback.score}%</h3>
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
                            <ul>
                                {feedback.improvement.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                ))}
                            </ul>
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
