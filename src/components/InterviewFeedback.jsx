import React from 'react';
import './InterviewFeedback.css';

const InterviewFeedback = () => {
    return (
        <div className={styles.feedbackContainer}>
            <div className={styles.scoreContainer}>
                <div className={styles.circle} style={{ backgroundColor: '#4CAF50' }}>
                    <span className={styles.scoreText}>9/10</span>
                </div>
                <p>Great understanding</p>
            </div>
            <div className={styles.scoreContainer}>
                <div className={styles.circle} style={{ backgroundColor: '#FF5722' }}>
                    <span className={styles.scoreText}>5/10</span>
                </div>
                <p>Takes too much time to answer</p>
            </div>
            <div className={styles.scoreContainer}>
                <div className={styles.circle} style={{ backgroundColor: '#4CAF50' }}>
                    <span className={styles.scoreText}>4/4</span>
                </div>
                <p>Correct answers</p>
            </div>
            <div className={styles.feedbackText}>
                <p>The user should learn more about React, JS, DB design.</p>
                <p>Suggested algorithms to learn: knapsack problem, sliding window technique.</p>
                <p>Great fit for the chosen company. Would hire.</p>
            </div>
        </div>
    );
};

export default InterviewFeedback;
