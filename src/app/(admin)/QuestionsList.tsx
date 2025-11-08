import { createServer } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Edit } from "lucide-react"
import Link from "next/link"
import PaginationControls from "./PaginationControls"

type RelationType = { name: string }
type Relation = RelationType | RelationType[] | null
const getRelationName = (relation: Relation): string | null => {
  if (Array.isArray(relation) && relation.length > 0) {
    return relation[0]?.name
  }
  if (relation && !Array.isArray(relation)) {
    return relation.name
  }
  return null
}

const QUESTIONS_PAGE_SIZE = 6

export default async function QuestionsList({
  currentPage,
  totalQuestions,
}: {
  currentPage: number
  totalQuestions: number
}) {
  const supabase = await createServer()
  const offset = (currentPage - 1) * QUESTIONS_PAGE_SIZE

  const {
    data: questions,
    error: questionsError,
  } = await supabase
    .from("questions")
    .select("id, statement, subjects (name), topics (name)")
    .order("created_at", { ascending: false })
    .range(offset, offset + QUESTIONS_PAGE_SIZE - 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banco de Questões</CardTitle>
        <CardDescription>
          {totalQuestions} questões encontradas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {questionsError && (
          <p className="text-destructive">Erro ao carregar questões.</p>
        )}
        {questions && questions.length > 0 ? (
          <ul className="divide-y divide-border">
            {questions.map((q) => {
              const subjectName = getRelationName(q.subjects)
              const topicName = getRelationName(q.topics)

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
            ) })}
          </ul>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4" />
            <p>Nenhuma questão encontrada.</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <PaginationControls
          currentPage={currentPage}
          totalCount={totalQuestions}
          pageSize={QUESTIONS_PAGE_SIZE}
          paramName="q_page"
        />
      </CardFooter>
    </Card>
) }