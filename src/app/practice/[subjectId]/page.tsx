import { createServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Quiz from "@/components/shared/Quiz";

type PracticePageProps = {
  params: Promise<{ subjectId: string }>;
};

export default async function PracticePage({ params }: PracticePageProps) {
  const { subjectId } = await params;
  const supabase = await createServer();

  const { data: subject } = await supabase
    .from("subjects")
    .select("name")
    .eq("id", subjectId)
    .single();

  if (!subject) {
    notFound();
  }

  const { data: questions, error } = await supabase
    .from("questions")
    // ATUALIZAÇÃO: Buscando os novos campos de crédito
    .select("id, statement, explanation, banca, ano, orgao, cargo, options (id, option_text, is_correct)")
    .eq("subject_id", subjectId);
    
  if (error || !questions || questions.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold">Sem Questões por Aqui</h1>
        <p className="text-muted-foreground mt-2">Nenhuma questão foi encontrada para a matéria {subject.name}.</p>
        <p className="text-sm text-muted-foreground mt-1">Tente adicionar algumas no painel de administrador.</p>
      </div>
  ) }

  const questionsWithSubject = questions.map(q => ({ ...q, subject_id: subjectId }));

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold text-center mb-6">Praticando: {subject.name}</h1>
      <Quiz questions={questionsWithSubject} />
    </div>
); }