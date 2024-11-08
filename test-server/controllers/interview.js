import dotenv from "dotenv";
import axios from "axios";
import redisClient from "../redis-client.js";
import buildParameterQuery from "../services/message_preprocessor.js";
import { randomUUID } from "crypto";
import fs from "fs";

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

//user's message
const sendMessage = async (req, res, next) => {
    const userId = req.headers['x-user-id'];

    if (!userId)
    {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const userMessage = req.body.message;
    if (!userMessage)
    {
        return res.status(400).json({ error: 'Message is required' });
    }

    const interviewId = req.params['interviewId'];

    const history = redisClient.get(interviewId);
    fs.appendFileSync(`${global.appRoot}/transcripts/${userId}/${interviewId}`, `user: ${userMessage}\n`);


    //store transcript file inside
    appendNewMessage(history.history, userMessage, 'user');

    try
    {
        const headers = {
            "Content-Type": "application/json",
            "api-key": apiKey
        };

        // Request payload
        const payload = {
            "messages": history.history,
            "temperature": 0.7,
            "top_p": 0.95,
            "max_tokens": 200
        };

        // console.log(payload);

        //Send a message and wait for the reply
        const response = await axios.post(endpoint, payload, { headers });
        fs.appendFileSync(`${global.appRoot}/transcripts/${userId}/${interviewId}`, `interviewer: ${response.data.choices[0].message.content}\n`);

        //Append the reply to the message history
        appendNewMessage(history.history, response.data.choices[0].message.content, 'assistant');


        redisClient.push(userId, { owner: userId, history: history });

        // Send it back to client
        return res.status(200).json(response.data);
    } catch (error)
    {
        // console.error(error);
        return res.status(500).json({ error: "Error with OpenAI" });
    }
}


const create = async (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId)
    {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const parameters = await JSON.parse(req.body.parameters || "");

    if (req.body.parameters == "" || parameters.quality === undefined || parameters.beh === undefined)
    {
        return res.status(400).json({ error: 'Some parameters are missing.' });
    }

    if (!fs.existsSync(`${global.appRoot}/transcripts/${userId}`)){
        fs.mkdirSync(`${global.appRoot}/transcripts/${userId}`);
    }

    const message = buildParameterQuery({
        behavior: parameters.beh,
        workplace_quality: parameters.quality,
        interview_style: parameters.int
    });

    const params = 
        {
            "role": "system",
            "content": message
        }
    ;

    //Generate session id and push it
    const sessionId = randomUUID();

    redisClient.push(sessionId, { owner: userId, history: [params] });
    // console.log(redisClient.get(sessionId));

    return res.status(201).json({ sessionId: sessionId });
}

const transcript = async (req, res) => {
    const userId = req.headers['x-user-id'];

    if (!userId)
    {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const interviewId = req.params['interviewId'];

    // const history = fs.readFileSync();

    return res.status(200).sendFile(`${global.appRoot}/transcripts/${userId}/${interviewId}`);
}

export default {
    sendMessage, create, transcript
}