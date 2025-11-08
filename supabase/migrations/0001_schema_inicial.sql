-- ========= SCRIPT DE RESET E CONFIGURAÇÃO COMPLETA DO BD OSLO =========
--
-- ESTRUTURA:
-- ETAPA 1: Limpeza das Estruturas Antigas
-- ETAPA 2: Criação das Tabelas
-- ETAPA 3: Criação das Funções (RPC)
-- ETAPA 4: Habilitação de RLS e Criação de Políticas de Segurança
-- ETAPA 5: Mensagem Final
--
-- ==============================================================================

-- ========== ETAPA 1: LIMPEZA DAS ESTRUTURAS ANTIGAS ==========
-- Remove as funções para evitar conflitos na recriação das tabelas.
DROP FUNCTION IF EXISTS public.get_subject_stats(uuid);
DROP FUNCTION IF EXISTS public.get_review_questions(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.is_admin();

-- Remove as tabelas na ordem inversa de dependência.
DROP TABLE IF EXISTS public.notebook_entries;
DROP TABLE IF EXISTS public.answers;
DROP TABLE IF EXISTS public.quiz_sessions;
DROP TABLE IF EXISTS public.options;
DROP TABLE IF EXISTS public.questions;
DROP TABLE IF EXISTS public.topics;
DROP TABLE IF EXISTS public.subjects;
DROP TABLE IF EXISTS public.profiles;

RAISE NOTICE 'ETAPA 1: Estruturas antigas removidas com sucesso.';

-- ========== ETAPA 2: CRIAÇÃO DAS TABELAS ==========

-- Tabela de Perfis de Usuário (para roles como 'admin')
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user'
);
COMMENT ON TABLE public.profiles IS 'Armazena perfis de usuário, incluindo roles (ex: admin).';

-- Tabela de Matérias
CREATE TABLE public.subjects (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.subjects IS 'Matérias principais para estudo (ex: Direito Administrativo).';

-- Tabela de Assuntos (tópicos dentro das matérias)
CREATE TABLE public.topics (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(subject_id, name)
);
COMMENT ON TABLE public.topics IS 'Assuntos específicos dentro de uma matéria (ex: Atos Administrativos).';

-- Tabela de Questões
CREATE TABLE public.questions (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
    statement TEXT NOT NULL,
    explanation TEXT,
    tips TEXT,
    banca TEXT NULL,
    ano INT NULL,
    orgao TEXT NULL,
    cargo TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.questions IS 'Armazena as questões de múltipla escolha.';

-- Tabela de Alternativas das Questões
CREATE TABLE public.options (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.options IS 'Alternativas (A, B, C, D, E) para cada questão.';

-- Tabela de Sessões de Quiz
CREATE TABLE public.quiz_sessions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NULL,
  score INT NULL,
  total_questions INT NULL
);
COMMENT ON TABLE public.quiz_sessions IS 'Registra cada sessão de quiz iniciada e completada por um usuário.';

-- Tabela de Respostas do Usuário
CREATE TABLE public.answers (
    id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID NOT NULL REFERENCES public.options(id) ON DELETE CASCADE,
    session_id UUID NULL REFERENCES public.quiz_sessions(id) ON DELETE SET NULL,
    is_correct BOOLEAN NOT NULL,
    error_type VARCHAR(50) CHECK (error_type IN ('attention', 'knowledge')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.answers IS 'Cada resposta individual que um usuário deu a uma questão.';

-- Tabela de Caderno (Grifos e Anotações)
CREATE TABLE public.notebook_entries (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('highlight', 'user_note')),
  content TEXT NOT NULL,
  source_question_id UUID NULL REFERENCES public.questions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.notebook_entries IS 'Anotações pessoais e grifos feitos pelos usuários.';

RAISE NOTICE 'ETAPA 2: Tabelas criadas com sucesso.';

-- ========== ETAPA 3: CRIAÇÃO DAS FUNÇÕES (RPC) ==========

-- Função para buscar estatísticas do dashboard
CREATE OR REPLACE FUNCTION public.get_subject_stats(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    name text,
    question_count bigint,
    session_count bigint,
    average_accuracy numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH subject_questions AS (
        SELECT 
            s.id,
            s.name::text,
            COUNT(q.id) as question_count
        FROM subjects s
        LEFT JOIN questions q ON s.id = q.subject_id
        GROUP BY s.id, s.name
    ),
    user_sessions AS (
        SELECT
            qs.subject_id,
            COUNT(qs.id) as session_count,
            COALESCE(AVG(CASE WHEN qs.total_questions > 0 THEN (qs.score::numeric / qs.total_questions) * 100 ELSE 0 END), 0) as average_accuracy
        FROM quiz_sessions qs
        WHERE qs.user_id = p_user_id AND qs.completed_at IS NOT NULL
        GROUP BY qs.subject_id
    )
    SELECT
        sq.id,
        sq.name,
        sq.question_count,
        COALESCE(us.session_count, 0) as session_count,
        COALESCE(us.average_accuracy, 0) as average_accuracy
    FROM subject_questions sq
    LEFT JOIN user_sessions us ON sq.id = us.subject_id;
END;
$$;

-- Função para buscar questões para a página de revisão
-- (Notei que você a dropou no seu script original, mas estou incluindo caso tenha sido um erro)
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
    last_answered_at timestamp with time zone,
    last_selected_option_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH incorrect_answers AS (
      SELECT
        a.question_id,
        a.error_type,
        a.selected_option_id,
        a.created_at,
        ROW_NUMBER() OVER(PARTITION BY a.question_id ORDER BY a.created_at DESC) as rn
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.user_id = p_user_id
        AND a.is_correct = false
        AND (p_subject_id IS NULL OR q.subject_id = p_subject_id)
        AND (
          p_error_type IS NULL OR
          (p_error_type = 'unclassified' AND a.error_type IS NULL) OR
          (p_error_type <> 'unclassified' AND a.error_type = p_error_type)
        )
    ),
    aggregated_errors AS (
      SELECT
        ia.question_id,
        COUNT(*) as error_count,
        COALESCE(
          json_agg(DISTINCT ia.error_type) FILTER (WHERE ia.error_type IS NOT NULL),
          '[]'::json
        ) as error_types
      FROM incorrect_answers ia
      GROUP BY ia.question_id
    )
    SELECT
        q.id as question_id,
        q.statement,
        q.explanation,
        s.name as subject_name,
        t.name as topic_name,
        COALESCE(
          (SELECT json_agg(o.*) FROM options o WHERE o.question_id = q.id),
          '[]'::json
        ) as options,
        ae.error_count,
        ae.error_types,
        latest.created_at as last_answered_at,
        latest.selected_option_id as last_selected_option_id
    FROM questions q
    JOIN subjects s ON q.subject_id = s.id
    LEFT JOIN topics t ON q.topic_id = t.id -- Use LEFT JOIN para Tópicos, caso seja nulo
    JOIN aggregated_errors ae ON q.id = ae.question_id
    JOIN (SELECT * FROM incorrect_answers WHERE rn = 1) as latest ON q.id = latest.question_id
    ORDER BY latest.created_at DESC;
END;
$$;

RAISE NOTICE 'ETAPA 3: Funções RPC criadas com sucesso.';

-- ========== ETAPA 4: HABILITAÇÃO DE RLS E POLÍTICAS DE SEGURANÇA ==========

-- --- 4.1: Habilitar RLS em todas as tabelas ---
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_entries ENABLE ROW LEVEL SECURITY;

-- --- 4.2: Função Auxiliar de Segurança ---
-- Função que checa se o usuário logado possui a role 'admin' na tabela de perfis.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin';
$$;

-- --- 4.3: Políticas para 'profiles' ---
CREATE POLICY "Perfis públicos são visíveis para todos."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem criar seu próprio perfil."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- --- 4.4: Políticas para Dados Específicos do Usuário ---
-- O usuário só pode ver e modificar SEUS PRÓPRIOS dados.

CREATE POLICY "Usuários podem gerenciar suas próprias sessões de quiz."
  ON public.quiz_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar suas próprias respostas."
  ON public.answers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar seu próprio caderno."
  ON public.notebook_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- --- 4.5: Políticas para Conteúdo (Matérias, Tópicos, Questões, Opções) ---
-- REGRA: Todos os usuários autenticados podem LER. Apenas ADMNS podem ESCREVER/EDITAR/DELETAR.

-- Tabela 'subjects'
CREATE POLICY "Usuários autenticados podem ler matérias."
  ON public.subjects FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY "Administradores podem gerenciar matérias."
  ON public.subjects FOR ALL -- (ALL = SELECT, INSERT, UPDATE, DELETE)
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela 'topics'
CREATE POLICY "Usuários autenticados podem ler tópicos."
  ON public.topics FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY "Administradores podem gerenciar tópicos."
  ON public.topics FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela 'questions'
CREATE POLICY "Usuários autenticados podem ler questões."
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY "Administradores podem gerenciar questões."
  ON public.questions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Tabela 'options'
CREATE POLICY "Usuários autenticados podem ler opções."
  ON public.options FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY "Administradores podem gerenciar opções."
  ON public.options FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

RAISE NOTICE 'ETAPA 4: Row Level Security (RLS) e Políticas aplicadas com sucesso.';

-- ========== ETAPA 5: MENSAGEM FINAL ==========
SELECT 'Banco de dados OSLO resetado e configurado com sucesso!' as status;