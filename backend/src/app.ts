
// Handle BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString()
}

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import blocksRouter from './routes/blocks';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/blocks', blocksRouter);

export default app;