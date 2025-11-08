import { Suspense } from "react"
import AdminStatsHeader from "../AdminStatsHeader"
import AdminStatsHeaderSkeleton from "../AdminStatsHeaderSkeleton"
import QuestionsList from "../QuestionsList"
import SubjectsList from "../SubjectsList"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { createServer } from "@/lib/supabase/server"

type SubjectStat = {
  id: string
  name: string
  question_count: number
  session_count: number
  average_accuracy: number
}

type AdminDashboardPageProps = {
  params: Promise<Record<string, never>>; 
  searchParams: Promise<{
    q_page?: string | string[] | undefined
    s_page?: string | string[] | undefined
}> }

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const resolvedSearchParams = await searchParams
  const qPage = Number(resolvedSearchParams?.q_page || "1")
  const sPage = Number(resolvedSearchParams?.s_page || "1")
  const supabase = await createServer()

  const { count: totalQuestions } = await supabase
    .from("questions")
    .select("*", { count: "exact", head: true })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let totalSubjects = 0
  if (user) {
    const { data: subjectData } = await supabase.rpc("get_subject_stats", {
      p_user_id: user.id,
    })
    if (subjectData) {
      totalSubjects = (subjectData as SubjectStat[]).length
  } }

  return (
    <div className="space-y-12">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard (Questões & Sessões)</h1>
        <p className="mt-2 text-muted-foreground">
          Gerencie questões e sessões encontradas no banco de dados.
        </p>
      </div>

      {/* 2. Estatísticas */}
      <Suspense fallback={<AdminStatsHeaderSkeleton />}>
        <AdminStatsHeader />
      </Suspense>

      {/* 3. Questões */}
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        }
      >
        <div className="my-12">
          <h1 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
            Banco de Questões
          </h1>
          <p className="mt-2 text-muted-foreground">
            Com {totalQuestions || 0} questões cadastradas!
          </p>
        </div>
        <QuestionsList currentPage={qPage} totalQuestions={totalQuestions || 0} />
      </Suspense>

      {/* 4. Sessões */}
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        }
      >
        <div className="my-12">
          <h1 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
            Banco de Sessões
          </h1>
          {/* --- LINHA ALTERADA --- */}
          <p className="mt-2 text-muted-foreground">
            Com {totalSubjects || 0} matérias mapeadas!
          </p>
        </div>

        <SubjectsList currentPage={sPage} totalSubjects={totalSubjects || 0} />
      </Suspense>
    </div>
) }