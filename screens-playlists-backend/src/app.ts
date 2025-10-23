import express from 'express';
import mangoose from 'mongoose';
import cors from 'cors';


export async function startApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    // app.use('/auth', authRouter);
    // app.use('/screens', screenRouter);
    // app.use('/playlists', playlistRouter);

    // app.use(errorHandler);

    const MONGO_URL= process.env.MONGO_URL || 'mongodb://localhost:27017/screens-playlists-db';
    await mangoose.connect(MONGO_URL);
    
    console.log('Connected to MongoDB');

    return app;


}