CREATE TABLE companies (
  -- UUID generated automatically — unguessable primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- name: required, max 255 characters
  name VARCHAR(255) NOT NULL,

  -- description: required, TEXT for unlimited length
  -- VARCHAR(255) would be too short for company descriptions
  description TEXT NOT NULL,

  -- website and logo_url: optional (no NOT NULL)
  -- no length limit — URLs can be long
  website VARCHAR,
  logo_url VARCHAR,

  -- owner_id: foreign key linking company to its employer
  -- NOT NULL → every company must have an owner
  -- REFERENCES users(id) → owner must exist in users table
  -- ON DELETE CASCADE → if owner deleted, company deleted automatically
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- created_at: set automatically on insert (NOW() = CURRENT_TIMESTAMP)
  created_at TIMESTAMP DEFAULT NOW()
);