import dotenv from "dotenv";
import wav from "node-wav"
import fs from "fs";
import {
    SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason,
    AudioStreamFormat, AudioInputStream, CancellationDetails, CancellationReason
} from 'microsoft-cognitiveservices-speech-sdk';
import { randomUUID } from "crypto";
import redisClient from "#src/redis-client.js";
import buildParameterQuery from "#services/interview-query-builder.js";
import filesService from "#services/files-service.js";
import messageSenderService from "#services/message-sender-service.js";
import textToSpeechService from "#services/text-to-speech-service.js";
import { getTranscriptPath } from "#utils/path-builder-util.js";
import redisQueryService from "#services/redis-query-service.js";
import axios from "axios";

dotenv.config();

const apiKey = process.env.API_KEY;
const endpoint = process.env.CHAT_COMPLETION_ENDPOINT;
const speechKey = process.env.CAPSTONE_AZURE_AI_SERVICE_KEY;

if (!apiKey || !endpoint || !speechKey)
{
    throw new Error("Please set API_KEY and ENDPOINT and CAPSTONE_AZURE_AI_SERVICE_KEY in your environment variables.");
}

async function recognizeSpeechFromBuffer(buffer) {
    return new Promise((resolve, reject) => {

        const result = wav.decode(buffer);

        const sampleRate = result.sampleRate; // e.g., 16000
        const channels = result.channelData.length; // e.g., 1 for mono, 2 for stereo
        const bitsPerSample = result.bitDepth || 16; // node-wav may not always provide bitDepth

        // Create audio format matching the actual properties
        const audioFormat = AudioStreamFormat.getWaveFormatPCM(
            sampleRate,
            bitsPerSample,
            channels
        );
        const audioStream = AudioInputStream.createPushStream(audioFormat);
        audioStream.write(buffer);
        audioStream.close();

        //Set some settings
        const audioConfig = AudioConfig.fromStreamInput(audioStream);
        const speechConfig = SpeechConfig.fromSubscription(speechKey, 'eastus');
        speechConfig.speechRecognitionLanguage = 'en-US';
        const recognizer = new SpeechRecognizer(speechConfig, audioConfig);

        //Launch the recognition
        recognizer.recognizeOnceAsync(
            (result) => {
                switch (result.reason)
                {
                    case ResultReason.RecognizedSpeech: //Success
                        resolve({ response: result.text });
                        break;
                    case ResultReason.NoMatch: //No speech recognized
                        reject({ error: 'No speech recognized' });
                        break;
                    case ResultReason.Canceled: //Recognition cancelled
                        const cancellation = CancellationDetails.fromResult(result);
                        let message = `Speech recognition canceled: ${cancellation.reason}`;
                        if (cancellation.reason === CancellationReason.Error)
                        {
                            message += `: ${cancellation.errorDetails}`;
                        }
                        reject({ error: message });
                        break;
                    default: //Something went wrong
                        reject({ error: 'Speech recognition failed with an unknown reason.' });
                        break;
                }
            },
            (err) => {
                reject({ error: `Error recognizing speech: ${err}` });
            }
        );
    });
}

const speechToText = async (req, res, next) => {

    if (!req.file) return res.status(400).send({ error: 'No file uploaded' });

    const audioBuffer = req.file.buffer;

    try
    {
        //Speech-to-text
        const { response: textResult, error } = await recognizeSpeechFromBuffer(audioBuffer);
        if (error) throw new Error(error);

        return res.status(200).json({ message: textResult });
    }
    catch (err)
    {
        console.error("Error:", err);
        if (err.error == "No speech recognized")
        {
            return res.status(400).json({ error: "No speech recognized. Try again" });
        }
        return res.status(500).json({ error: "Failed to process audio" });
    }
}

//Asks the AI to convert text to speech
const textToSpeech = async (req, res, next) => {
    const message = req.body?.message;

    if (!req.body || !message)
    {
        return res.status(400).json({ error: 'Message is required' });
    }

    try
    {
        //Text-to-speech
        const audioResult = await textToSpeechService.textToSpeech(message, speechKey, 'eastus');
        const exampleAudioBuffer = Buffer.from(audioResult);

        //Set the headers
        res.set({
            'Content-Type': 'audio/wav',
            'Content-Disposition': 'inline; filename="speech.wav"',
        });

        return res.status(200).send(exampleAudioBuffer);
    }
    catch (error)
    {
        return res.status(500).json({ error: error });
    }

}


//Sends a message from the user to the AI and back
const sendMessage = async (req, res, next) => {

    const userMessage = req.body?.message;
    if (!req.body || !userMessage)
    {
        return res.status(400).json({ error: 'Message is required' });
    }

    const { response, error } = await messageSenderService.sendInterviewMessage(req.userId, req.interviewId, userMessage);
    console.log(response.data.usage);

    if (error)
    {
        console.error(error);
        return res.status(500).json({ error: "Error with OpenAI" });
    }
    else
    {
        return res.status(200).json(response?.data);
    }
}


const create = async (req, res) => {

    const userId = req.userId;
    // return res.sendStatus(200)
    const parameters = await JSON.parse(req.body.parameters || "");

    if (req.body.parameters == "" || parameters.quality === undefined || parameters.beh === undefined)
    {
        return res.status(400).json({ error: 'Some parameters are missing.' });
    }

    //Check the mode
    if (parameters.mode !== "speech" && parameters.mode !== "text")
    {
        return res.status(400).json({ error: "Interview mode can only be either 'speech' or 'text'" });
    }


    //Either get the description or set it as nothing
    let jobDescription = req.body.jobDescription || undefined;

    //Create a folder for user's transcripts if non-existent
    if (!fs.existsSync(`${global.appRoot}/data/transcripts/${req.userId}`))
    {
        fs.mkdirSync(`${global.appRoot}/data/transcripts/${req.userId}`);
    }

    // Summarize a long job description and take out the most important stuff. It's cheaper this way than sending the whole thing every message
    if (jobDescription)
    {
        const summary = messageSenderService.sendOneMessage(
            `You are an interviewer. Here is a long job description. Take out the important parts from it/summarize with important info and return it with no formatting at all for yourself: ${jobDescription}`,
            'user',
            400
        )

        //Send a message and wait for the reply
        jobDescription = summary.response.data.choices[0].message.content;
        // console.log(jobDescription);
    }

    let resumeId = req.body.resumeId || undefined;
    let resumeContent;
    if (resumeId)
    {

        const { error, response: filePath } = await redisQueryService.getFileFields(userId, resumeId, ['path']);
        if (error)
        {
            console.error("file for interview is not found");
            return res.status(404).json({ error: 'File not found' });
        }

        const contents = await filesService.parsePdf(filePath);

        resumeContent = await messageSenderService.sendOneMessage(
            `You are an interviewer, summarize the important information from the resume for yourself (no formatting required at all): ${contents}`,
            'user',
            400
        ).response.data.choices[0].message.content;
    }

    const params = buildParameterQuery({
        behavior: parameters.beh,
        workplace_quality: parameters.quality,
        interview_style: parameters.int,
        jobDescription: jobDescription,
        resumeContent: resumeContent
    });

    const message =
    {
        "role": "system",
        "content": params
    };

    //Generate a session id and push it
    const sessionId = randomUUID();

    await redisClient.HSET(`interviews:${req.userId}:${sessionId}`, {
        history: JSON.stringify([message]),
        subEvaluations: JSON.stringify([]),
        historyTokenCount: 0,
        startedAt: new Date().toISOString(),
        status: "Active",
        transcriptId: sessionId,
        resumeId: resumeId || "",
        mode: parameters.mode,
        behavior: parameters.beh,
        workplace_quality: parameters.quality,
        interview_style: parameters.int,
        jobDescriptionId: "",
    });

    //1 hour
    const INTERVIEW_TTL_SECONDS = 1 * 60 * 60;

    //Set 1 hour expiration time. It is updated on each interaction. The expiration will be cancelled if the status changes to "Finished"
    await redisClient.EXPIRE(`interviews:${req.userId}:${sessionId}`, INTERVIEW_TTL_SECONDS);

    //Create transcript file
    fs.closeSync(fs.openSync(getTranscriptPath(req.userId, sessionId), 'w'));

    await filesService.cacheFile(req.userId, sessionId,
        getTranscriptPath(req.userId, sessionId), "transcript", "transcript");

    return res.status(201).json({ sessionId: sessionId, transcriptId: sessionId });
}

const getActive = async (req, res) => {
    try
    {
        //It is guaranteed that there will be 0 or 1 active sessions in REDIS
        const activeSession = await redisQueryService.getActiveInterview(req.userId);

        return res.status(200).json(activeSession);
    }
    catch (error)
    {
        return res.status(500).json({ error: error });
    }
}

const getData = async (req, res) => {

    const { error, response } = await redisQueryService.getInterviewFields(req.userId, req.interviewId);

    if (error)
    {
        return res.status(500).json({ error: error });
    }


    return res.status(200).json(interview);
}

// Will delete an interview and its associated transcript
const deleteInterview = async (req, res) => {
    try
    {
        ({ error, response: transcriptId } = await redisQueryService.getInterviewFields(req.userId, req.interviewId, ['transcriptId']));
        if (error) throw new Error(error);
        const transcriptPath = getTranscriptPath(req.userId, transcriptId);


        //Delete the transcrip file
        if (fs.existsSync(transcriptPath))
        {
            fs.unlinkSync(transcriptPath);
        }

        //Delete the interview
        ({error} = await redisQueryService.deleteInterview(req.userId, req.interviewId));
        
        if (error) throw new Error(error);

        //Delete the transcript metadata
        ({error} = await redisQueryService.deleteFile(req.userId, req.interviewId));
        if (error) throw new Error(error);


        return res.sendStatus(204);
    }
    catch (error)
    {
        console.error(error);
        return res.status(500).json({ error: error });
    }
}

const updateInterview = async (req, res) => {
    const state = req.body.state;

    if (!state) return res.status(400).json({ error: "state is required" });
    try
    {
        switch (state)
        {
            //User has successfully finished the interview or decided to stop it
            case "Finished":
                await redisClient.HSET(`interviews:${req.userId}:${req.interviewId}`, 'state', 'Finished');
                await redisClient.PERSIST(`interviews:${req.userId}:${req.interviewId}`);
                break;

            //There should've been more states, but we got no time
            default:
                return res.status(400).json({ error: "Status must be 'Finished'" })
        }

        return res.sendStatus(204);
    }
    catch (error)
    {
        return res.send(500).json({ error: error });
    }

}

export default {
    sendMessage, create, getData, updateInterview, speechToText, textToSpeech, deleteInterview, getActive
}