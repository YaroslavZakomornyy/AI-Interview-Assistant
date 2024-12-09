import filesController from '../controllers/files.js';
import feedbackController from '../controllers/feedback.js';
import express, { json } from 'express';

const router = express.Router();

router.post('/', filesController.upload); //Upload a file
// router.get('/meta', filesController.requestMetaAll); //Get metadata of all user's files
router.get('/:fileId', filesController.download); //Download a particular file
router.get('/:fileId/meta', filesController.requestMeta); //Get metadata of a particular file
router.get('/:fileId/feedback', feedbackController.resumeFeedback); //Get feedback. Only works on resumes
router.delete(`/:fileId`, filesController.remove); //Delete a particular file



export default router;