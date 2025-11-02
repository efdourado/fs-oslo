"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { updateQuestion, deleteQuestion } from "../../actions";
import { Plus, Trash2, BookOpen, Tag, Building, FileText, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type QuestionForForm = {
  id: string;
  statement: string;
  explanation: string | null;
  tips: string | null;
  banca: string | null;
  ano: number | null;
  orgao: string | null;
  cargo: string | null;
  subjectName: string;
  topicName: string;
  options: {
    id: string;
    option_text: string;
    is_correct: boolean;
}[]; };

type EditQuestionFormProps = {
  question: QuestionForForm;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-lg py-3"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
        </>
      ) : (
        "Salvar Alterações"
      )}
    </Button>
); }

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="destructive"
      disabled={pending}
      className="w-full sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deletando...
        </>
      ) : (
        <>
          <Trash2 className="mr-2 h-4 w-4" /> Deletar Questão
        </>
      )}
    </Button>
); }

export default function EditQuestionForm({ question }: EditQuestionFormProps) {
  const [options, setOptions] = useState(
    question.options.map((opt) => opt.option_text)
  );
  const [correctOption, setCorrectOption] = useState(
    Math.max(
      0,
      question.options.findIndex((opt) => opt.is_correct)
  ) );

  const addOption = () => {
    setOptions([...options, ""]);
  };
  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctOption === index) {
        setCorrectOption(0);
      } else if (correctOption > index) {
        setCorrectOption(correctOption - 1);
  } } };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const updateAction = updateQuestion.bind(null, question.id);
  const deleteAction = deleteQuestion.bind(null, question.id);

  const handleDelete = (e: React.MouseEvent<HTMLFormElement>) => {
    if (!confirm("Tem certeza que deseja deletar esta questão? Esta ação não pode ser desfeita.")) {
      e.preventDefault();
  } };

  return (
    <div className="space-y-6">
      <form action={updateAction} className="space-y-6">
        {/* Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4 text-gray-500" />
              Matéria *
            </Label>
            <Input
              name="subject"
              id="subject"
              placeholder="Ex: Direito Administrativo"
              required
              className="rounded-lg"
              defaultValue={question.subjectName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic" className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-gray-500" />
              Assunto *
            </Label>
            <Input
              name="topic"
              id="topic"
              placeholder="Ex: Atos Administrativos"
              required
              className="rounded-lg"
              defaultValue={question.topicName}
            />
          </div>
        </div>

        {/* Detalhes da Prova */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Detalhes da Prova
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="banca" className="text-sm font-medium">Banca</Label>
              <Input name="banca" id="banca" placeholder="Ex: FGV" className="rounded-lg" defaultValue={question.banca || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano" className="text-sm font-medium">Ano</Label>
              <Input name="ano" id="ano" type="number" placeholder="2024" className="rounded-lg" defaultValue={question.ano || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgao" className="text-sm font-medium">Órgão</Label>
              <Input name="orgao" id="orgao" placeholder="Ex: Polícia Federal" className="rounded-lg" defaultValue={question.orgao || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo" className="text-sm font-medium">Cargo</Label>
              <Input name="cargo" id="cargo" placeholder="Ex: Agente" className="rounded-lg" defaultValue={question.cargo || ""} />
            </div>
          </div>
        </div>

        {/* Enunciado */}
        <div className="space-y-2">
          <Label htmlFor="statement" className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-gray-500" />
            Enunciado da Questão *
          </Label>
          <Textarea
            name="statement"
            id="statement"
            required
            placeholder="Digite o enunciado da questão aqui..."
            className="min-h-[120px] rounded-lg resize-none"
            defaultValue={question.statement}
          />
        </div>

        {/* Opções de Resposta */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-gray-500" />
            Opções de Resposta *
          </Label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex items-center gap-3 group">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="radio"
                    name="correctOptionIndex"
                    value={index}
                    checked={correctOption === index}
                    onChange={() => setCorrectOption(index)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Input
                    name={`option_${index}`}
                    placeholder={`Opção ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                    className="rounded-lg flex-1"
                  />
                </div>
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
            className="gap-2 rounded-lg border-dashed"
          >
            <Plus className="h-4 w-4" />
            Adicionar Opção
          </Button>
        </div>

        {/* Explicação */}
        <div className="space-y-2">
          <Label htmlFor="explanation" className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-gray-500" />
            Explicação
          </Label>
          <Textarea
            name="explanation"
            id="explanation"
            placeholder="Explique por que a resposta correta está certa..."
            className="min-h-[100px] rounded-lg resize-none"
            defaultValue={question.explanation || ""}
          />
        </div>

        {/* Dicas */}
        <div className="space-y-2">
          <Label htmlFor="tips" className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="h-4 w-4 text-gray-500" />
            Dicas
          </Label>
          <Textarea
            name="tips"
            id="tips"
            placeholder="Adicione dicas ou mnemônicos sobre o assunto..."
            className="min-h-[100px] rounded-lg resize-none"
            defaultValue={question.tips || ""}
          />
        </div>

        {/* Botão de Submit */}
        <div className="pt-4">
          <SubmitButton />
        </div>
      </form>

      {/* Seção de Perigo - Deletar */}
      <div className="border-t border-destructive/20 pt-6 mt-10">
        <h3 className="text-lg font-semibold text-destructive">Zona de Perigo</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Esta ação é permanente e deletará a questão, suas opções e todas as
          respostas de usuários associadas a ela.
        </p>
        <form action={deleteAction} onSubmit={handleDelete}>
          <DeleteButton />
        </form>
      </div>
    </div>
); }