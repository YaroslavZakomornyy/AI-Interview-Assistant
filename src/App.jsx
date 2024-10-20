import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Chat from './components/Chat'
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import ResumePage from './components/ResumePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} /> 
        <Route path="/Home" element={<HomePage />} />
        <Route path="/chat" element={<Chat />} /> 
        <Route path="/resume" element={<ResumePage />} />
      </Routes>
    </Router>
  );
}

export default App
