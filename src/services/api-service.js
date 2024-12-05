import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',  // Replace with your server's URL
});

//For now
const USER_ID = 1;

const sendMessage = async (message, interviewId) => {

    if (!message) return {error: "message is required"};
    if (!interviewId) return {error: "interviewId is required"};

    if (typeof message !== 'string' && !(message instanceof String))
    {
        return {error: "message must be a string"};
    }

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
        return { response: await response.data.choices[0].message.content };

    } catch (error)
    {

        if (error.code === "ERR_NETWORK")
        {
            return { error: "Error! Server refused connection!" };
        }
        else
        {
            console.error('Error:', error);
            return { error: "Error! " + error };
        }

    }
};

const textToSpeech = async (message) => {
    if (!message) return {error: "message is required"};

    if (typeof message !== 'string' && !(message instanceof String))
    {
        return {error: "message must be a string"};
    }

    try
    {
        const speechFromText = await api.post(`/textToSpeech`, {
            message
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': USER_ID
            },
            responseType: 'arraybuffer'
        });

        return { response: speechFromText };
    }
    catch (err)
    {
        if (err instanceof ArrayBuffer) err = { error: new TextDecoder().decode(err) };

        console.error(err);
        return { error: err.error };
    }

}

const speechToText = async (recording) => {
    if (!recording) return;
    const formData = new FormData();
    formData.append('audio', recording, 'recording.wav');

    try
    {
        const textFromSpeech = await api.post(`/speechToText`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-User-ID': USER_ID
            },
        });

        return { response: textFromSpeech };

    } catch (error)
    {
        if (error.code === "ERR_NETWORK")
        {
            return { error: "Error! Server refused connection!" };
        }
        if (error.status === 400)
        {
            let err = error.response.data;
            console.error(err.error);
            return { error: err.error };
        }
        else
        {
            console.error('Error:', error);
            return { error: "Error! " + error };
        }
    }
}

const getInterviewFeedback = async (interviewId) => {
    const response = await api.get(`/interviews/${interviewId}/feedback`, {
        headers: {
            'X-User-ID': USER_ID
        }
    });
    return response;
}

const getActiveSession = async () => {
    const response = await api.get(`/interviews/active`, {
        headers: {
            'Content-Type': 'application/json',
            'X-User-ID': USER_ID
        }
    });

    return response;
}

const createInterviewSession = async (parameters, jobDescription, resume) => {
    const load = JSON.stringify(parameters);

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
        return {response: interviewId};

    } catch (error)
    {
        console.error('Error:', error);
        return {error: "Connection refused"};
    }
};

const getTranscript = async (interviewId) => {
    try
    {

        const response = await api.get(`/files/${interviewId}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': USER_ID
            }
        });

        return response.data;
    }
    catch (error)
    {
        console.error(error);
        return {error: error};
    }
}

const evaluateResume = async (resume, jobDescription = '', progressCb) => {
    const formData = new FormData();
    formData.append('file', resume, resume.name);

    // Optionally add job description if provided
    if (jobDescription)
    {
        formData.append('jobDescription', jobDescription);
    }

    try
    {
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

    } catch (error)
    {
        console.error('Error in evaluateResume:', error);
        throw error;  // Propagate the error for additional handling in ResumePage.jsx
    }
};

const deleteInterview = async (interviewId) => {
    try{
        await api.delete(`/interviews/${interviewId}`, {
            headers: {
                'X-User-ID': USER_ID
            }
        });

        return null;
    }
    catch (error){
        console.error(error);
        return {error: error};
    }
}

const getInterviewData = async (interviewId) => {
    try{
        const interviewData = await api.get(`/interviews/${interviewId}`, {
            headers: {
                'X-User-ID': USER_ID
            }
        });

        return {response: interviewData};
    }
    catch (error){
        console.error(error);
        return {error: error};
    }
}

export default {
    sendMessage, getInterviewFeedback, createInterviewSession, 
    evaluateResume, getTranscript, speechToText, textToSpeech, 
    getActiveSession, deleteInterview, getInterviewData
}