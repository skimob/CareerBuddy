import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILES_PATH = path.join(__dirname, '../data/profiles.json');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF and Word documents are supported'));
  },
});

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

router.post('/:id/resume/upload', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    let text = '';
    const { mimetype, buffer } = req.file;

    if (mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
    } else {
      // Word (.docx or legacy .doc)
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    // Normalize whitespace
    text = text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

    // Persist to profile
    const data = await fs.readFile(PROFILES_PATH, 'utf-8');
    const profiles = JSON.parse(data);
    const index = profiles.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Profile not found' });

    profiles[index].resumeText = text;
    await fs.writeFile(PROFILES_PATH, JSON.stringify(profiles, null, 2));

    res.json({ resumeText: text });
  } catch (err) {
    console.error('Resume parse error:', err);
    res.status(500).json({ error: 'Failed to parse resume file' });
  }
});

export default router;
