import dotenv from 'dotenv';

dotenv.config();

import {startApp} from './app.js';
const PORT= process.env.PORT || 4000;
startApp().then(app=>{
    app.listen(PORT, ()=>{
        console.log(`Server is running on port ${PORT}`);
});
}).catch(err=>{
    console.error('Failed to start the server:', err);
});



