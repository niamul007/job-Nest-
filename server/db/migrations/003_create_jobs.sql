CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('full-time','part-time','contract','freelance')) NOT NULL,
    category VARCHAR(255),
    salary_min NUMERIC ,
    salary_max NUMERIC,
    status VARCHAR(20) CHECK (status IN ('draft','pending','active','closed'))  NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT NOW()

)