import interviewController from '../controllers/interview.js';
import feedbackController from '../controllers/feedback.js';
import multer from 'multer';
import {v4 as uuidv4} from "uuid";
import path from "path";
import express, { json } from 'express';

const router = express.Router();

router.use(json());

router.post('/v1/interviews', interviewController.create);  //Creates an interview session
router.get('/v1/interviews/active', interviewController.getData);  //Retrieves user's active interview session
router.get('/v1/interviews/:interviewId', interviewController.getData); //Returns details of the interview
router.post('/v1/interviews/:interviewId/message', interviewController.sendMessage); //Send a message
router.get('/v1/interviews/:interviewId/feedback', feedbackController.interviewFeedback); //Get a feedback on the interview

router.use(json());


export default router;