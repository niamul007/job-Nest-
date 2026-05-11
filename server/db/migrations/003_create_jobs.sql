CREATE TABLE IF NOT EXISTS jobs (
  -- UUID generated automatically
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- company_id: which company posted this job
  -- ON DELETE CASCADE → if company deleted, all its jobs deleted automatically
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- title: required, VARCHAR(500) — longer than usual for detailed titles
  title VARCHAR(500) NOT NULL,

  -- description and location: TEXT for unlimited length
  description TEXT NOT NULL,
  location TEXT NOT NULL,

  -- type: CHECK mirrors JobType enum
  -- Three validation layers: TypeScript → Zod → PostgreSQL CHECK
  type VARCHAR(20) CHECK (type IN ('full-time','part-time','contract','freelance')) NOT NULL,

  -- category: optional — no NOT NULL
  category VARCHAR(255),

  -- salary: optional (no NOT NULL), NUMERIC allows decimal values
  salary_min NUMERIC,
  salary_max NUMERIC,

  /**
   * status: job lifecycle field
   * CHECK mirrors JobStatus enum
   * DEFAULT 'draft' — every new job starts as draft automatically
   * This is why createJob SQL doesn't pass status — DB sets it
   * Lifecycle: draft → pending → active → closed
   */
  status VARCHAR(20) CHECK (status IN ('draft','pending','active','closed')) NOT NULL DEFAULT 'draft',

  created_at TIMESTAMP DEFAULT NOW()
);