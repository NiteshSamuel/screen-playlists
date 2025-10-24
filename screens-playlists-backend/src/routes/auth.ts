import express from 'express';
import {z} from 'zod';
import {User} from '../models/User.js';
import bcrypt from 'bcrypt';
import {signUser} from '../utils/jwt.js';

const router= express.Router();

const LoginSchema= z.object({
    email: z.string().email(),
    password: z.string().min(3)
});

router.post('/login', async(req, res)=>{
    try{
        const parsed= LoginSchema.parse(req.body);
        const user = await User.findOne({email:parsed.email}).lean();
        if(!user){
            return res.status(401).json({message:'Invalid email or password'});
        }
        const ok = await bcrypt.compare(parsed.password, user.password);
        if(!ok){
            return res.status(401).json({message:'Invalid email or password'});
        }

        const token= signUser({
            id: user._id.toString(),
            email: user.email,
            role: user.role
        });

        return res.json({token, user:{email: user.email, role: user.role} });




    }catch(err : any){     
        return res.status(400).json({message:'Invalid request', error: err.message});
    }
});

export default router;
