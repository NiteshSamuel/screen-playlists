import {Request, Response, NextFunction} from 'express';
import {verifyToken} from '../utils/jwt.js';

export interface AuthRequest extends Request{
    user?:{id:string, email:string, role:string};
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction){
    const authHeader= req.headers.authorization;
    if(!authHeader) return res.status(401).json({message: 'Authorization header missing'});

    const parts=authHeader.split(' ');
    if(parts.length !==2 || parts[0] !=='Bearer'){
        return res.status(401).json({message:'Invalid authorization header format'});
    }

    const token= parts[1];
    if(!token) return res.status(401).json({message: 'Token missing'});
    try{
        const payload=verifyToken(token);
        req.user={
            id: payload.id,
            email: payload.email,
            role: payload.role
        };
        next();
    }catch(err){
        return res.status(401).json({message:'Invalid or expired token'});  
        }
    }

    export function requireRole(minRole:'ADMIN' | 'EDITOR'){
        const hierarchy: Record<string, number>={
            'VIEWER':1,
            'EDITOR':2,
            'ADMIN':3
        };
        return (req: AuthRequest, res: Response, next: NextFunction)=>{
            if(!req.user){
                return res.status(401).json({message:'Unauthorized'});
            }
            const current=hierarchy[req.user.role] ?? 0;

            const needed= hierarchy[minRole] ?? Infinity;
            if(current >= needed) return next();

            return res.status(403).json({message:'Forbidden: Insufficient role'});
        };
    }