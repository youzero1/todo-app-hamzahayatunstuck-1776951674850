-- Create the todos table
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read all todos
CREATE POLICY "todos_anon_select" ON todos
  FOR SELECT TO anon USING (true);

-- Allow anonymous users to insert todos
CREATE POLICY "todos_anon_insert" ON todos
  FOR INSERT TO anon WITH CHECK (true);

-- Allow anonymous users to update todos
CREATE POLICY "todos_anon_update" ON todos
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anonymous users to delete todos
CREATE POLICY "todos_anon_delete" ON todos
  FOR DELETE TO anon USING (true);
