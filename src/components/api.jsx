import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',  // Replace with your server's URL
});

//For now
const USER_ID = 1;

export const sendMessage = async (message) => {
    try {
        const response = await api.post('/chat/message', {
            message
        }, {
            headers:{
                'Content-Type': 'application/json',
                'X-User-ID': USER_ID  
            }
        });
        return await response.data.choices[0].message.content;
    
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
        
        const response = await api.post("/chat/parameters", {
            message: load,
        }, {
            headers:{
                'Content-Type': 'application/json',
                'X-User-ID': USER_ID
            }
        });
        console.log(response.data);
        
    
    } catch (error) {
        console.error('Error:', error);
    }
};
