import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',  // Replace with your server's URL
});



export const sendMessage = async (message) => {
    try {
        const response = await api.post('/message', {message});
        return response.data.choices[0].message.content;
    
    } catch (error) {

        if (error.code === "ERR_NETWORK"){
            return "Error! Server refused connection!";
        }
        else{
            console.error('Error:', error);
            return "Error! " + error;
        }
        
    }
};


export const setParameters = async (parameters) => {
    const load = JSON.stringify(parameters);

    try {
        const response = await api.post("/ai-parameters", {
            message: load,
        });
        console.log(response.data);
        
    
    } catch (error) {
        console.error('Error:', error);
    }
};
