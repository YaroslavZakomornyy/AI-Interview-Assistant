import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Chat from './components/Chat'
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import ResumePage from './components/ResumePage';
import FeedbackPage from './components/InterviewFeedback';
import apiService from './services/api-service';
import { useEffect } from 'react';

function App() {

    useEffect(() => {
        const test = async () => {
            const res = await apiService.getActiveSession();
        }

        test();
    }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/Home" element={<HomePage />} />
        <Route path="/chat" element={<Chat />} /> 
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </Router>
  );
}

export default App
