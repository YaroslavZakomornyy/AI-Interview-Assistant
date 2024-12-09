import redisClient from "../redis-client.js";
import dotenv from "dotenv";
import fs from "fs";
import axios from "axios";
import { error } from "console";
import redisQueryService from "./redis-query-service.js";
import { getTranscriptPath } from "#src/utils/path-builder-util.js";

dotenv.config();
const apiKey = process.env.API_KEY;
const endpoint = process.env.CHAT_COMPLETION_ENDPOINT;

if (!apiKey || !endpoint)
{
    throw new Error("No API_KEY or CHAT_COMPLETION_ENDPOINT provided");
}

/**
 * Sends one message to the AI
 * @param {string} message Message to send to
 * @param {string} role Can be either of "system", "assistant" or "user"
 * @param {number} token_limit The output token limit
 * @returns Response from the AI or error
 */
const sendOneMessage = async (message, role, token_limit = 300) => {
    if (role !== "system" && role !== "assistant" && role !== "user"){
        throw new Error("Role can be either 'system', 'assistant' or 'user'");
    }

    try{
        const headers = {
            "Content-Type": "application/json",
            "api-key": apiKey
        };

        // Request payload
        const payload = {
            "messages": [
                {
                    role: role,
                    content: message
                }
            ],
            "temperature": 0.7,
            "top_p": 0.95,
            "max_tokens": token_limit
        };

        
        return {response: await axios.post(endpoint, payload, { headers })};
    }
    catch (error){
        return {error: error};
    }
}

const appendNewMessage = (messageHistory, newMessage, role) => {
    messageHistory.push(
        {
            "role": role,
            "content": newMessage
        }
    );
}


const sendInterviewMessage = async (userId, interviewId, message) => {
    //Retrieving current interview history    
    let {error, response: [currentSessionData, tokenCount, subEvaluations]} = await redisQueryService.getInterviewFields(userId, interviewId, ['history', 'historyTokenCount', 'subEvaluations']);

    if (error){
        return { error: error };
    }

    let history = JSON.parse(currentSessionData);
    try
    {
        //If the history is too big, summarize it
        if (tokenCount >= 2000)
        {
            //The first message is the original parameters prompt
            const { response: resp, error } = await summarizeChatHistory(history.slice(1));
            if (error)
            {
                console.error(error);
                throw new Error(error);
            }

            // console.log(resp);

            const { summary, newTokenCount, evaluation, questions } = resp;

            history = [history[0]];
            appendNewMessage(history, JSON.stringify(questions), 'assistant');
            appendNewMessage(history, summary, 'system'); 

            subEvaluations = JSON.parse(subEvaluations);
            subEvaluations.push(evaluation);
            subEvaluations = JSON.stringify(subEvaluations);
            
            // tokenCount = newTokenCount
        }


        appendNewMessage(history, message, 'user');

        //Write the user message to the log. Doing this separately, since the history will be changed to fit the token count
        fs.appendFileSync(getTranscriptPath(userId, interviewId), `[${new Date().toISOString()}]user: ${message}\n`);


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
        fs.appendFileSync(getTranscriptPath(userId, interviewId), `[${new Date().toISOString()}]interviewer: ${response.data.choices[0].message.content}\n`);

        //Append the reply to the message history
        appendNewMessage(history, response.data.choices[0].message.content, 'assistant');

        await redisClient.HSET(`interviews:${userId}:${interviewId}`, {
            owner: userId,
            history: JSON.stringify(history),
            historyTokenCount: response.data.usage.prompt_tokens,
            subEvaluations: subEvaluations
        });

        return { response: response};
    } catch (error)
    {
        return { error: error };
    }
}

const summarizeChatHistory = async (chatHistory) => {
    try
    {

        if (!chatHistory) throw new Error("No chat history provided!");
        console.log("Summarizing");

        appendNewMessage(chatHistory, "Summarize all messages above this one. Include the most important context that will allow to continue \
        the interview seamlessly. Return json with four properties: summary - actual summary, \
        tokenCount: prompt_tokens that will be required to pass this summary, \
        evaluation: another object with: \
                       { 'overallScore': number (0-100), \
                        'positiveAspects': string, \
                        'negativeAspects': string, \
                       'improvementTips': string[] }. \
        questions: quickly summirize topics that already were asked by you or the 'assistant' \
        Do not send the '```json' part, just the json itself.", "system");


        const headers = {
            "Content-Type": "application/json",
            "api-key": apiKey
        };

        // Request payload
        const payload = {
            "messages": chatHistory,
            "temperature": 0.7,
            "top_p": 0.95,
            "max_tokens": 600
        };


        //Send a message and wait for the reply
        let response = await axios.post(endpoint, payload, { headers });
        
        const json = JSON.parse(response.data.choices[0].message.content);
        // response = ;

        return { response: json, error: null };
    }
    catch (e)
    {
        console.error(e);
        return { response: null, error: e };
    }
}


export default {
    sendInterviewMessage, sendOneMessage
}