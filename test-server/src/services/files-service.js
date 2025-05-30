import redisClient from "../redis-client.js";
import path from "path";
import pdfParse from "pdf-parse";
import fs from "fs";
import redisQueryService from "./redis-query-service.js";

//TODO: Add persistent file option. Not all files will be needed for a fast retrieval
/**
 * Saves file metadata to the REDIS
 * @param {string} userId - user id.
 * @param {string} id - file id. File will be identified by "userId:id".
 * @param {string} filePath - where the file is located.
 * @param {string} name - file name.
 * @param {string} type - file type. Can be: resume | transcript
 */
const cacheFile = async (userId, id, filePath, name, type) => {
    if (type !== "resume" && type !== "transcript") {
        throw new Error("File type must be 'resume' or 'transcript'");
    };
    try{
        await redisClient.HSET(`files:${userId}:${id}`, {
            path: path.normalize(filePath),
            fileName: name,
            fileId: id,
            type: type,
            uploadedAt: new Date().toISOString()
        });
    }
    catch(err){
        throw new Error(err);
    }
    
}

const getMetaData = async (userId, fileId) => {

    //Not retrieving the fileId since it is already passed as an argument
    const metaData = await redisQueryService.getFileFields(userId, fileId, ["fileName", "type", "uploadedAt"]);
    
    //Map the array to the object
    const structData = {
        fileName: metaData[0],
        fileId: fileId,
        type: metaData[1],
        uploadedAt: metaData[2]
    }

    return structData;
}

const parsePdf = async (path) => {
    try
    {
        let dataBuffer = fs.readFileSync(path);
        const data = await pdfParse(dataBuffer);
        return data.text;
    }
    catch (err)
    {
        console.error(err);
        return "";
    }
}

const readAll = async (path) => {
    try {
        const data = fs.readFileSync(path, 'utf8');
        return data;
    } catch (err) {
        console.error('Error reading file:', err);
        return "";
    }
}


export default {
    cacheFile, getMetaData, parsePdf, readAll
}