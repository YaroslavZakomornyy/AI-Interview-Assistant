import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',  // Replace with your server's URL
});

//For now
const USER_ID = 1;

const sendMessage = async (message, interviewId) => {
    try
    {
        const response = await api.post(`/interviews/${interviewId}/message`, {
            message
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': USER_ID
            }
        });
        return await response.data.choices[0].message.content;

    } catch (error)
    {

        if (error.code === "ERR_NETWORK")
        {
            return "Error! Server refused connection!";
        }
        else
        {
            console.error('Error:', error);
            return "Error! " + error;
        }

    }
};

const sendRecording = async (recording, interviewId) => {
    if (!recording) return;
    const formData = new FormData();
    formData.append('audio', recording, 'recording.wav');
            
    try
    {
        const response = await api.post(`/interviews/${interviewId}/voice`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-User-ID': USER_ID
            }
        });

        console.log(response);
        return response.data;

    } catch (error)
    {

        if (error.code === "ERR_NETWORK")
        {
            return "Error! Server refused connection!";
        }
        else
        {
            console.error('Error:', error);
            return "Error! " + error;
        }

    }
}

const getInterviewFeedback = async(interviewId) => {
    const response = await api.get(`/interviews/${interviewId}/feedback`, {
        headers: {
            'X-User-ID': USER_ID
        }
    });
    console.log(response);
    return response.data;
}

const createInterviewSession = async (parameters, jobDescription) => {
    const load = JSON.stringify(parameters);
    console.log(load);

    try
    {
        const response = await api.post(`/interviews`, {
            parameters: load,
            jobDescription: jobDescription
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': USER_ID
            }
        });


        const interviewId = response.data.sessionId;
        return interviewId; 

    } catch (error)
    {
        console.error('Error:', error);
    }
};

const getTranscript = async (interviewId) => {

    try{

        const response = await api.get(`/files/${interviewId}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': USER_ID
            }
        });


        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Transcript.txt'); 
        link.click();
        link.remove();
    }
    catch (err){
        console.error(err);
    }
}

const evaluateResume = async (resume, jobDescription = '', progressCb) => {
    const formData = new FormData();
    formData.append('file', resume, resume.name);
    
    // Optionally add job description if provided
    if (jobDescription) {
        formData.append('jobDescription', jobDescription);
    }

    try {
        if (progressCb && typeof progressCb === "function") progressCb("Uploading");

        // Upload the resume
        let response = await api.post("/files", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-User-ID': USER_ID
            }
        });

        console.log(response);
        const fileId = response.data.fileId;

        if (progressCb && typeof progressCb === "function") progressCb("Evaluating");

        // Get feedback for the uploaded resume
        response = await api.get(`/files/${fileId}/feedback`, {
            headers: {
                'X-User-ID': USER_ID
            }
        });

        if (progressCb && typeof progressCb === "function") progressCb("Done");
        
        return response;

    } catch (error) {
        console.error('Error in evaluateResume:', error);
        throw error;  // Propagate the error for additional handling in ResumePage.jsx
    }
};

export default {
    sendMessage, getInterviewFeedback, createInterviewSession, evaluateResume, getTranscript, sendRecording
}