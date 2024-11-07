import express from 'express';
import axios from 'axios';
import cors from 'cors';
import chatRoutes from './routes/chat-routes.js';
import feedbackRoutes from './routes/feedback-routes.js';
import fileManagementRoutes from './routes/files-management-routes.js';


const app = express();
app.use(cors());

//Log the incoming request
app.use(function(req, res, next){
    console.log(req.originalUrl);
    next();
});

//This is a very specific order. json() middleware interferes with multer,
//so we have to use these routes earlier than json()
app.use(feedbackRoutes);
app.use(chatRoutes);
app.use(fileManagementRoutes);

//Oops, missed route
app.get('*', (req, res) => {
    res.sendStatus(404);
});

app.listen(3000, () => console.log('Server is running on port 3000'));