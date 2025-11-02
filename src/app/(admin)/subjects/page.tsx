import { createServer } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";
import DeleteSubjectButton from "./DeleteSubjectButton";

type SubjectStat = {
  id: string;
  name: string;
  question_count: number;
  session_count: number;
  average_accuracy: number;
};

export default async function AdminSubjectsPage() {
  const supabase = await createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <p className="text-destructive">Usuário não autenticado.</p>
  ); }

  const { data: subjects, error } = await supabase.rpc("get_subject_stats", {
    p_user_id: user.id,
  });

  if (error) {
    return (
      <p className="text-destructive">
        Erro ao carregar matérias: {error.message}
      </p>
  ); }

  const sortedSubjects = (subjects as SubjectStat[]).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Matérias</h1>
          <p className="text-muted-foreground mt-2">
            Delete matérias órfãs ou unificadas.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Matérias no Sistema</CardTitle>
          <CardDescription>
            {subjects ? subjects.length : 0} matérias encontradas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y divide-border">
            {sortedSubjects.map((subject) => {
              const isOrphan = subject.question_count === 0;
              return (
                <li
                  key={subject.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{subject.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>
                        {subject.question_count}
                        {subject.question_count === 1 ? " questão" : " questões"}
                      </span>
                      <span>
                        {subject.session_count}
                        {subject.session_count === 1 ? " sessão" : " sessões"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {isOrphan ? (
                      <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-4 w-4" />
                        Órfã (sem questões)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        Ativa
                      </span>
                    )}
                    {/* Botão de deleção (Client Component) */}
                    <DeleteSubjectButton
                      subjectId={subject.id}
                      subjectName={subject.name}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
); }