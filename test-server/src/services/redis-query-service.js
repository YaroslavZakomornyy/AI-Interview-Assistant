import redisClient from '#src/redis-client.js';

const getInterviewsKey = (userId, interviewId) => {
    return `interviews:${userId}:${interviewId}`;
}

const getFilesKey = (userId, fileId) => {
    return `files:${userId}:${fileId}`;
}

/**
 * Internal function that searches for given key and fields
 * @param {string} key 
 * @param {string} fields 
 * @returns Selected fields or an error
 */
const getFields = async (key, fields) => {
    try
    {
        if (fields.length > 1)
        {
            return { response: await redisClient.HMGET(key, fields) };
        }
        else if (fields.length === 1)
        {
            return { response: await redisClient.HGET(key, fields[0]) };
        }
        else
        {
            return { response: await redisClient.HGETALL(key) };
        }
    }
    catch (error)
    {
        console.error(error);
        return { error: error };
    }
}

/**
 * Retrieves provided fields from interviews stored in REDIS
 * @param {string} userId 
 * @param {string} interviewId 
 * @param {Array} fields Fields to retrieve. If no fields passed returns all fields
 * @returns Selected fields or an error
 */
const getInterviewFields = async (userId, interviewId, fields) => {
    const {error, response} = await getFields(getInterviewsKey(userId, interviewId), fields);
    if (error) return {error: error};
    return {response: response};
}

/**
 * Retrieves provided fields from files stored in REDIS
 * @param {string} userId 
 * @param {string} fileId 
 * @param {Array} fields 
 * @returns Selected fields or an error
 */
const getFileFields = async (userId, fileId, fields) => {
    const {error, response} = await getFields(getFilesKey(userId, fileId), fields);
    if (error) return {error: error};
    return {response: response};
}

/**
 * Returns all files metadata owned by user
 * @param {string} userId 
 * @param {string} fileType optional type (resume or transcript). Will include all if null
 */
// const getAllFilesByUser = async (userId, fileType) => {
//     let cursor = 0;
//     let result = [];
//     const pattern = `files:${req.userId}:*`
//     //Get all files that are owned by the user
//     do
//     {
//         const scanRes = await redisClient.SCAN(cursor, { MATCH: pattern, COUNT: 10 });

//         if (scanRes.keys.length == 0) break;
//         cursor = scanRes.cursor;
//         const keys = scanRes.keys;

//         for (const key of keys)
//         {
//             const obj = await filesService.getMetaDataWithKey(key);
//             if (fileType !== undefined && fileType !== obj.type) continue;
//             result.push(obj);
//         }
//     } while (cursor !== 0);

//     return result;
// }

const getActiveInterview = async (userId) => {
    const MATCH_PATTERN = `interviews:${userId}:*`;
    const COUNT = 10;
    let cursor = '0';

    do
    {
        const reply = await redisClient.SCAN(cursor, {
            MATCH: MATCH_PATTERN,
            COUNT: COUNT,
        });

        // Update cursor for next iteration
        cursor = reply.cursor;

        // Extract keys from the current batch
        const keys = reply.keys;

        if (keys.length > 0)
        {
            // Since each userId can have only one or zero secretIds,
            // we can take the first matching key
            const interview = keys[0];

            // Extract the interviewId from the key
            const interviewId = interview.split(':')[2];

            return { interviewId: interviewId };

        }
    } while (cursor !== '0'); // Continue until the entire keyspace is scanned

    // If no matching hash key is found
    return null;
}

const fileExists = async (userId, fileId) => {
    return await redisClient.exists(getFilesKey(userId, fileId));
}

const deleteFile = async (userId, fileId) => {
    try{
        await redisClient.del(getFilesKey(userId, fileId));
        return;
    }
    catch (error){
        return {error: error};
    }
}

const deleteInterview = async (userId, interviewId) => {
    try{
        await redisClient.del(getInterviewsKey(userId, interviewId));
        return;
    }
    catch (error){
        return {error: error};
    }
}

export default {
    getActiveInterview, getInterviewFields, getFileFields, fileExists, deleteFile, deleteInterview
}