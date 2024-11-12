import filesController from '../controllers/files.js';
import multer from 'multer';
import { v4 as uuidv4 } from "uuid";
import path from "path";
import express, { json } from 'express';

const router = express.Router();

//Middleware for uploading files. All files will have a unique uuid
const storage = multer.diskStorage({

    // Specify the folder to save the files
    destination: function (req, file, cb) {
        cb(null, './data/uploads');
    },
    filename: function (req, file, cb) {
        // Create a unique filename
        const uniqueFilename = uuidv4() + path.extname(file.originalname); // Combine UUID and original extension
        cb(null, uniqueFilename); // Pass the unique filename to the callback
    }
});


router.post('/v1/files', multer({ storage: storage }).single('file'), filesController.upload); //Upload a file
router.get('/v1/files/meta', multer({ storage: storage }).single('file'), filesController.upload); //Get metadata of all user's files
router.get('/v1/files/:fileId', filesController.upload); //Download a particular file
router.get('/v1/files/:fileId/meta', filesController.upload); //Get metadata of a particular file
router.delete(`/v1/files/:fileId`, filesController.remove); //Delete a particular file

export default router;