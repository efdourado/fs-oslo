"use server";

import { createServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createQuestion(formData: FormData) {
  const supabase = await createServer();

  const subjectName = formData.get("subject") as string;
  let { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .ilike("name", subjectName.trim())
    .single();
  if (!subject) {
    const { data: newSubject, error: newSubjectError } = await supabase
      .from("subjects")
      .insert({ name: subjectName.trim() })
      .select("id")
      .single();
    if (newSubjectError) {
      throw new Error("Falha ao criar matéria: " + newSubjectError.message);
    }
    if (!newSubject) {
       throw new Error("Falha ao criar matéria: não foi possível obter o ID.");
    }
    subject = newSubject;
  }

  const topicName = formData.get("topic") as string;
  let { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("subject_id", subject.id)
    .ilike("name", topicName.trim())
    .single();
  if (!topic) {
    const { data: newTopic, error: newTopicError } = await supabase
      .from("topics")
      .insert({ name: topicName.trim(), subject_id: subject.id })
      .select("id")
      .single();
    if (newTopicError) {
      throw new Error("Falha ao criar assunto: " + newTopicError.message);
    }
    if (!newTopic) {
        throw new Error("Falha ao criar assunto: não foi possível obter o ID.");
    }
    topic = newTopic;
  }

  const { data: question, error: questionError } = await supabase
    .from("questions")
    .insert({
      subject_id: subject.id,
      topic_id: topic.id,
      statement: formData.get("statement") as string,
      explanation: formData.get("explanation") as string,
      tips: formData.get("tips") as string,
      banca: formData.get("banca") as string,
      ano: Number(formData.get("ano")) || null,
      orgao: formData.get("orgao") as string,
      cargo: formData.get("cargo") as string,
    })
    .select("id")
    .single();

  if (questionError)
    throw new Error("Falha ao criar questão: " + questionError.message);
  if (!question)
    throw new Error("Não foi possível obter o ID da questão criada.");

  const correctOptionIndex = parseInt(
    formData.get("correctOptionIndex") as string,
    10
  );
  const options = Array.from(formData.keys())
    .filter((key) => key.startsWith("option_"))
    .map((key, index) => ({
      question_id: question.id,
      option_text: formData.get(key) as string,
      is_correct: index === correctOptionIndex,
    }));

  const { error: optionsError } = await supabase.from("options").insert(options);
  if (optionsError)
    throw new Error("Falha ao criar opções: " + optionsError.message);

  revalidatePath("/admin");
  revalidatePath("/questions");
  redirect("/dashboard");
}

export async function deleteQuestion(questionId: string) {
  const supabase = await createServer();

  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", questionId);

  if (error) {
    console.error("Falha ao deletar questão:", error);
    throw new Error("Falha ao deletar questão: " + error.message);
  }

  revalidatePath("/questions");
  redirect("/questions");
}

export async function updateQuestion(questionId: string, formData: FormData) {
  const supabase = await createServer();

  const subjectName = formData.get("subject") as string;
  let { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .ilike("name", subjectName.trim())
    .single();
  if (!subject) {
    const { data: newSubject, error: newSubjectError } = await supabase
      .from("subjects")
      .insert({ name: subjectName.trim() })
      .select("id")
      .single();
    if (newSubjectError) {
      throw new Error("Falha ao criar matéria: " + newSubjectError.message);
    }
    if (!newSubject) {
       throw new Error("Falha ao criar matéria: não foi possível obter o ID.");
    }
    subject = newSubject;
  }

  const topicName = formData.get("topic") as string;
  let { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("subject_id", subject.id)
    .ilike("name", topicName.trim())
    .single();
  if (!topic) {
    const { data: newTopic, error: newTopicError } = await supabase
      .from("topics")
      .insert({ name: topicName.trim(), subject_id: subject.id })
      .select("id")
      .single();
    if (newTopicError) {
      throw new Error("Falha ao criar assunto: " + newTopicError.message);
    }
     if (!newTopic) {
        throw new Error("Falha ao criar assunto: não foi possível obter o ID.");
    }
    topic = newTopic;
  }

  const { error: questionError } = await supabase
    .from("questions")
    .update({
      subject_id: subject.id,
      topic_id: topic.id,
      statement: formData.get("statement") as string,
      explanation: formData.get("explanation") as string,
      tips: formData.get("tips") as string,
      banca: formData.get("banca") as string,
      ano: Number(formData.get("ano")) || null,
      orgao: formData.get("orgao") as string,
      cargo: formData.get("cargo") as string,
    })
    .eq("id", questionId);

  if (questionError) {
    throw new Error("Falha ao atualizar questão: " + questionError.message);
  }

  const { error: deleteOptionsError } = await supabase
    .from("options")
    .delete()
    .eq("question_id", questionId);

  if (deleteOptionsError) {
    throw new Error(
      "Falha ao limpar opções antigas: " + deleteOptionsError.message
  ); }

  const correctOptionIndex = parseInt(
    formData.get("correctOptionIndex") as string,
    10
  );
  const options = Array.from(formData.keys())
    .filter((key) => key.startsWith("option_"))
    .map((key, index) => ({
      question_id: questionId,
      option_text: formData.get(key) as string,
      is_correct: index === correctOptionIndex,
    }));

  const { error: optionsError } = await supabase.from("options").insert(options);
  if (optionsError) {
    throw new Error("Falha ao criar novas opções: " + optionsError.message);
  }

  revalidatePath("/questions");
  revalidatePath(`/questions/${questionId}/edit`);
  redirect(`/questions/${questionId}/edit`);
}

export async function deleteSubject(subjectId: string) {
  const supabase = await createServer();

  const { error } = await supabase
    .from("subjects")
    .delete()
    .eq("id", subjectId);

  if (error) {
    console.error("Falha ao deletar matéria:", error);
    throw new Error("Falha ao deletar matéria: " + error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/subjects");
  revalidatePath("/questions");
  redirect("/subjects");
}

type QuestionPayload = {
  statement: string;
  explanation: string | null;
  tips: string | null;
  options: string[];
  correctOptionIndex: number;
};

export type BatchPayload = {
  subjectName: string;
  topicName: string;
  banca: string | null;
  ano: number | null;
  orgao: string | null;
  cargo: string | null;
  questions: QuestionPayload[];
};

export async function createQuestionBatch(payload: BatchPayload) {
  'use server'

  const supabase = await createServer();
  let createdCount = 0;

  const subjectName = payload.subjectName;
  let { data: subject } = await supabase
    .from("subjects")
    .select("id")
    .ilike("name", subjectName.trim())
    .single();
  if (!subject) {
    const { data: newSubject, error } = await supabase
      .from("subjects")
      .insert({ name: subjectName.trim() })
      .select("id")
      .single();
    if (error) throw new Error("Falha ao criar matéria: " + error.message);
    if (!newSubject) throw new Error("Falha ao criar matéria.");
    subject = newSubject;
  }

  const topicName = payload.topicName;
  let { data: topic } = await supabase
    .from("topics")
    .select("id")
    .eq("subject_id", subject.id)
    .ilike("name", topicName.trim())
    .single();
  if (!topic) {
    const { data: newTopic, error } = await supabase
      .from("topics")
      .insert({ name: topicName.trim(), subject_id: subject.id })
      .select("id")
      .single();
    if (error) throw new Error("Falha ao criar assunto: " + error.message);
    if (!newTopic) throw new Error("Falha ao criar assunto.");
    topic = newTopic;
  }

  for (const q of payload.questions) {
    const { data: newQuestion, error: questionError } = await supabase
      .from("questions")
      .insert({
        subject_id: subject.id,
        topic_id: topic.id,
        statement: q.statement,
        explanation: q.explanation,
        tips: q.tips,
        banca: payload.banca,
        ano: payload.ano,
        orgao: payload.orgao,
        cargo: payload.cargo,
      })
      .select("id")
      .single();

    if (questionError) {
      console.error("Falha ao criar questão no lote: ", questionError);
      continue;
    }
    if (!newQuestion) {
      continue;
    }

    const optionsToInsert = q.options
      .filter(opt => opt.trim() !== "") 
      .map((optionText, index) => ({
        question_id: newQuestion.id,
        option_text: optionText,
        is_correct: index === q.correctOptionIndex,
      }));
    
    if (optionsToInsert.length < 2) {
      console.error(`Questão ${newQuestion.id} pulada: menos de 2 opções válidas.`);
      continue;
    }

    const { error: optionsError } = await supabase
      .from("options")
      .insert(optionsToInsert);

    if (optionsError) {
      console.error(
        `Falha ao criar opções para questão ${newQuestion.id}: `,
        optionsError
      );
    } else {
      createdCount++;
  } }

  revalidatePath("/questions");
  
  return { 
    success: true, 
    createdCount, 
    totalAttempted: payload.questions.length 
}; }