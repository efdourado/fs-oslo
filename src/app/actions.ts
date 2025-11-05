'use server'

import { createServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createServer()
  await supabase.auth.signOut()
  return redirect('/')
}

export async function createQuizSession(subjectId: string): Promise<string> {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado.');
  }
  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .insert({
      user_id: user.id,
      subject_id: subjectId,
    })
    .select('id')
    .single();

  if (error || !session) {
    console.error('Erro ao criar sessão de quiz:', error);
    throw new Error('Não foi possível iniciar o quiz.');
  }
  return session.id;
}

export async function updateQuizSession(sessionId: string, score: number, totalQuestions: number) {
  const supabase = await createServer();
  const { error } = await supabase
    .from('quiz_sessions')
    .update({
      completed_at: new Date().toISOString(),
      score,
      total_questions: totalQuestions,
    })
    .eq('id', sessionId);

  if (error) {
    console.error('Erro ao finalizar sessão de quiz:', error);
  }
  revalidatePath('/dashboard');
}


export async function saveAnswer(
  questionId: string,
  selectedOptionId: string,
  isCorrect: boolean,
  sessionId: string
): Promise<string | null> {
  const supabase = await createServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado.')
  }

  const { data: newAnswer, error } = await supabase.from('answers').insert({
    user_id: user.id,
    question_id: questionId,
    selected_option_id: selectedOptionId,
    is_correct: isCorrect,
    session_id: sessionId,
  }).select('id').single()

  if (error) {
    console.error('Erro ao salvar resposta:', error)
    return null
  }

  revalidatePath('/dashboard')
  return newAnswer.id
}

export async function classifyError(answerId: string, errorType: 'attention' | 'knowledge') {
  const supabase = await createServer()

  const { error } = await supabase
    .from('answers')
    .update({ error_type: errorType })
    .eq('id', answerId)

  if (error) {
    console.error('Erro ao classificar o erro:', error)
    throw new Error('Não foi possível classificar o erro.')
  }

  revalidatePath('/dashboard')
  revalidatePath('/review');
}

export async function createNotebookHighlight(
  questionId: string,
  subjectId: string,
  highlightedText: string
) {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Usuário não autenticado.');
  }

  const { error } = await supabase.from('notebook_entries').insert({
    user_id: user.id,
    subject_id: subjectId,
    content: highlightedText,
    entry_type: 'highlight',
    source_question_id: questionId, 
  });

  if (error) {
    console.error('Erro ao salvar grifo no caderno:', error);
    throw new Error('Não foi possível salvar o grifo no caderno.');
  }
  revalidatePath('/notebook');
}

export async function createNotebookNote(formData: FormData) {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const subjectId = formData.get('subjectId') as string;
  const noteContent = formData.get('noteContent') as string;

  if (!subjectId || !noteContent) {
    throw new Error("Matéria e conteúdo da anotação são obrigatórios.");
  }

  const { error } = await supabase.from("notebook_entries").insert({
    user_id: user.id,
    subject_id: subjectId,
    content: noteContent,
    entry_type: "user_note",
  });

  if (error) {
    console.error("Erro ao salvar anotação:", error);
    throw new Error("Não foi possível salvar a anotação.");
  }
  revalidatePath("/notebook");
}

export async function removeQuestionFromReview(questionId: string) {
  "use server";

  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabase
    .from("answers")
    .delete()
    .eq("user_id", user.id)
    .eq("question_id", questionId)
    .eq("is_correct", false);

  if (error) {
    console.error("Erro ao remover questão da revisão:", error);
    throw new Error("Não foi possível remover a questão da revisão.");
  }

  revalidatePath("/review");
  revalidatePath("/dashboard");
}

export async function deleteNotebookEntry(entryId: string) {
  "use server";

  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabase
    .from("notebook_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao deletar anotação:", error);
    throw new Error("Não foi possível deletar a anotação.");
  }

  revalidatePath("/notebook");
}