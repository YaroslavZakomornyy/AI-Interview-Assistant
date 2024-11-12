import path from "path";
import redisClient from "../redis-client.js";
import fs from "fs";

const getFileMetaData = async (userId, fileId) => {
    if (!(await redisClient.exists(`files:${userId}:${fileId}`))) return null;

    const file = await redisClient.hm
}

const requestMetaAll = async (req, res) => {
    const fileId = req.params['fileId'];

}

const requestMeta = async (req, res) => {
    const metaData = getFileMetaData(req.userId, req.params['fileId']);
    if (metaData === null) return res.status(404).json({ message: "File not found" });

    return metaData;
}

const upload = async (req, res) => {

    if (!req.file)
    {
        return res.status(400).json({ error: 'No file provided' });
    }

    //uuid will be in the file name created by multer
    const fileId = path.parse(req.file.filename).name;
    const filePath = path.normalize(`${global.appRoot}/${req.file.path}`);

    await redisClient.hSet(`files:${req.userId}:${fileId}`, {
        path: filePath,
        fileName: req.file.originalname,
        type: "resume",
        uploadedAt: new Date().toISOString()
    });

    // redisClient.push(fileId, {path: filePath, user: req.userId, 
    //   fileName: req.file.originalname, type: "resume", uploadedAt: new Date().toISOString()});

    return res.status(201).json({ fileId: fileId });
}



const remove = async (req, res) => {

    const fileId = req.params['fileId'];

    if (!redisClient.exists(`${req.userId}:${fileId}`)) return res.status(404).json({ message: "File not found" });

    fs.unlink(redisClient.hGet(`${req.userId}:${fileId}`, "path"), (err) => {
        if (err)
        {
            console.error("Error deleting the file.");
            return res.sendStatus(500);
        }
    })

    return res.sendStatus(200);
}

export default {
    upload, remove
}
