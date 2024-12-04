import interviewController from '../controllers/interview.js';
import multer from 'multer';
import express, { json } from 'express';


const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/v1/speechToText', upload.single('audio'), interviewController.speechToText);

router.use(json());
router.post('/v1/textToSpeech', interviewController.textToSpeech);

export default router;