-- =====================================================
-- CONTENT EMBEDDINGS TABLE (using JSONB for embeddings since vector extension unavailable)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.content_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'review', 'profile')),
  content_id UUID NOT NULL,
  embedding JSONB, -- Store as JSON array (will compute similarity in edge function)
  embedding_model TEXT DEFAULT 'mxbai-embed-xsmall-v1',
  keywords TEXT[],
  semantic_categories TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(content_type, content_id)
);

-- Index for embeddings lookup
CREATE INDEX IF NOT EXISTS idx_content_embeddings_content_type ON public.content_embeddings(content_type, content_id);

-- RLS
ALTER TABLE public.content_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view embeddings"
  ON public.content_embeddings FOR SELECT
  TO authenticated
  USING (true);