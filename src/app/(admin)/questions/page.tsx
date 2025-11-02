import { createServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Plus, Edit, Copy } from "lucide-react";
import Link from "next/link";

type RelationType = { name: string };
type Relation = RelationType | RelationType[] | null;

const getRelationName = (relation: Relation): string | null => {
  if (Array.isArray(relation) && relation.length > 0) {
    return relation[0]?.name;
  }
  if (relation && !Array.isArray(relation)) {
    return relation.name;
  }
  return null;
};

export default async function AdminQuestionsPage() {
  const supabase = await createServer();
  const { data: questions, error } = await supabase
    .from("questions")
    .select("id, statement, subjects (name), topics (name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Questões</h1>
          <p className="text-muted-foreground mt-2">
            Edite, delete ou adicione novas questões ao banco.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/questions/new/batch">
            <Button variant="outline" className="gap-2">
              <Copy className="h-4 w-4" />
              Criar em Lote
            </Button>
          </Link>
          <Link href="/questions/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Questão Única
            </Button>
          </Link>
        </div>
        <Link href="/questions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Nova Questão
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Banco de Questões</CardTitle>
          <CardDescription>
            {questions ? questions.length : 0} questões encontradas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-destructive">Erro ao carregar questões.</p>
          )}
          {questions && questions.length > 0 ? (
            <ul className="divide-y divide-border">
              {questions.map((q) => {
                // --- CORREÇÃO APLICADA AQUI ---
                const subjectName = getRelationName(q.subjects);
                const topicName = getRelationName(q.topics);

                return (
                  <li
                    key={q.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{q.statement}</p>
                      <p className="text-sm text-muted-foreground">
                        {subjectName || "Sem Matéria"} -{" "}
                        {topicName || "Sem Assunto"}
                      </p>
                    </div>
                    <Link href={`/questions/${q.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 ml-4"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>Nenhuma questão encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
); }