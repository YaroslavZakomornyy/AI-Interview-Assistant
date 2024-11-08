import interviewController from '../controllers/interview.js';
import multer from 'multer';
import {v4 as uuidv4} from "uuid";
import path from "path";
import express, { json } from 'express';

const router = express.Router();

router.use(json());

router.post('/api/interviews', interviewController.create);  //Creates an interview session
router.get('/api/interviews/:interviewId', interviewController.transcript); //Returns current transcript of the interview
router.post('/api/interviews/:interviewId/message', interviewController.sendMessage);
// router.get('/api/interviews/:interviewId/details', interviewController.details); //Returns parameters of the interview

router.use(json());


export default router;