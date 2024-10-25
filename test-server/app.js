import express, { json } from 'express';
import axios from 'axios';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
app.use(json());
app.use(cors());
app.use(routes);


app.listen(3000, () => console.log('Server is running on port 3000'));