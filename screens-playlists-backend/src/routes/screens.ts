import express from 'express';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';
import { Screen } from '../models/Screen.js';
import escapeStringRegexp from 'escape-string-regexp';

const router = express.Router();

// GET /screens?search=&page=&limit=
router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const search = (req.query.search as string) || '';
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));

    const filter: any = {};
    if (search) {
      // case-insensitive partial match on name using regex
      filter.name = { $regex: escapeStringRegexp(search), $options: 'i' };
    }

    const total = await Screen.countDocuments(filter);
    const items = await Screen.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ items, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// PUT /screens/:id — toggle isActive (role: EDITOR+)
router.put('/:id', requireAuth, requireRole('EDITOR'), async (req: AuthRequest, res, next) => {
  try {
    const id = req.params.id;
    const screen = await Screen.findById(id);
    if (!screen) return res.status(404).json({ message: 'Screen not found' });
    screen.isActive = !screen.isActive;
    await screen.save();
    return res.json({ _id: screen._id, name: screen.name, isActive: screen.isActive });
  } catch (err) {
    next(err);
  }
});

export default router;
