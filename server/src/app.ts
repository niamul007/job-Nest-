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
import userRoutes from './routes/user.routes';

const app = express();

/**
 * CORS must be first — ensures Access-Control-Allow-Origin is present on every
 * response, including 429s from the rate limiter and OPTIONS preflight requests.
 * Allows requests from local dev, production, and all Vercel preview deployments.
 */
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://job-nest-7yitxf5sf-niamul-s-projects.vercel.app',
    /\.vercel\.app$/ // allows all Vercel preview deployments
  ],
  credentials: true,        // allows cookies and Authorization headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Block abusive/excessive requests early, before any heavy processing
app.use(rateLimiter);

/**
 * Swagger UI — mounted before helmet so helmet's CSP headers don't block
 * Swagger's inline scripts. Visit /api/docs to explore and test all endpoints.
 */
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true,
  }
}));
/**
 * Helmet sets security-related HTTP response headers automatically.
 * Protects against common attacks: clickjacking, XSS, MIME sniffing, etc.
 * Mounted after Swagger to avoid CSP conflicts with Swagger's inline scripts.
 */
app.use(helmet());

// Logs every incoming HTTP request to the terminal (method, route, status, time)
app.use(morgan('dev'));

/**
 * Parses incoming request bodies from raw bytes into req.body (JavaScript object).
 * Must come before routes — without this, req.body would be undefined in all routes.
 */
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint — used by Railway and monitoring tools to verify the server is alive
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler — must be last, catches any error thrown by routes or middleware
app.use(errorHandler);

export default app;