import { useState } from 'react'
import './App.css'
import Chat from './components/Chat'
import InterviewParameters from './components/interview-parameters/InterviewParameters'

function App() {


  
  return (
    <> 
      <div className="component-container">
        <Chat />
      </div>
      
      <div className="component-container">
        <InterviewParameters/>
      </div>
    </>
  )
}

export default App
