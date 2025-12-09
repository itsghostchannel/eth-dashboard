import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/blocks', async (req, res) => {
  try {
    res.json({ blocks: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocks' });
  }
});

app.get('/api/blocks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ block: null });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch block' });
  }
});

export default app;