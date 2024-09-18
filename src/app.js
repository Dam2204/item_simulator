import express from 'express';
import errorHandlingMiddleware from './middlewares/error.handling.middleware.js';
import cookieParser from 'cookie-parser';
import UserRouter from './routes/users.router.js';
import GameRouter from './routes/game.router.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3018;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', [UserRouter, GameRouter]);

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
