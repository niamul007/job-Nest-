/**
 * Swagger/OpenAPI specification for the JobNest API.
 * Defines reusable schemas, security schemes, and API metadata.
 * Combined with JSDoc @swagger comments in route files by swaggerJsdoc()
 * to produce the full interactive documentation served at /api/docs.
 */

import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0", // OpenAPI standard version being followed

    // ── API Info ──────────────────────────────────────────────────────────────
    // Shown at the top of /api/docs
    info: {
      title: "JobNest API",
      version: "1.0.0",
      description:
        "REST API for the JobNest job platform. " +
        "Click **Authorize** and paste the JWT token from `POST /api/auth/login` to test protected endpoints.",
    },

    // Base URL used when testing endpoints directly from /api/docs
    servers: [
      { url: "http://localhost:5000", description: "Development server" },
      {
        url: "https://job-nest-production.up.railway.app",
        description: "Production server",
      }, // ← add this
    ],

    // Groups endpoints into labelled sections in the /api/docs UI
    tags: [
      { name: "Auth", description: "Register and login" },
      { name: "Jobs", description: "Job listing management" },
      { name: "Companies", description: "Company profile management" },
      { name: "Applications", description: "Job application management" },
      { name: "Users", description: "User management (admin only)" },
    ],

    components: {
      // ── Security ─────────────────────────────────────────────────────────────
      // Defines JWT Bearer auth — powers the Authorize button in /api/docs.
      // Paste your token once and Swagger sends it automatically with every request.
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Paste the JWT token returned by POST /api/auth/login",
        },
      },

      // ── Schemas ───────────────────────────────────────────────────────────────
      // Reusable data shapes referenced across the API with $ref.
      // Split into Input schemas (what frontend sends) and
      // Response schemas (what backend returns) — they differ because:
      //   - passwords are never returned (security)
      //   - id and created_at are DB-generated, never sent by frontend
      schemas: {
        // ── Enums ───────────────────────────────────────────────────────────────
        // Valid values for role, job type, job status, and application status.
        // Defined once here and referenced via $ref to avoid repetition.
        UserRole: {
          type: "string",
          enum: ["admin", "employer", "applicant"],
          example: "applicant",
        },
        JobType: {
          type: "string",
          enum: ["full-time", "part-time", "contract", "freelance"],
          example: "full-time",
        },
        JobStatus: {
          type: "string",
          enum: ["draft", "pending", "active", "closed"],
          example: "active",
        },
        ApplicationStatus: {
          type: "string",
          enum: ["pending", "reviewed", "accepted", "rejected"],
          example: "pending",
        },

        // ── Auth ────────────────────────────────────────────────────────────────
        // RegisterInput — what the frontend sends to create a new account
        RegisterInput: {
          type: "object",
          required: ["name", "email", "password", "role"],
          properties: {
            name: { type: "string", example: "Jane Smith" },
            email: {
              type: "string",
              format: "email",
              example: "jane@example.com",
            },
            password: { type: "string", minLength: 6, example: "secret123" },
            role: { $ref: "#/components/schemas/UserRole" },
          },
        },
        // LoginInput — what the frontend sends to authenticate
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "jane@example.com",
            },
            password: { type: "string", example: "secret123" },
          },
        },
        // AuthData — what the backend returns after successful login/register
        // Contains the JWT token and the user object (no password)
        AuthData: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: { $ref: "#/components/schemas/UserResponse" },
          },
        },

        // ── User ────────────────────────────────────────────────────────────────
        // UserResponse — safe user object returned by the API (no password field)
        UserResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Jane Smith" },
            email: {
              type: "string",
              format: "email",
              example: "jane@example.com",
            },
            role: { $ref: "#/components/schemas/UserRole" },
            created_at: { type: "string", format: "date-time" },
          },
        },

        // ── Company ─────────────────────────────────────────────────────────────
        // CreateCompanyInput — what the frontend sends to create a company profile
        CreateCompanyInput: {
          type: "object",
          required: ["name", "description"],
          properties: {
            name: { type: "string", example: "Acme Corp" },
            description: {
              type: "string",
              example: "A leading technology company",
            },
            website: {
              type: "string",
              format: "uri",
              example: "https://acme.com",
            },
            logo_url: {
              type: "string",
              format: "uri",
              example: "https://acme.com/logo.png",
            },
          },
        },
        // CompanyResponse — full company object returned by the API
        CompanyResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Acme Corp" },
            description: { type: "string" },
            website: { type: "string" },
            logo_url: { type: "string" },
            owner_id: { type: "string", format: "uuid" }, // the employer who created it
            created_at: { type: "string", format: "date-time" },
          },
        },

        // ── Job ─────────────────────────────────────────────────────────────────
        // CreateJobInput — what the frontend sends to post a new job listing
        CreateJobInput: {
          type: "object",
          required: [
            "company_id",
            "title",
            "description",
            "location",
            "type",
            "category",
          ],
          properties: {
            company_id: { type: "string", format: "uuid" },
            title: { type: "string", example: "Senior Frontend Engineer" },
            description: {
              type: "string",
              example: "We are looking for a skilled engineer...",
            },
            location: { type: "string", example: "Remote" },
            type: { $ref: "#/components/schemas/JobType" },
            category: { type: "string", example: "Engineering" },
            salary_min: { type: "number", example: 80 },
            salary_max: { type: "number", example: 120 },
          },
        },
        // JobResponse — full job object returned by the API
        JobResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            company_id: { type: "string", format: "uuid" },
            title: { type: "string" },
            description: { type: "string" },
            location: { type: "string" },
            type: { $ref: "#/components/schemas/JobType" },
            category: { type: "string" },
            salary_min: { type: "number" },
            salary_max: { type: "number" },
            status: { $ref: "#/components/schemas/JobStatus" }, // set by admin, not frontend
            created_at: { type: "string", format: "date-time" },
          },
        },

        // ── Application ─────────────────────────────────────────────────────────
        // CreateApplicationInput — what the frontend sends to apply for a job
        CreateApplicationInput: {
          type: "object",
          required: ["job_id"],
          properties: {
            job_id: { type: "string", format: "uuid" },
            cover_letter: {
              type: "string",
              example: "I am very interested in this position...",
            },
          },
        },
        // UpdateApplicationStatusInput — what an employer sends to update application status
        UpdateApplicationStatusInput: {
          type: "object",
          required: ["status"],
          properties: {
            status: { $ref: "#/components/schemas/ApplicationStatus" },
          },
        },
        // ApplicationResponse — full application object returned by the API
        ApplicationResponse: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            job_id: { type: "string", format: "uuid" },
            applicant_id: { type: "string", format: "uuid" },
            cover_letter: { type: "string" },
            status: { $ref: "#/components/schemas/ApplicationStatus" },
            created_at: { type: "string", format: "date-time" },
          },
        },

        // ── Common ──────────────────────────────────────────────────────────────
        // Standard success response wrapper used across all endpoints
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation successful" },
            data: {}, // varies per endpoint
          },
        },
        // Standard error response wrapper used across all endpoints
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "An error occurred" },
          },
        },
      },
    },
  },

  // Route files to scan for @swagger JSDoc comments.
  // Explicit list used instead of glob pattern to avoid issues on Windows.
  apis: [
    path.join(__dirname, "../routes/auth.routes.ts"),
    path.join(__dirname, "../routes/job.routes.ts"),
    path.join(__dirname, "../routes/company.routes.ts"),
    path.join(__dirname, "../routes/application.routes.ts"),
    path.join(__dirname, "../routes/user.routes.ts"),
  ],
};

// Combine the definition above with @swagger comments from route files
export const swaggerSpec = swaggerJsdoc(options);
