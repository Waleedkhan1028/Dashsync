-- Analytics Events Table
-- Stores all user analytics events for dashboard visualization

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name VARCHAR(100) NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_event ON analytics_events(user_id, event_name, created_at DESC);

-- Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own events
DROP POLICY IF EXISTS "Users can view their own events" ON analytics_events;
CREATE POLICY "Users can view their own events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own events
DROP POLICY IF EXISTS "Users can insert their own events" ON analytics_events;
CREATE POLICY "Users can insert their own events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: Add retention policy comment (can be implemented via pg_cron if needed)
COMMENT ON TABLE analytics_events IS 'Analytics events with automatic cleanup of events older than 90 days (implement via scheduled job if needed)';
