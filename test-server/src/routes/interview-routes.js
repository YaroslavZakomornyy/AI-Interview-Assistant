
import interviewController from '#controllers/interview.js';
import feedbackController from '#controllers/feedback.js';
import express, { json } from 'express';
import redisClient from "#src/redis-client.js"

const router = express.Router();

router.use(json());

router.post('/', interviewController.create);  //Creates an interview session
router.get('/active', interviewController.getActive);  //Retrieves user's active interview session

//Checks if the interviewId exists
router.param('interviewId', async (req, res, next, interviewId) => {
    
    if (!interviewId) return res.status(400).json({ error: 'interviewId is required!' });
    
    if (!(await redisClient.exists(`interviews:${req.userId}:${interviewId}`))) return res.status(404).json({ error: "Interview not found" });
    req.interviewId = interviewId;
    console.log(req.interviewId);
    next();
});

//These routes are guaranteed to receive a valid userId and InterviewId
router.get('/:interviewId', interviewController.getData); //Returns details of the interview
router.put('/:interviewId', interviewController.updateInterview); //Update the state of the interview
router.delete('/:interviewId', interviewController.deleteInterview); //Delete an interview

router.post('/:interviewId/message', interviewController.sendMessage); //Send a message
router.get('/:interviewId/feedback', feedbackController.interviewFeedback); //Get a feedback on the interview


export default router;