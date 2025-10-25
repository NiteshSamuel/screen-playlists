/**
 * Usage:
 *  - copy .env.example to .env and customize MONGO_URI if needed
 *  - run: npm run seed
 *
 * Seeded users:
 *  - admin@example.com / admin123  (ADMIN)
 *  - editor@example.com / editor123 (EDITOR)
 *
 * The script will print credentials
 */
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import {User} from './models/User';
import { Screen } from './models/Screen';
import { Playlist } from './models/Playlist';

async function main() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/screens_playlists';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo for seeding');



  // Clean optional: remove existing sample docs
  // WARNING: don't drop users in production
  await Screen.deleteMany({});
  await Playlist.deleteMany({});
  // Create or update users
  const createUser = async (email: string, password: string, role: string) => {
    const hashed = await bcrypt.hash(password, 10);
    const existing = await User.findOne({ email });
    if (existing) {
      existing.password = hashed;
      existing.role = role as any;
      await existing.save();
      return existing;
    } else {
      return await User.create({ email, password: hashed, role });
    }
  };

  const admin = await createUser('admin@example.com', 'admin123', 'ADMIN');
  const editor = await createUser('editor@example.com', 'editor123', 'EDITOR');

  console.log('Seeded users:');
  console.log('  ADMIN -> admin@example.com / admin123');
  console.log('  EDITOR -> editor@example.com / editor123');

  // Create sample screens
  const screensData = [
    { name: 'Lobby Display', isActive: true },
    { name: 'Conference Room 1', isActive: true },
    { name: 'Cafeteria Screen', isActive: false },
    { name: 'Reception Showcase', isActive: true },
    { name: 'Hallway Kiosk', isActive: true }
  ];
  await Screen.insertMany(screensData);
  console.log('Inserted sample screens');

  // Create sample playlists
  const playlistsData = [
    { name: 'Morning Loop', itemUrls: ['https://example.com/video1.mp4', 'https://example.com/image1.png'] },
    { name: 'Promo Ads', itemUrls: ['https://example.com/ad1.mp4'] },
    { name: 'Event Highlights', itemUrls: [] }
  ];
  await Playlist.insertMany(playlistsData);
  console.log('Inserted sample playlists');

  await mongoose.disconnect();
  console.log('Seeding completed and DB disconnected.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
