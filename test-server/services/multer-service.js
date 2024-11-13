import multer from 'multer';
import { v4 as uuidv4 } from "uuid";
import path from "path";

//Set a unique uuid to all uploaded files
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
    if (path.extname(file.originalname).toLowerCase() === '.pdf' && file.mimetype === 'application/pdf')
    {
        cb(null, true);
    } else
    {
        cb(new Error('Only .pdf files are allowed'), false); // Reject the file
    }
};
const uploadHandler = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 1048576 } }).single('file');

export default {
    uploadHandler
}