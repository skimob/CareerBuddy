import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILES_PATH = path.join(__dirname, '../data/profiles.json');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(PROFILES_PATH, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read profiles' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await fs.readFile(PROFILES_PATH, 'utf-8');
    const profiles = JSON.parse(data);
    const index = profiles.findIndex(p => p.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profiles[index] = { ...profiles[index], ...req.body, id: req.params.id };
    await fs.writeFile(PROFILES_PATH, JSON.stringify(profiles, null, 2));
    res.json(profiles[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
