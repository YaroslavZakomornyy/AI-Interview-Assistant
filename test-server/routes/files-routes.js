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
        const uniqueFilename = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueFilename); // Pass the unique filename to the callback
    }
});


// File filter function to allow only .pdf files
const fileFilter = (req, file, cb) => {
    // Check the file extension and mime type
    if (path.extname(file.originalname).toLowerCase() === '.pdf' && file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only .pdf files are allowed'), false); // Reject the file
    }
};


router.post('/v1/files', multer({ storage: storage, fileFilter: fileFilter }).single('file'), filesController.upload); //Upload a file
router.get('/v1/files/meta', filesController.requestMetaAll); //Get metadata of all user's files
router.get('/v1/files/:fileId', filesController.download); //Download a particular file
router.get('/v1/files/:fileId/meta', filesController.requestMeta); //Get metadata of a particular file
router.delete(`/v1/files/:fileId`, filesController.remove); //Delete a particular file



export default router;