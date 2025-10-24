import express from 'express';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth.js';
import { Playlist } from '../models/Playlist.js';
import { z } from 'zod';
import escapeStringRegexp from 'escape-string-regexp';

const router = express.Router();

const PlaylistCreateSchema = z.object({
  name: z.string().min(1),
  itemUrls: z.array(z.string().url()).max(10).optional()
});

// GET /playlists?search=&page=&limit=
router.get('/', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const search = (req.query.search as string) || '';
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));

    const filter: any = {};
    if (search) {
      filter.name = { $regex: escapeStringRegexp(search), $options: 'i' };
    }

    const total = await Playlist.countDocuments(filter);
    const items = await Playlist.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    // Map to required shape: { _id, name, itemCount }
    const responseItems = items.map(it => ({ _id: it._id, name: it.name, itemCount: (it.itemURLs || []).length }));
    return res.json({ items: responseItems, total, page, limit });
  } catch (err) {
    next(err);
  }
});

// POST /playlists body: { name: string; itemUrls?: string[] } // optional, ≤ 10, each must be a valid URL
router.post('/', requireAuth, requireRole('EDITOR'), async (req: AuthRequest, res, next) => {
  try {
    const parsed = PlaylistCreateSchema.parse(req.body);
    const playlist = await Playlist.create({
      name: parsed.name,
      itemUrls: parsed.itemUrls || []
    });
    return res.status(201).json({ _id: playlist._id, name: playlist.name, itemCount: (playlist.itemURLs || []).length });
  } catch (err) {
    next(err);
  }
});

export default router;
