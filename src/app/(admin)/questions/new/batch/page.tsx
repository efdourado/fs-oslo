"use client";

import { useState, useTransition } from "react";
import {
  createQuestionBatch,
  type BatchPayload,
} from "../../actions";
import {
  Plus,
  Trash2,
  BookOpen,
  Tag,
  FileText,
  Loader2,
  Copy,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type LocalQuestion = {
  id: number;
  statement: string;
  explanation: string;
  tips: string;
  options: string[];
  correctOptionIndex: number;
};

let nextId = 0;

export default function NewBatchQuestionPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const [sharedData, setSharedData] = useState({
    subject: "",
    topic: "",
    banca: "",
    ano: "",
    orgao: "",
    cargo: "",
  });

  const [questions, setQuestions] = useState<LocalQuestion[]>([
    {
      id: nextId++,
      statement: "",
      explanation: "",
      tips: "",
      options: ["", ""],
      correctOptionIndex: 0,
  }, ]);

  const handleSharedChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSharedData({
      ...sharedData,
      [e.target.name]: e.target.value,
  }); };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: nextId++,
        statement: "",
        explanation: "",
        tips: "",
        options: ["", ""],
        correctOptionIndex: 0,
  }, ]); };

  const removeQuestion = (id: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((q) => q.id !== id));
  };
  
  const duplicateQuestion = (index: number) => {
    const questionToCopy = questions[index];
    const newQuestion = {
      ...questionToCopy,
      id: nextId++,
      statement: `${questionToCopy.statement} (Cópia)`,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (
    id: number,
    field: "statement" | "explanation" | "tips",
    value: string
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
  ); };

  const handleOptionChange = (
    id: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
  }) ); };

  const addOption = (id: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, options: [...q.options, ""] } : q
  ) ); };

  const removeOption = (id: number, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === id && q.options.length > 2) {
          const newOptions = q.options.filter((_, i) => i !== optionIndex);

          let newCorrectIndex = q.correctOptionIndex;
          if (q.correctOptionIndex === optionIndex) {
            newCorrectIndex = 0;
          } else if (q.correctOptionIndex > optionIndex) {
            newCorrectIndex = q.correctOptionIndex - 1;
          }
          return { ...q, options: newOptions, correctOptionIndex: newCorrectIndex };
        }
        return q;
  }) ); };

  const setCorrectOption = (id: number, optionIndex: number) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, correctOptionIndex: optionIndex } : q
  ) ); };

  const handleSubmit = () => {
    setMessage(null);
    
    if (!sharedData.subject || !sharedData.topic) {
      setMessage("Matéria e Assunto são obrigatórios nos Dados Compartilhados.");
      window.scrollTo(0, 0);
      return;
    }

    const batchPayload: BatchPayload = {
      subjectName: sharedData.subject,
      topicName: sharedData.topic,
      banca: sharedData.banca || null,
      ano: Number(sharedData.ano) || null,
      orgao: sharedData.orgao || null,
      cargo: sharedData.cargo || null,
      questions: questions.map(q => ({
        statement: q.statement,
        explanation: q.explanation || null,
        tips: q.tips || null,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex
    })) };

    startTransition(async () => {
      try {
        const result = await createQuestionBatch(batchPayload);
        if (result.success) {
           setMessage(`Sucesso! ${result.createdCount} de ${result.totalAttempted} questões foram criadas.`);

           setQuestions([{
              id: nextId++,
              statement: "",
              explanation: "",
              tips: "",
              options: ["", ""],
              correctOptionIndex: 0,
            }]);
        } else {
          throw new Error("A ação não retornou sucesso.");
        }
      } catch (error: unknown) {
         if (error instanceof Error) {
           setMessage(`Erro ao salvar lote: ${error.message}`);
         } else {
           setMessage(`Erro ao salvar lote: ${String(error)}`);
        } }
      window.scrollTo(0, 0);
  }); };

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md ${
            message.startsWith("Erro") 
              ? 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300' 
              : 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-300'
          }`}>
          <p>{message}</p>
        </div>
      )}

      {/* --- 1. DADOS COMPARTILHADOS --- */}
      <Card className="border-blue-500 border-2 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Dados Compartilhados (para todo o lote)
          </CardTitle>
          <CardDescription>
            Informações que serão aplicadas a TODAS as questões criadas nesta
            sessão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-500" /> Matéria *
              </Label>
              <Input
                name="subject"
                id="subject"
                placeholder="Ex: Gestão de Materiais"
                required
                className="rounded-lg"
                value={sharedData.subject}
                onChange={handleSharedChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic" className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" /> Assunto *
              </Label>
              <Input
                name="topic"
                id="topic"
                placeholder="Ex: Classificação de Materiais"
                required
                className="rounded-lg"
                value={sharedData.topic}
                onChange={handleSharedChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="banca">Banca</Label>
              <Input name="banca" id="banca" placeholder="Ex: FGV" value={sharedData.banca} onChange={handleSharedChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ano">Ano</Label>
              <Input name="ano" id="ano" type="number" placeholder="2024" value={sharedData.ano} onChange={handleSharedChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orgao">Órgão</Label>
              <Input name="orgao" id="orgao" placeholder="Ex: Polícia Federal" value={sharedData.orgao} onChange={handleSharedChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input name="cargo" id="cargo" placeholder="Ex: Agente" value={sharedData.cargo} onChange={handleSharedChange} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- 2. LISTA DE QUESTÕES --- */}
      <h2 className="text-2xl font-semibold pt-4">
        Questões do Lote
      </h2>
      
      <div className="space-y-4">
        {questions.map((q, qIndex) => (
          <Card key={q.id} className="shadow-md relative pt-10">
            <div className="absolute top-3 right-3 flex gap-2">
               <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => duplicateQuestion(qIndex)}
                  title="Duplicar esta questão"
                >
                  <Copy className="h-4 w-4" />
                </Button>
               <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeQuestion(q.id)}
                  disabled={questions.length <= 1}
                  title="Remover esta questão"
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
            </div>
             <CardHeader className="pt-0 pb-4">
              <CardTitle className="text-lg">
                Questão {qIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enunciado */}
              <div className="space-y-2">
                <Label htmlFor={`statement_${q.id}`}>Enunciado *</Label>
                <Textarea
                  name={`statement_${q.id}`}
                  id={`statement_${q.id}`}
                  required
                  placeholder="Digite o enunciado da questão aqui..."
                  className="min-h-[120px] rounded-lg"
                  value={q.statement}
                  onChange={(e) =>
                    handleQuestionChange(q.id, "statement", e.target.value)
                  }
                />
              </div>

              {/* Opções de Resposta */}
              <div className="space-y-4">
                <Label>Opções de Resposta *</Label>
                <div className="space-y-3">
                  {q.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3 group">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="radio"
                          name={`correctOptionIndex_${q.id}`}
                          checked={q.correctOptionIndex === index}
                          onChange={() => setCorrectOption(q.id, index)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Input
                          placeholder={`Opção ${index + 1}`}
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(q.id, index, e.target.value)
                          }
                          required
                          className="rounded-lg flex-1"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(q.id, index)}
                        disabled={q.options.length <= 2}
                        className="h-9 w-9 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addOption(q.id)}
                  className="gap-2 rounded-lg border-dashed"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar Opção
                </Button>
              </div>

              {/* Explicação */}
              <div className="space-y-2">
                <Label htmlFor={`explanation_${q.id}`}>Explicação</Label>
                <Textarea
                  name={`explanation_${q.id}`}
                  id={`explanation_${q.id}`}
                  placeholder="Explique por que a resposta correta está certa..."
                  className="min-h-[100px] rounded-lg"
                  value={q.explanation}
                  onChange={(e) =>
                    handleQuestionChange(q.id, "explanation", e.target.value)
                  }
                />
              </div>

              {/* Dicas */}
              <div className="space-y-2">
                <Label htmlFor={`tips_${q.id}`}>Dicas</Label>
                <Textarea
                  name={`tips_${q.id}`}
                  id={`tips_${q.id}`}
                  placeholder="Adicione dicas ou mnemônicos..."
                  className="min-h-[100px] rounded-lg"
                  value={q.tips}
                  onChange={(e) =>
                    handleQuestionChange(q.id, "tips", e.target.value)
                  }
                />
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- 3. BOTÕES DE AÇÃO --- */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-8 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={addQuestion}
          className="gap-2 rounded-lg border-dashed w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Adicionar Nova Questão ao Lote
        </Button>
        
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="w-full sm:w-auto gap-2"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Lote de {questions.length} Questões
        </Button>
      </div>
    </div>
); }