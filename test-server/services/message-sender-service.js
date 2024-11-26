import redisClient from "../redis-client.js";
import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";

dotenv.config();
const apiKey = process.env.API_KEY;
const endpoint = process.env.CHAT_COMPLETION_ENDPOINT;

const appendNewMessage = (messageHistory, newMessage, role) => {
    messageHistory.push(
        {
            "role": role,
            "content": newMessage
        }
    );
}


const sendInterviewMessage = async (userId, interviewId, message) =>{
    //Retrieving current interview history
    const currentSessionData = await redisClient.hGet(`interviews:${userId}:${interviewId}`, 'history');
    const history = JSON.parse(currentSessionData);
    appendNewMessage(history, message, 'user');

    //Write the user message to the log. Doing this separately, since the history will be changed to fit the token count
    fs.appendFileSync(`${global.appRoot}/data/transcripts/${userId}/${interviewId}.txt`, `[${new Date().toISOString()}]user: ${message}\n`);

    try
    {
        const headers = {
            "Content-Type": "application/json",
            "api-key": apiKey
        };

        // Request payload
        const payload = {
            "messages": history,
            "temperature": 0.7,
            "top_p": 0.95,
            "max_tokens": 200
        };

        //Send a message and wait for the reply
        const response = await axios.post(endpoint, payload, { headers });

        //Write the AI message to the log
        fs.appendFileSync(`${global.appRoot}/data/transcripts/${userId}/${interviewId}.txt`, `[${new Date().toISOString()}]interviewer: ${response.data.choices[0].message.content}\n`);

        //Append the reply to the message history
        appendNewMessage(history, response.data.choices[0].message.content, 'assistant');

        await redisClient.hSet(`interviews:${userId}:${interviewId}`, {
            owner: userId,
            history: JSON.stringify(history)
        });
        // redisClient.push(req.userId, { owner: req.userId, history: history });

        return {response: response, error: null};
    } catch (error)
    {
        return {response: null, error: error};
    }
}


export default {    
    sendInterviewMessage
}