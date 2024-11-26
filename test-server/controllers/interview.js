import dotenv from "dotenv";
import axios from "axios";
import redisClient from "../redis-client.js";
import buildParameterQuery from "../services/interview-query-builder.js";
import { randomUUID } from "crypto";
import filesService from "../services/files-service.js";
import fs from "fs";
import wav from "node-wav"
// import SpeechRecognizerService from "../services/speech-recognizer-service.js";
import { SpeechConfig, AudioConfig, SpeechRecognizer, ResultReason, AudioStreamFormat, AudioInputStream, CancellationDetails, CancellationReason } from 'microsoft-cognitiveservices-speech-sdk';

dotenv.config();

const apiKey = process.env.API_KEY;
const endpoint = process.env.CHAT_COMPLETION_ENDPOINT;
const speechKey = process.env.CAPSTONE_AZURE_AI_SERVICE_KEY;
const speechEndpoint = process.env.CAPSTONE_AZURE_AI_SERVICE_ENDPOINT;
// const recognizer = new SpeechRecognizerService(speechKey, 'eastus');

if (!apiKey || !endpoint || !speechKey)
{
    throw new Error("Please set API_KEY and ENDPOINT and CAPSTONE_AZURE_AI_SERVICE_KEY in your environment variables.");
}

const appendNewMessage = (messageHistory, newMessage, role) => {
    messageHistory.push(
        {
            "role": role,
            "content": newMessage
        }
    );
}

async function recognizeSpeechFromBuffer(buffer) {
    return new Promise((resolve, reject) => {
        
        const result = wav.decode(buffer);

        const sampleRate = result.sampleRate; // e.g., 16000
      const channels = result.channelData.length; // e.g., 1 for mono, 2 for stereo
      const bitsPerSample = result.bitDepth || 16; // node-wav may not always provide bitDepth

        console.log('Sample Rate:', sampleRate);
        console.log('Channels:', channels);
        console.log('Bits per Sample:', bitsPerSample);

        // Create audio format matching the actual properties
        const audioFormat = AudioStreamFormat.getWaveFormatPCM(
          sampleRate,
          bitsPerSample,
          channels
        );
        const audioStream = AudioInputStream.createPushStream(audioFormat);
        audioStream.write(buffer);
        audioStream.close();

        const audioConfig = AudioConfig.fromStreamInput(audioStream);
        const speechConfig = SpeechConfig.fromSubscription(speechKey, 'eastus');
        speechConfig.speechRecognitionLanguage = 'en-US';
        const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
        // console.log(audioConfig, speechConfig, recognizer);

        recognizer.recognizeOnceAsync(
            (result) => {
                switch (result.reason) {
                  case ResultReason.RecognizedSpeech:
                    resolve(result.text);
                    break;
                  case ResultReason.NoMatch:
                    reject('No speech could be recognized.');
                    break;
                  case ResultReason.Canceled:
                    const cancellation = CancellationDetails.fromResult(result);
                    let message = `Speech recognition canceled: ${cancellation.reason}`;
                    if (cancellation.reason === CancellationReason.Error) {
                      message += `: ${cancellation.errorDetails}`;
                    }
                    reject(message);
                    break;
                  default:
                    reject('Speech recognition failed with an unknown reason.');
                    break;
                }
              },
              (err) => {
                reject(`Error recognizing speech: ${err}`);
              }
            );
    });
}

const sendVoice = async (req, res, next) => {
    // return res.status(500).send({error: "Failed to process audio"});

    if (!req.file)
    {
        return res.status(400).send({ error: 'No file uploaded' });
    }

    const audioBuffer = req.file.buffer;

    try
    {
        console.log("sending voice");
        const textResult = await recognizeSpeechFromBuffer(audioBuffer);

        return res.status(200).send(textResult);
    }
    catch (err)
    {
        console.error(err);
        return res.status(500).send({ error: "Failed to process audio" });
    }
}


//Sends a message from the user to the AI and back
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
    if (req.body.parameters == "" || parameters.quality === undefined || parameters.beh === undefined || parameters.mode === undefined)
    {
        return res.status(400).json({ error: 'Some parameters are missing.' });
    }

    //Either get the description or set it as nothing
    const jobDescription = req.body.jobDescription || undefined;

    //Create a folder for user's transcripts if non-existent
    if (!fs.existsSync(`${global.appRoot}/data/transcripts/${req.userId}`))
    {
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
        mode: parameters.mode,
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

    return res.status(201).json({ sessionId: sessionId, transcriptId: sessionId });
}

const getData = async (req, res) => {

    const interview = await redisClient.HGETALL(`interviews:${req.userId}:${req.interviewId}`);
    // const history = fs.readFileSync();

    return res.status(200).json(interview);
}

const updateInterview = async (req, res) => {
    const state = req.body.state;

    if (!state) return res.status(400).json({ error: "state is required" });

    switch (state)
    {
        case "Concluded":

    }

}

export default {
    sendMessage, create, getData, updateInterview, sendVoice
}