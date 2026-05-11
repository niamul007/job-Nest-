CREATE TABLE IF NOT EXISTS notifications (
  -- UUID generated automatically
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- user_id: who receives this notification
  -- ON DELETE CASCADE → if user deleted, all their notifications deleted
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- message: required, TEXT for unlimited length
  message TEXT NOT NULL,

  -- is_read: tracks whether user has seen the notification
  -- DEFAULT FALSE → every notification starts as unread
  is_read BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);