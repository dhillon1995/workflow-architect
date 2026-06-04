import 'dotenv/config';
import express from 'express';
import { corsMiddleware } from './middleware/cors.js';
import { rateLimiter } from './middleware/rate-limit.js';
import { generateRouter } from './routes/generate.js';
import { debugRouter } from './routes/debug.js';
import { healthRouter } from './routes/health.js';

const app = express();
const PORT = Number(process.env['PORT'] ?? 3001);

app.set('trust proxy', 1);
app.use(corsMiddleware);
app.use(express.json({ limit: '2mb' }));

app.use('/api/health', healthRouter);
app.use('/api/generate', rateLimiter, generateRouter);
app.use('/api/debug', rateLimiter, debugRouter);

app.use(
  (_req: express.Request, res: express.Response) => {
    res.status(404).json({ error: 'Not found' });
  },
);

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  },
);

app.listen(PORT, () => {
  console.log(`Workflow Architect API running on port ${PORT}`);
});
