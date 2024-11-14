import path from "path";
import redisClient from "../redis-client.js";
import filesService from "../services/files-service.js";
import fs from "fs";
import multerService from "../services/multer-service.js";


const requestMetaAll = async (req, res) => {
    const fileType = req.query.type;
    const pattern = `files:${req.userId}:*`
    let cursor = 0;
    let result = [];

    do
    {
        const scanRes = await redisClient.SCAN(cursor, { MATCH: pattern, COUNT: 10 });
        
        if (scanRes.keys.length == 0) break;
        cursor = scanRes.cursor;
        const keys = scanRes.keys;

        for (const key of keys)
        {
            const obj = await filesService.getMetaDataWithKey(key);
            if (fileType !== undefined && fileType !== obj.type) continue;
            result.push(obj);
        }
    } while (cursor !== 0);

    return res.status(200).json(result);
}

const requestMeta = async (req, res) => {

    const fileId = req.params['fileId'];

    //Check if the file exists
    if (!(await redisClient.exists(`files:${req.userId}:${fileId}`))) return res.status(404).json({ message: "File not found" });


    return res.status(200).json(await filesService.getMetaData(req.userId, fileId));
}


const upload = async (req, res) => {

    await multerService.uploadHandler(req, res, async (err) => {
        if (err)
        {
            if (err.code === "LIMIT_FILE_SIZE")
            {
                return res.status(400).json({ error: "File size exceeds the limit of 1MB." });
            }

            return res.status(400).json({ error: err.message });
        }

        if (!req.file)
        {
            return res.status(400).json({ error: 'No file provided' });
        }

        //uuid will be in the file name created by multer
        const fullFileName = path.parse(req.file.filename);
        const fileId = fullFileName.name;
        const filePath = `${global.appRoot}/data/uploads/${fileId}${fullFileName.ext}`;
        await filesService.cacheFile(req.userId, fileId, filePath, req.file.originalname, "resume");


        return res.status(201).json({ fileId: fileId });
    });


}

const download = async (req, res) => {
    const fileId = req.params['fileId'];

    if (!(await redisClient.exists(`files:${req.userId}:${fileId}`))) return res.status(404).json({ error: "File not found" });

    const filePath = await redisClient.hGet(`files:${req.userId}:${fileId}`, "path");

    try {
        return res.status(200).sendFile(filePath);
    } catch (sendErr) {
        console.error("Error sending file:", sendErr);
        return res.status(500).json({ error: "Failed to send file" });
    }
}

const remove = async (req, res) => {

    const fileId = req.params['fileId'];

    if (!await redisClient.exists(`files:${req.userId}:${fileId}`)) return res.status(404).json({ message: "File not found" });

    fs.unlink(await redisClient.hGet(`files:${req.userId}:${fileId}`, "path"), async (err) => {
        if (err) {
            console.error("Error deleting the file:", err);
            return res.sendStatus(500);
        } else {
            try {
                await redisClient.del(`files:${req.userId}:${fileId}`);
                return res.sendStatus(200);
            } catch (redisErr) {
                console.error("Error deleting file metadata in Redis:", redisErr);
                return res.sendStatus(500);
            }
        }
    });
}

export default {
    upload, remove, requestMeta, requestMetaAll, download
}
