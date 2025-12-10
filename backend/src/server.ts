import app from './app';
import { startPoller } from './services/poller';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Start the blockchain data poller only if not disabled (for serverless environments)
  if (process.env.ENABLE_BACKGROUND_POLLER !== 'false') {
    startPoller();
  } else {
    console.log('Background poller disabled (serverless mode). Use POST /api/blocks/sync to trigger updates.');
  }
});