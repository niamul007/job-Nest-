import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JobNest API',
      version: '1.0.0',
      description:
        'REST API for the JobNest job platform. ' +
        'Click **Authorize** and paste the JWT token from `POST /api/auth/login` to test protected endpoints.',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Development server' },
    ],
    tags: [
      { name: 'Auth',         description: 'Register and login' },
      { name: 'Jobs',         description: 'Job listing management' },
      { name: 'Companies',    description: 'Company profile management' },
      { name: 'Applications', description: 'Job application management' },
      { name: 'Users',        description: 'User management (admin only)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste the JWT token returned by POST /api/auth/login',
        },
      },
      schemas: {
        // ── Enums ───────────────────────────────────────
        UserRole: {
          type: 'string',
          enum: ['admin', 'employer', 'applicant'],
          example: 'applicant',
        },
        JobType: {
          type: 'string',
          enum: ['full-time', 'part-time', 'contract', 'freelance'],
          example: 'full-time',
        },
        JobStatus: {
          type: 'string',
          enum: ['draft', 'pending', 'active', 'closed'],
          example: 'active',
        },
        ApplicationStatus: {
          type: 'string',
          enum: ['pending', 'reviewed', 'accepted', 'rejected'],
          example: 'pending',
        },

        // ── Auth ────────────────────────────────────────
        RegisterInput: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name:     { type: 'string', example: 'Jane Smith' },
            email:    { type: 'string', format: 'email', example: 'jane@example.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
            role:     { $ref: '#/components/schemas/UserRole' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'jane@example.com' },
            password: { type: 'string', example: 'secret123' },
          },
        },
        AuthData: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: { $ref: '#/components/schemas/UserResponse' },
          },
        },

        // ── User ────────────────────────────────────────
        UserResponse: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            name:       { type: 'string', example: 'Jane Smith' },
            email:      { type: 'string', format: 'email', example: 'jane@example.com' },
            role:       { $ref: '#/components/schemas/UserRole' },
            created_at: { type: 'string', format: 'date-time' },
          },
        },

        // ── Company ─────────────────────────────────────
        CreateCompanyInput: {
          type: 'object',
          required: ['name', 'description'],
          properties: {
            name:        { type: 'string', example: 'Acme Corp' },
            description: { type: 'string', example: 'A leading technology company' },
            website:     { type: 'string', format: 'uri', example: 'https://acme.com' },
            logo_url:    { type: 'string', format: 'uri', example: 'https://acme.com/logo.png' },
          },
        },
        CompanyResponse: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            name:        { type: 'string', example: 'Acme Corp' },
            description: { type: 'string' },
            website:     { type: 'string' },
            logo_url:    { type: 'string' },
            owner_id:    { type: 'string', format: 'uuid' },
            created_at:  { type: 'string', format: 'date-time' },
          },
        },

        // ── Job ─────────────────────────────────────────
        CreateJobInput: {
          type: 'object',
          required: ['company_id', 'title', 'description', 'location', 'type', 'category'],
          properties: {
            company_id:  { type: 'string', format: 'uuid' },
            title:       { type: 'string', example: 'Senior Frontend Engineer' },
            description: { type: 'string', example: 'We are looking for a skilled engineer...' },
            location:    { type: 'string', example: 'Remote' },
            type:        { $ref: '#/components/schemas/JobType' },
            category:    { type: 'string', example: 'Engineering' },
            salary_min:  { type: 'number', example: 80 },
            salary_max:  { type: 'number', example: 120 },
          },
        },
        JobResponse: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            company_id:  { type: 'string', format: 'uuid' },
            title:       { type: 'string' },
            description: { type: 'string' },
            location:    { type: 'string' },
            type:        { $ref: '#/components/schemas/JobType' },
            category:    { type: 'string' },
            salary_min:  { type: 'number' },
            salary_max:  { type: 'number' },
            status:      { $ref: '#/components/schemas/JobStatus' },
            created_at:  { type: 'string', format: 'date-time' },
          },
        },

        // ── Application ─────────────────────────────────
        CreateApplicationInput: {
          type: 'object',
          required: ['job_id'],
          properties: {
            job_id:       { type: 'string', format: 'uuid' },
            cover_letter: { type: 'string', example: 'I am very interested in this position...' },
          },
        },
        UpdateApplicationStatusInput: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { $ref: '#/components/schemas/ApplicationStatus' },
          },
        },
        ApplicationResponse: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            job_id:       { type: 'string', format: 'uuid' },
            applicant_id: { type: 'string', format: 'uuid' },
            cover_letter: { type: 'string' },
            status:       { $ref: '#/components/schemas/ApplicationStatus' },
            created_at:   { type: 'string', format: 'date-time' },
          },
        },

        // ── Common ──────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data:    {},
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred' },
          },
        },
      },
    },
  },
  // Explicit list avoids glob issues on Windows
  apis: [
    path.join(__dirname, '../routes/auth.routes.ts'),
    path.join(__dirname, '../routes/job.routes.ts'),
    path.join(__dirname, '../routes/company.routes.ts'),
    path.join(__dirname, '../routes/application.routes.ts'),
    path.join(__dirname, '../routes/user.routes.ts'),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
