import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',  // Replace with your server's URL
});

//For now
const USER_ID = 1;

export const sendMessage = async (message) => {
    try
    {
        const response = await api.post('/chat/message', {
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


export const setParameters = async (parameters) => {
    const load = JSON.stringify(parameters);

    try
    {
        const response = await api.post("/chat/parameters", {
            message: load,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': USER_ID
            }
        });
        console.log(response.data);


    } catch (error)
    {
        console.error('Error:', error);
    }
};

export const evaluateResume = async (resume, progressCb) => {
    const formData = new FormData();
    formData.append('file', resume, resume.name);

    try
    {

        if(progressCb && typeof progressCb === "function") progressCb("Uploading");

        //Upload the resume
        let response = await api.post("/files/resumes", formData,
            {
                headers: {
                    'x-user-id': USER_ID
                }
            });

        console.log(response);
        const fileId = response.data.fileId;


        if(progressCb && typeof progressCb === "function") progressCb("Evaluating")

        //Get the feedback for it
        response = await api.get(`/resumes/${fileId}/feedback`,
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
