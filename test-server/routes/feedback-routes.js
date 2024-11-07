import feedbackController from '../controllers/feedback.js';
import express, { json } from 'express';

const router = express.Router();

router.get('/api/resumes/:fileId/feedback', feedbackController.feedback);
// router.get('/api/feedback', assistantController.feedback);


export default router;