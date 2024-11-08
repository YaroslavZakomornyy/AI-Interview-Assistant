import express from 'express';
import cors from 'cors';
import interviewRoutes from './routes/interview-routes.js';
import feedbackRoutes from './routes/feedback-routes.js';
import fileManagementRoutes from './routes/files-management-routes.js';
import { dirname} from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());

//Getting the root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(__dirname);
global.appRoot = __dirname;

//Log the incoming request
app.use(function(req, res, next){
    console.log(req.originalUrl);
    next();
});

//This is a very specific order. json() middleware interferes with multer,
//so we have to use these routes earlier than json()
app.use(feedbackRoutes);
app.use(interviewRoutes);
app.use(fileManagementRoutes);

//Oops, missed route
app.get('*', (req, res) => {
    res.sendStatus(404);
});

app.listen(3000, () => console.log('Server is running on port 3000'));