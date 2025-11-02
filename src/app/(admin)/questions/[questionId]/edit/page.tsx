import { createServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditQuestionForm from "./EditQuestionForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";

type EditPageProps = {
  params: Promise<{
    questionId: string;
}>; };

type OptionType = { id: string; option_text: string; is_correct: boolean };

export default async function EditQuestionPage({ params }: EditPageProps) {
  const { questionId } = await params;
  const supabase = await createServer();

  const { data: question, error } = await supabase
    .from("questions")
    .select(
      `
      *,
      subjects (name),
      topics (name),
      options (id, option_text, is_correct)
    `
    )
    .eq("id", questionId)
    .single();

  if (error || !question) {
    notFound();
  }

  const formattedQuestion = {
    ...question,
    subjectName: question.subjects?.name || "",
    topicName: question.topics?.name || "",

    options: (question.options as OptionType[]).sort((a: OptionType, b: OptionType) =>
      a.option_text.localeCompare(b.option_text)
  ) || [], };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Editar Questão</h1>
        <p className="text-muted-foreground mt-2">
          Ajuste o enunciado, opções ou qualquer detalhe da questão.
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Editando: {question.id}
          </CardTitle>
          <CardDescription>
            Faça as alterações e salve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditQuestionForm question={formattedQuestion} />
        </CardContent>
      </Card>
    </div>
); }