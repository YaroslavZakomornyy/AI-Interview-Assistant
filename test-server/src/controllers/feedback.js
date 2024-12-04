import dotenv from "dotenv";
import axios from "axios";
import redisClient from "../redis-client.js";
import filesService from "../services/files-service.js";

dotenv.config();

const endpoint = process.env.CHAT_COMPLETION_ENDPOINT;
const apiKey = process.env.API_KEY;


if (!apiKey || !endpoint)
{
    throw new Error("Please set API_KEY and ENDPOINT in your environment variables.");
}

const interviewFeedback = async (req, res) => {
    const [interviewStatus, history, subEvaluations] = await redisClient.HMGET(`interviews:${req.userId}:${req.interviewId}`, ["status", "history", "subEvaluations"]);
    
    // No feedback on running interview Disabled for tests
    // if (interviewStatus === "Running") return res.status(409).json({error: "The interview is still running!"});
    
    // const transcript = await filesService.readAll(await redisClient.HGET(`files:${req.userId}:${transcriptId}`, "path"));
    
    const messages = [
        {
            "role": "system",
            "content": "Analyze the performance of the interviewee in the provided interview history. \
             (Do not evaluate rows that start with the 'interviewer' role.) \
            Provide comprehensive, but concise feedback (if possible, i.e. 2 sentence interviews are impossible to evaluate). \
                       Return a JSON with: \
                       { 'overallScore': number (0-100), \
                        'positiveAspects': string, \
                        'negativeAspects': string, \
                       'improvementTips': string[] }. \
            Here are partial evaluation that were based on the interview before the history summarization. You don't have to incorporate them, but \
            if you do, they should influence the final result. " + JSON.stringify(subEvaluations)
        },
        {
            "role": "user",
            "content": JSON.stringify(history),
        },
    ];
    
    const headers = {
        "Content-Type": "application/json",
        "api-key": apiKey
    };

    // Request payload
    const payload = {
        "messages": messages,
        "temperature": 0.7,
        "top_p": 0.95,
        "max_tokens": 400
    };

    try {
        const response = await axios.post(endpoint, payload, { headers });
        
        return res.status(200).json({ 
            message: response.data.choices[0].message.content
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({error: "Failed to generate interview feedback"});
    }
}

const resumeFeedback = async (req, res) => {

    const fileId = req.params["fileId"];

    //Check if the file exists
    if (!redisClient.exists(`files:${req.userId}:${fileId}`))
    {
        return res.status(404).json({ error: 'File not found' });
    }

    const [file, fileType] = await redisClient.HMGET(`files:${req.userId}:${fileId}`, ["path", "type"]);

    if (!file){
        console.log("file for feedback is not found");
        return res.sendStatus(500);
    }

    if (fileType !== "resume") return res.status(400).json({error: "Only files with 'resume' type are allowed!"});

    const contents = await filesService.parsePdf(file);

    const messages =
    [
        {
            "role": "system",
            "content":"Analyze the provided resume and give feedback on positive and negative sides of the resume." +
                        "Make sure to score the user from 0 to 10 in the following categories: -Style -Consistency -Content -General" +
                        ". Return an array of json objects that contains the following properties: 'categoryName' (one of the categories, string), 'score' (from 0 to 10, int), 'feedback' (overall feedback on the category, string), 'tips' (ways to improve in that category, array of strings)'."
            
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
        "max_tokens": 500
    };

    try {
        const response = await axios.post(endpoint, payload, { headers });

        return res.status(200).json({ message: response.data.choices[0].message.content });
    } catch (err) {
        console.error("Error in API request:", err);
        return res.status(500).json({ error: "Failed to get feedback" });
    }
}


export default {
    resumeFeedback, interviewFeedback
}