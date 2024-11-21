import dotenv from "dotenv";
import axios from "axios";
import redisClient from "../redis-client.js";
import buildParameterQuery from "../services/interview-query-builder.js";
import { randomUUID } from "crypto";
import filesService from "../services/files-service.js";
import fs from "fs";

dotenv.config();

const apiKey = process.env.API_KEY;
const endpoint = process.env.CHAT_COMPLETION_ENDPOINT;

if (!apiKey || !endpoint)
{
    throw new Error("Please set API_KEY and ENDPOINT in your environment variables.");
}

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
    const userMessage = req.body.message;
    if (!userMessage)
    {
        return res.status(400).json({ error: 'Message is required' });
    }

    const interviewId = req.interviewId;
    
    //Retrieving current interview history
    const currentSessionData = await redisClient.hGet(`interviews:${req.userId}:${interviewId}`, 'history');
    const history = JSON.parse(currentSessionData);
    appendNewMessage(history, userMessage, 'user');

    //Write the user message to the log. Doing this separately, since the history will be changed to fit the token count
    fs.appendFileSync(`${global.appRoot}/data/transcripts/${req.userId}/${interviewId}.txt`, `[${new Date().toISOString()}]user: ${userMessage}\n`);

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
        fs.appendFileSync(`${global.appRoot}/data/transcripts/${req.userId}/${interviewId}.txt`, `[${new Date().toISOString()}]interviewer: ${response.data.choices[0].message.content}\n`);

        //Append the reply to the message history
        appendNewMessage(history, response.data.choices[0].message.content, 'assistant');

        await redisClient.hSet(`interviews:${req.userId}:${interviewId}`, {
            owner: req.userId,
            history: JSON.stringify(history)
        });
        // redisClient.push(req.userId, { owner: req.userId, history: history });

        // Send it back to client
        return res.status(200).json(response.data);
    } catch (error)
    {
        // console.error(error);
        return res.status(500).json({ error: "Error with OpenAI" });
    }
}


const create = async (req, res) => {

    const parameters = await JSON.parse(req.body.parameters || "");
    console.log(parameters);
    if (req.body.parameters == "" || parameters.quality === undefined || parameters.beh === undefined)
    {
        return res.status(400).json({ error: 'Some parameters are missing.' });
    }

    //Either get the description or set it as nothing
    const jobDescription = req.body.jobDescription || undefined;

    //Create a folder for user's transcripts if non-existent
    if (!fs.existsSync(`${global.appRoot}/data/transcripts/${req.userId}`)){
        fs.mkdirSync(`${global.appRoot}/data/transcripts/${req.userId}`);
    }

    //
    const params = buildParameterQuery({
        behavior: parameters.beh,
        workplace_quality: parameters.quality,
        interview_style: parameters.int,
        jobDescription: jobDescription
    });

    const message = 
        {
            "role": "system",
            "content": params
        }
    ;

    //Generate a session id and push it
    const sessionId = randomUUID();
    
    await redisClient.hSet(`interviews:${req.userId}:${sessionId}`, {
        history: JSON.stringify([message]),
        startedAt: new Date().toISOString(),
        status: "Running",
        transcriptId: sessionId,
        resumeId: "",
        behavior: parameters.beh,
        workplace_quality: parameters.quality,
        interview_style: parameters.int,
        jobDescriptionId: "",
    });
    //1 hours
    const INTERVIEW_TTL_SECONDS = 1 * 60 * 60;

    //Set 1 hour expiration time. It is updated on each interaction. The expiration will be cancelled if the status changes to "Finished"
    await redisClient.EXPIRE(`interviews:${req.userId}:${sessionId}`, INTERVIEW_TTL_SECONDS);

    //Create transcript file
    fs.closeSync(fs.openSync(`${global.appRoot}/data/transcripts/${req.userId}/${sessionId}.txt`, 'w'));

    await filesService.cacheFile(req.userId, sessionId,
        `${global.appRoot}/data/transcripts/${req.userId}/${sessionId}.txt`, "transcript", "transcript");

    return res.status(201).json({ sessionId: sessionId, transcriptId: sessionId});
}

const getData = async (req, res) => {

    const interview = await redisClient.HGETALL(`interviews:${req.userId}:${req.interviewId}`);
    // const history = fs.readFileSync();

    return res.status(200).json(interview);
}

const updateInterview = async (req, res) => {
    

}

export default {
    sendMessage, create, getData, updateInterview
}