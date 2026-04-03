CREATE TABLE applications(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cover_letter VARCHAR,
    status VARCHAR CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
    )