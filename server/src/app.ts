import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
import companyRoutes from './routes/company.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import { rateLimiter } from './middlewares/rateLimit.middleware';
import userRoutes from './routes/user.routes'





const app = express();

// CORS must be first — ensures Access-Control-Allow-Origin is present on every
// response, including 429s from the rate limiter and OPTIONS preflight requests.
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://job-nest-7yitxf5sf-niamul-s-projects.vercel.app',
    /\.vercel\.app$/  // allows all vercel preview deployments
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(rateLimiter);

// Swagger UI — mounted before helmet so CSP headers don't block its inline scripts
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json()); // ← must be before routes

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;