import express from 'express';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { signUser } from '../utils/jwt';

const router = express.Router();

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation error', errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email }).lean();
      console.log('User from DB:', user);
      if (!user) return res.status(401).json({ message: 'Invalid credentials from bd'+req.body });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      const token = signUser({ id: user._id.toString(), email: user.email, role: user.role });
      return res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
