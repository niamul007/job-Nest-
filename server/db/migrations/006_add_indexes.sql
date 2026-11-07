-- Indexes for the columns the API filters and joins on.
-- IF NOT EXISTS makes this safe to run more than once.

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs (company_id);
CREATE INDEX IF NOT EXISTS idx_companies_owner_id ON companies (owner_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications (applicant_id);
