import feedbackController from '../controllers/feedback.js';
import express, { json } from 'express';

const router = express.Router();

router.get('/v1/feedback/resumes/:fileId', feedbackController.feedback);
// router.get('/api/feedback', assistantController.feedback);


export default router;