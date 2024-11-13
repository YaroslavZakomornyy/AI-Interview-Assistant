import filesController from '../controllers/files.js';
import express, { json } from 'express';

const router = express.Router();

router.post('/v1/files', filesController.upload); //Upload a file
router.get('/v1/files/meta', filesController.requestMetaAll); //Get metadata of all user's files
router.get('/v1/files/:fileId', filesController.download); //Download a particular file
router.get('/v1/files/:fileId/meta', filesController.requestMeta); //Get metadata of a particular file
router.delete(`/v1/files/:fileId`, filesController.remove); //Delete a particular file



export default router;