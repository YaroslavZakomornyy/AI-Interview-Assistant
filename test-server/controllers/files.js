import path from "path";
import redisClient from "../redis-client.js";
import { randomUUID } from "crypto";
import fs from "fs";


const upload = async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
    }

    //uuid will be in the file name created by multer
    const fileId = path.parse(req.file.filename).name;

    redisClient.push(fileId, {path: req.file.path, user: req.userId, 
      fileName: req.file.originalname, type: "resume", uploadedAt: new Date().toISOString()});

    return res.status(201).json({ fileId: fileId });
}

const remove = async (req, res) => {

    const fileId = req.params['fileId'];

    if (!redisClient.contains(fileId)) return res.status(404).json({message: "File not found"});

    fs.unlink(redisClient.get(fileId).path, (err) => {
      if (err){
        console.error("Error deleting the file.");
        return res.sendStatus(500);
      }
    })

    return res.sendStatus(200);
}

export default {
  upload, remove
}
