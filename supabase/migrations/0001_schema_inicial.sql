-- ======================= RESET E CONFIGURAÇÃO DO BD OSLO =======================

-- === ETAPA 1: LIMPEZA ===
DROP FUNCTION IF EXISTS public.get_subject_stats(uuid);
DROP FUNCTION IF EXISTS public.get_review_questions(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.get_admin_dashboard_stats();

DROP TABLE IF EXISTS public.notebook_entries;
DROP TABLE IF EXISTS public.answers;
DROP TABLE IF EXISTS public.quiz_sessions;
DROP TABLE IF EXISTS public.options;
DROP TABLE IF EXISTS public.questions;
DROP TABLE IF EXISTS public.topics;
DROP TABLE IF EXISTS public.subjects;
DROP TABLE IF EXISTS public.profiles;

RAISE NOTICE '1. Estruturas antigas removidas.';

-- === ETAPA 2: TABELAS ===

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user'
);

CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(subject_id, name)
);

CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  statement TEXT NOT NULL,
  explanation TEXT,
  tips TEXT,
  banca TEXT,
  ano INT,
  orgao TEXT,
  cargo TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ,
  score INT,
  total_questions INT
);

CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option_id UUID NOT NULL REFERENCES public.options(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.quiz_sessions(id) ON DELETE SET NULL,
  is_correct BOOLEAN NOT NULL,
  error_type VARCHAR(50) CHECK (error_type IN ('attention', 'knowledge')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.notebook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('highlight', 'user_note')),
  content TEXT NOT NULL,
  source_question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

RAISE NOTICE '2. Tabelas criadas.';

-- === ETAPA 3: FUNÇÕES ===

CREATE OR REPLACE FUNCTION public.get_subject_stats(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  question_count bigint,
  session_count bigint,
  average_accuracy numeric
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH subject_questions AS (
    SELECT s.id, s.name, COUNT(q.id) AS question_count
    FROM subjects s
    LEFT JOIN questions q ON s.id = q.subject_id
    GROUP BY s.id, s.name
  ),
  user_sessions AS (
    SELECT qs.subject_id,
           COUNT(qs.id) AS session_count,
           COALESCE(AVG(CASE WHEN qs.total_questions > 0 
                             THEN (qs.score::numeric / qs.total_questions) * 100 
                             ELSE 0 END), 0) AS average_accuracy
    FROM quiz_sessions qs
    WHERE qs.user_id = p_user_id AND qs.completed_at IS NOT NULL
    GROUP BY qs.subject_id
  )
  SELECT sq.id, sq.name, sq.question_count,
         COALESCE(us.session_count, 0),
         COALESCE(us.average_accuracy, 0)
  FROM subject_questions sq
  LEFT JOIN user_sessions us ON sq.id = us.subject_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_review_questions(p_user_id uuid, p_subject_id uuid DEFAULT NULL, p_error_type text DEFAULT NULL)
RETURNS TABLE (
  question_id uuid,
  statement text,
  explanation text,
  subject_name text,
  topic_name text,
  options json,
  error_count bigint,
  error_types json,
  last_answered_at timestamptz,
  last_selected_option_id uuid
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH incorrect_answers AS (
    SELECT a.question_id, a.error_type, a.selected_option_id, a.created_at,
           ROW_NUMBER() OVER(PARTITION BY a.question_id ORDER BY a.created_at DESC) AS rn
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    WHERE a.user_id = p_user_id
      AND a.is_correct = false
      AND (p_subject_id IS NULL OR q.subject_id = p_subject_id)
      AND (p_error_type IS NULL OR 
           (p_error_type = 'unclassified' AND a.error_type IS NULL) OR
           (p_error_type <> 'unclassified' AND a.error_type = p_error_type))
  ),
  aggregated_errors AS (
    SELECT ia.question_id,
           COUNT(*) AS error_count,
           COALESCE(json_agg(DISTINCT ia.error_type) FILTER (WHERE ia.error_type IS NOT NULL), '[]'::json) AS error_types
    FROM incorrect_answers ia
    GROUP BY ia.question_id
  )
  SELECT q.id, q.statement, q.explanation, s.name, t.name,
         COALESCE((SELECT json_agg(o.*) FROM options o WHERE o.question_id = q.id), '[]'::json),
         ae.error_count, ae.error_types, latest.created_at, latest.selected_option_id
  FROM questions q
  JOIN subjects s ON q.subject_id = s.id
  LEFT JOIN topics t ON q.topic_id = t.id
  JOIN aggregated_errors ae ON q.id = ae.question_id
  JOIN (SELECT * FROM incorrect_answers WHERE rn = 1) latest ON q.id = latest.question_id
  ORDER BY latest.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin';
$$;

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS TABLE (
  total_users bigint,
  total_questions bigint,
  total_subjects bigint
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso restrito a administradores.';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM auth.users),
    (SELECT COUNT(*) FROM questions),
    (SELECT COUNT(*) FROM subjects);
END;
$$;

RAISE NOTICE '3. Funções criadas.';

-- === ETAPA 4: RLS E POLÍTICAS ===

ALTER TABLE public.profiles, public.subjects, public.topics,
             public.questions, public.options, public.quiz_sessions,
             public.answers, public.notebook_entries ENABLE ROW LEVEL SECURITY;

-- Perfis
CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (true);
CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sessões, Respostas, Caderno
CREATE POLICY quiz_sessions_policy ON public.quiz_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY answers_policy ON public.answers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY notebook_policy ON public.notebook_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Conteúdo (admin vs usuários)
CREATE POLICY subjects_read ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY subjects_admin ON public.subjects FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY topics_read ON public.topics FOR SELECT TO authenticated USING (true);
CREATE POLICY topics_admin ON public.topics FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY questions_read ON public.questions FOR SELECT TO authenticated USING (true);
CREATE POLICY questions_admin ON public.questions FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY options_read ON public.options FOR SELECT TO authenticated USING (true);
CREATE POLICY options_admin ON public.options FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

RAISE NOTICE '4. Políticas aplicadas.';

-- === ETAPA 5: FINAL ===
SELECT 'Banco de dados OSLO resetado e configurado com sucesso!' AS status;