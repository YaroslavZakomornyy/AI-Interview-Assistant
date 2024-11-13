import express from 'express';
import cors from 'cors';
import interviewRoutes from './routes/interview-routes.js';
import feedbackRoutes from './routes/feedback-routes.js';
import fileManagementRoutes from './routes/files-routes.js';
import { dirname} from 'path';
import { fileURLToPath } from 'url';


const app = express();
const router = express.Router();
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


app.use(function(req, res, next){
    const userId = req.headers['x-user-id'] || req.query.userId;

    if (!userId) return res.sendStatus(401);

    req.userId = userId;
    next();
});


router.use(feedbackRoutes);
router.use(interviewRoutes);
router.use(fileManagementRoutes);

app.use("/api", router);

//Oops, missed route
app.get('*', (req, res) => {
    res.sendStatus(404);
});

app.listen(3000, () => console.log('Server is running on port 3000'));