import filesController from '../controllers/files.js';
import multer from 'multer';
import {v4 as uuidv4} from "uuid";
import path from "path";
import express, { json } from 'express';

const router = express.Router();

//Middleware for uploading files. All files will have a unique uuid
const storage = multer.diskStorage({

    // Specify the folder to save the files
    destination: function (req, file, cb) {
        cb(null, './uploads'); 
    },
    filename: function (req, file, cb) {
        // Create a unique filename
        const uniqueFilename = uuidv4() + path.extname(file.originalname); // Combine UUID and original extension
        cb(null, uniqueFilename); // Pass the unique filename to the callback
    }
});

//Require user ID
router.post('/api/files', multer({ storage: storage }).single('file'), filesController.upload);
router.delete(`/api/files/:fileId`, filesController.remove);
// router.post('/api/files/job-descriptions', assistantController.uploadDescription);

export default router;