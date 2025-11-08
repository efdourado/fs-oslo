import { createServer } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { AlertTriangle, CheckCircle } from "lucide-react"
import DeleteSubjectButton from "./subjects/DeleteSubjectButton"
import PaginationControls from "./PaginationControls"

type SubjectStat = {
  id: string
  name: string
  question_count: number
  session_count: number
  average_accuracy: number
}

const SUBJECTS_PAGE_SIZE = 3

export default async function SubjectsList({
  currentPage,
  totalSubjects,
}: {
  currentPage: number
  totalSubjects: number
}) {
  const supabase = await createServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p className="text-destructive">Usuário não autenticado.</p>
  }

  const { data: subjectData, error: subjectsError } = await supabase.rpc(
    "get_subject_stats",
    {
      p_user_id: user.id,
  } )

  const sortedSubjects = (subjectData as SubjectStat[] | null)?.sort((a, b) =>
    a.name.localeCompare(b.name)
  ) || []
  
  const offset = (currentPage - 1) * SUBJECTS_PAGE_SIZE
  const paginatedSubjects = sortedSubjects.slice(offset, offset + SUBJECTS_PAGE_SIZE)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matérias no Sistema</CardTitle>
        <CardDescription>
          {totalSubjects} matérias encontradas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjectsError && (
          <p className="text-destructive">
            Erro ao carregar matérias: {subjectsError.message}
          </p>
        )}
        {paginatedSubjects && paginatedSubjects.length > 0 ? (
          <ul className="divide-y divide-border">
            {paginatedSubjects.map((subject) => {
              const isOrphan = subject.question_count === 0
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
                        {subject.question_count === 1
                          ? " questão"
                          : " questões"}
                      </span>
                      <span>
                        {subject.session_count}
                        {subject.session_count === 1
                          ? " sessão"
                          : " sessões"}
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
                    <DeleteSubjectButton
                      subjectId={subject.id}
                      subjectName={subject.name}
                    />
                  </div>
                </li>
            ) })}
          </ul>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <p>Nenhuma matéria encontrada.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <PaginationControls
          currentPage={currentPage}
          totalCount={totalSubjects}
          pageSize={SUBJECTS_PAGE_SIZE}
          paramName="s_page"
        />
      </CardFooter>
    </Card>
) }