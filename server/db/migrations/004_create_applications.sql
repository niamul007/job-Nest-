CREATE TABLE applications (
  -- UUID generated automatically
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- job_id: which job this application is for
  -- ON DELETE CASCADE → if job deleted, all its applications deleted
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,

  -- applicant_id: which user submitted this application
  -- ON DELETE CASCADE → if user deleted, all their applications deleted
  -- Two cascades — applications are cleaned up from both directions
  applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- cover_letter: optional (no NOT NULL), no length limit
  cover_letter VARCHAR,

  /**
   * status: application lifecycle field
   * CHECK mirrors ApplicationStatus enum
   * DEFAULT 'pending' — every new application starts as pending automatically
   * This is why createApplication SQL doesn't pass status — DB sets it
   * Lifecycle: pending → reviewed → accepted | rejected
   */
  status VARCHAR CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')) NOT NULL DEFAULT 'pending',

  created_at TIMESTAMP DEFAULT NOW()
);