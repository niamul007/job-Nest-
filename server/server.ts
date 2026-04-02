import app from './src/app';
import { env } from './src/config/env';
import './src/config/db';
import './src/config/redis';

app.listen(env.port, () => {
  console.log(`🚀 Server is running on port ${env.port}`);
});