CREATE TABLE IF NOT EXISTS users (
  -- UUID generated automatically by PostgreSQL — more secure than auto-increment
  -- UUIDs are unguessable unlike sequential IDs (1, 2, 3...)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- name: required, max 255 characters
  name VARCHAR(255) NOT NULL,

  -- email: required, must be unique across all users
  -- enforces one account per email at database level
  email VARCHAR(255) UNIQUE NOT NULL,

  -- password: stored as bcrypt hash — never plain text
  -- VARCHAR(255) is enough for bcrypt hash length
  password VARCHAR(255) NOT NULL,

  -- role: CHECK constraint mirrors TypeScript UserRole enum
  -- three layers of validation: TypeScript → Zod → PostgreSQL CHECK
  role VARCHAR(20) CHECK (role IN ('admin', 'employer', 'applicant')) NOT NULL,

  -- created_at: set automatically by PostgreSQL on insert
  -- never passed manually from the application
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);