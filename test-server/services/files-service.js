import redisClient from "../redis-client.js";
import path from "path";
//TODO: Add cached file option. Not all files will be needed for a fast retrieval
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
        await redisClient.hSet(`files:${userId}:${id}`, {
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

    //Not retrieving the fileId since it is already passed
    const metaData = await redisClient.HMGET(`files:${userId}:${fileId}`, ["fileName", "type", "uploadedAt"]);
    
    //Map the array to the object
    const structData = {
        fileName: metaData[0],
        fileId: fileId,
        type: metaData[1],
        uploadedAt: metaData[2]
    }

    return structData;
}

const getMetaDataWithKey = async (key) => {
    const metaData = await redisClient.HMGET(key, ["fileName", "fileId", "type", "uploadedAt"]);
    
    //Map the array to the object
    const structData = {
        fileName: metaData[0],
        type: metaData[1],
        fileId: metaData[2],
        uploadedAt: metaData[3]
    }

    return structData;
}

export default {
    cacheFile, getMetaData, getMetaDataWithKey
}