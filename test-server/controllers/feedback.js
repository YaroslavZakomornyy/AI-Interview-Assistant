import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";
import redisClient from "../redis-client.js";
import pdfParse from "pdf-parse";

dotenv.config();

const endpoint = process.env.CHAT_COMPLETION_ENDPOINT;
const apiKey = process.env.API_KEY;


if (!apiKey || !endpoint)
{
    throw new Error("Please set API_KEY, ENDPOINT, AI_VERSION and ASSISTANT_ID in your environment variables.");
}


const parse = async (path) => {
    let dataBuffer = fs.readFileSync(path);

    try
    {
        const data = await pdfParse(dataBuffer);
        return data.text;
    }
    catch (err)
    {
        console.error(err);
        return "";
    }
}



const feedback = async (req, res) => {

    const fileId = req.params.fileId;

    //Check if it exists
    if (!redisClient.contains(fileId))
    {
        return res.status(404).json({ error: 'File not found' });
    }

    const file = redisClient.get(fileId)[0];

    const contents = await parse(file.path);

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
        "max_tokens": 200
    };

    try{
        const response = await axios.post(endpoint, payload, { headers });
        return res.status(200).json({ message: response.data.choices[0].message.content });
    }
    catch (err){
        console.error(err);
        return res.status(500).json({error: err});
    }
}


export default {
    feedback
}




