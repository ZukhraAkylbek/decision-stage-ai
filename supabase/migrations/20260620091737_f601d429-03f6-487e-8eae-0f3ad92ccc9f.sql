CREATE TABLE public.appeals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  task_type text NOT NULL,
  attempt_number integer NOT NULL DEFAULT 1,
  student_input text,
  system_feedback text,
  call_transcript jsonb,
  complaint_category text NOT NULL,
  complaint_text text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.appeals TO authenticated;
GRANT ALL ON public.appeals TO service_role;

ALTER TABLE public.appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own appeals"
ON public.appeals FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appeals"
ON public.appeals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);