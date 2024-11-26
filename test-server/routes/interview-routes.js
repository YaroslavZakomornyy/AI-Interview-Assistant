import interviewController from '../controllers/interview.js';
import feedbackController from '../controllers/feedback.js';
import multer from 'multer';
import { v4 as uuidv4 } from "uuid";
import path from "path";
import express, { json } from 'express';
import redisClient from "../redis-client.js"

const router = express.Router();

router.use(json());

router.post('/v1/interviews', interviewController.create);  //Creates an interview session
router.get('/v1/interviews/active', interviewController.getData);  //Retrieves user's active interview session

//Checks if the interviewId exists
router.param('interviewId', async (req, res, next, interviewId) => {

    if (!interviewId) return res.status(400).json({ error: 'interviewId is required!' });

    if (!(await redisClient.exists(`interviews:${req.userId}:${interviewId}`))) return res.status(404).json({ error: "Interview not found" });
    req.interviewId = interviewId;
    next();
});

//These routes are guaranteed to receive the userId and InterviewId
router.get('/v1/interviews/:interviewId', interviewController.getData); //Returns details of the interview
router.put('/v1/interviews/:interviewId', interviewController.updateInterview); //Get a feedback on the interview

router.post('/v1/interviews/:interviewId/message', interviewController.sendMessage); //Send a message
router.get('/v1/interviews/:interviewId/feedback', feedbackController.interviewFeedback); //Get a feedback on the interview


// Multer instance

// const storage = multer.diskStorage({

//     // Specify the folder to save the files
//     destination: function (req, file, cb) {
//         cb(null, './data/uploads');
//     },
//     filename: function (req, file, cb) {
//         // Create a unique filename
//         const uniqueFilename = uuidv4() + path.extname(file.originalname);
//         cb(null, uniqueFilename); // Pass the unique filename to the callback
//     }
// });

// const upload = multer({ storage: multer.memoryStorage() });
const upload = multer({ storage: multer.memoryStorage() });

router.post('/v1/interviews/:interviewId/voice', upload.single('audio'), interviewController.sendVoice); //Send a audio message

export default router;