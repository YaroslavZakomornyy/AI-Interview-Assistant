import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";
import redisClient from "../redis-client.js";
import { randomUUID } from "crypto";
import pdfParse from "pdf-parse";

dotenv.config();

const vectorStoreId = process.env.VECTOR_STORE_ID;
const endpoint = process.env.ASSISTANT_ENDPOINT;
const apiKey = process.env.API_KEY;
const openAiVersion = process.env.AI_VERSION;
const assistantId = process.env.ASSISTANT_ID;


if (!apiKey || !endpoint || !openAiVersion || !assistantId || !vectorStoreId) {
  throw new Error("Please set API_KEY, ENDPOINT, AI_VERSION and ASSISTANT_ID in your environment variables.");
}

const parse = async (path) => {
  let dataBuffer = fs.readFileSync(path);
  
  try{
    const data = await pdfParse(dataBuffer);
    console.log(data.text);
    return data.text;
  }
  catch(err){
    console.error(err);
    return "";
  }
}

const uploadResume = async (req, res) => {

    console.log(req.file);

    const userId = req.headers['x-user-id'];
    if (!userId)
    {
        return res.status(400).json({ error: 'User ID is required' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
    }

    //uuid will be in the file name created by multer
    const fileId = path.parse(req.file.filename).name;

    redisClient.push(fileId, {file: req.file, path: req.file.path, user: userId, 
      fileName: req.file.originalname, type: "resume", uploadedAt: new Date().toISOString()});

    return res.status(201).json({ fileId: fileId });
}

const feedback = async (req, res) => {

  const userId = req.headers['x-user-id'];
  if (!userId)
  {
      return res.status(400).json({ error: 'User ID is required' });
  }

  const fileId = req.params.fileId;

  //Check if it exists
  if (!redisClient.contains(fileId)){
    return res.status(404).json({error: 'File not found'});
  }

  const file = redisClient.get(fileId)[0];
  const contents = await parse(file.path);

  return res.status(200).json({message: contents});
}


export default {
  uploadResume, feedback
}
