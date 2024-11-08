import path from "path";
import redisClient from "../redis-client.js";
import { randomUUID } from "crypto";


const uploadResume = async (req, res) => {

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

export default {
  uploadResume
}
