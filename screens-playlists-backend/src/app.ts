import express from 'express';
import mangoose from 'mongoose';
import cors from 'cors';
import authRouter from './routes/auth';
import screenRouter from './routes/screens';
import playlistRouter from './routes/playlists';
import {errorHandler} from './utils/errors';


export async function startApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    app.use('/auth', authRouter);
    app.use('/screens', screenRouter);
    app.use('/playlists', playlistRouter);

    app.use(errorHandler);

    const MONGO_URL= process.env.MONGO_URL ||'mongodb://localhost:27017/screens_playlists';
    await mangoose.connect(MONGO_URL);
    
    console.log('Connected to MongoDB');

    return app;


}