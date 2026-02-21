import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jobsRouter from './routes/jobs.js';
import profilesRouter from './routes/profiles.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/jobs', jobsRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/ai', aiRouter);

// Serve built client in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`CareerBuddy server running on http://localhost:${PORT}`);
});
