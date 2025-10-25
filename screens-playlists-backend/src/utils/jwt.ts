import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import {StringValue} from 'ms';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

interface TokenPayload {
    id: string;
    email: string;
    role: string;
}

export function signUser(user: TokenPayload) {
    return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as StringValue });

}

export function verifyToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as TokenPayload;
}
