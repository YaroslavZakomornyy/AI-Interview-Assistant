import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import redisClient from "../redis-client.js";
import pdfParse from "pdf-parse";

dotenv.config();

const endpoint = process.env.CHAT_COMPLETION_ENDPOINT;
const apiKey = process.env.API_KEY;


if (!apiKey || !endpoint)
{
    throw new Error("Please set API_KEY and ENDPOINT in your environment variables.");
}


const parse = async (path) => {
    try
    {
        let dataBuffer = fs.readFileSync(path);
        const data = await pdfParse(dataBuffer);
        return data.text;
    }
    catch (err)
    {
        console.error(err);
        throw new Error("Failed to parse PDF");
    }
}


//TODO: FIX
const feedback = async (req, res) => {

    const fileId = req.params["fileId"];

    //Check if it exists
    if (!(await redisClient.exists(`files:${req.userId}:${fileId}`)))
    {
        return res.status(404).json({ error: 'File not found' });
    }

    const file = await redisClient.hGet(`files:${req.userId}:${fileId}`, "path");

    if (!file){
        console.log("file for feedback is not found");
        return res.sendStatus(500);
    }

    console.log(file);
    const contents = await parse(file);

    const messages =
    [
        {
            "role": "system",
            "content":"Analyze the provided resume and give feedback on positive and negative sides of the resume." +
                        "Make sure to score the user from 0 to 10 in the following categories: -Style -Consistency -Content and " +
                        "any other categories you find useful. Give tips on how to improve the resume."
            
        },
        {
            "role": "user",
            "content": contents,
        },
    ]
    
    const headers = {
        "Content-Type": "application/json",
        "api-key": apiKey
    };

    // Request payload
    const payload = {
        "messages": messages,
        "temperature": 0.7,
        "top_p": 0.95,
        "max_tokens": 800
    };

    try {
        const response = await axios.post(endpoint, payload, { headers });
        if (!response.data || !response.data.choices || !response.data.choices[0]) {
            return res.status(500).json({ error: "Invalid API response" });
        }
        return res.status(200).json({ message: response.data.choices[0].message.content });
    } catch (err) {
        console.error("Error in API request:", err);
        return res.status(500).json({ error: "Failed to get feedback" });
    }
}


export default {
    feedback
}




