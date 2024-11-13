import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/v1',  // Replace with your server's URL
});

//For now
const USER_ID = 1;

export const sendMessage = async (message, interviewId) => {
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


export const createInterviewSession = async (parameters) => {
    const load = JSON.stringify(parameters);
    console.log(load);

    try
    {
        const response = await api.post(`/interviews`, {
            parameters: load,
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

export const getTranscript = async (interviewId) => {

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

export const evaluateResume = async (resume, progressCb) => {
    const formData = new FormData();
    formData.append('file', resume, resume.name);

    try
    {

        if(progressCb && typeof progressCb === "function") progressCb("Uploading");

        //Upload the resume
        let response = await api.post("/files", formData,
            {
                headers: {
                    'x-user-id': USER_ID
                }
            });

        console.log(response);
        const fileId = response.data.fileId;


        if(progressCb && typeof progressCb === "function") progressCb("Evaluating")

        //Get the feedback for it
        response = await api.get(`feedback/resumes/${fileId}`,
            {
                headers: {
                    'x-user-id': USER_ID
                }
            }
        );

        if(progressCb && typeof progressCb === "function") progressCb("Done")
        
        return response;

    } catch (error)
    {
        console.error('Error:', error);
    }
}
