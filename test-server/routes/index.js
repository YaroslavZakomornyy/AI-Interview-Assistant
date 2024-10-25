import chatCompletionController from '../controllers/chat-completion.js';
import express from 'express';

const router = express.Router();

router.post('/api/chat/message', chatCompletionController.sendMessage);
router.post('/api/chat/parameters', chatCompletionController.setParameters);

export default router;
    




