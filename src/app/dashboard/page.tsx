import { createServer } from "@/lib/supabase/server";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type SubjectStat = {
  id: string;
  name: string;
  question_count: number;
  session_count: number;
  average_accuracy: number;
};

function SubjectCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
); }

function SubjectCard({ subject }: { subject: SubjectStat }) {
  const accuracyColor =
    subject.average_accuracy >= 80
      ? "text-green-500 dark:text-green-800"
      : subject.average_accuracy >= 60
      ? "text-yellow-500 dark:text-yellow-800"
      : "text-red-500 dark:text-red-800";

  const barBgColor =
    subject.average_accuracy >= 80
      ? "bg-green-500 dark:bg-green-800"
      : subject.average_accuracy >= 60
      ? "bg-yellow-500 dark:bg-yellow-800"
      : "bg-red-500 dark:bg-red-800";

  return (
    <Link href={`/practice/${subject.id}`} className="w-full">
      <Card className="flex flex-col h-full border-2 border-blue-300 dark:border-blue-800 transition-transform duration-200 transform hover:scale-101 hover:shadow-lg cursor-pointer pb-0">
        <CardHeader className="px-6 pt-0">
          <div className="flex items-center gap-3">
            <Book className="h-6 w-6 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">{subject.name}</CardTitle>
              <CardDescription>
                Com um total de {subject.question_count}{" "}
                {subject.question_count === 1
                  ? "questão disponível."
                  : "questões disponíveis."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow px-6 pb-4">
          {subject.session_count > 0 ? (
            <div className="py-3 space-y-6">
              <div className="flex items-center justify-between px-28 text-center">
                <div>
                  <div className="text-3xl font-bold">
                    {subject.session_count}
                  </div>
                  <div className="text-xs text-muted-foreground">sessões feitas.</div>
                </div>

                <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />

                <div>
                  <div className={`text-3xl font-bold ${accuracyColor}`}>
                    {Math.round(subject.average_accuracy)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    de acertos totais.
                  </div>
                </div>
              </div>

              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className={cn("rounded-full h-2 transition-all", barBgColor)}
                  style={{
                    width: `${subject.average_accuracy}%`,
                  }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="text-center pt-3">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-300 to-indigo-400 dark:from-blue-800 dark:to-indigo-900 rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm text-muted-foreground">Iniciar sessão...</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-0">
          <Button className="w-full rounded-t-none pointer-events-none">
            {subject.session_count > 0
              ? "Continuar Praticando"
              : "Começar a Praticar"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
); }

function EmptySubjectsState() {
  return (
    <div className="text-center rounded-2xl border-2 border-dashed col-span-1 md:col-span-2 lg:col-span-3 border-muted-foreground/30 p-12 md:p-16">
      <h3 className="text-xl font-semibold mb-2">Nenhuma matéria encontrada</h3>
      <p className="text-muted-foreground max-w-md mx-auto">
        Não foram encontradas matérias com questões disponíveis. Peça ao administrador para adicionar novo conteúdo.
      </p>
    </div>
); }

async function SubjectsList() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: subjects, error } = await supabase.rpc("get_subject_stats", {
    p_user_id: user!.id,
  });

  if (error) {
    console.error("Erro ao buscar estatísticas das matérias:", error);
  }

  return (
    <>
      <div className="mb-12">
        <div>
          <h2 className="text-3xl font-bold">Banco de Estudo (Questões)</h2>
          {subjects && (
            <p className="mt-2 text-muted-foreground">
              Com{' '} {subjects.length}{" "} {subjects.length === 1 ? "matéria encontrada" : "matérias encontradas"}!
            </p>
          )}
        </div>
      </div>

      {subjects && subjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(subjects as SubjectStat[]).map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      ) : (
        <EmptySubjectsState />
      )}
    </>
); }

export default function DashboardPage() {
  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Inicial</h1>
        <p className="mt-2 text-muted-foreground">
          Mapeie seu progresso e descubra o que ainda pode evoluir!
        </p>
      </div>

      {/* Performance Section */}
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        }
      >
        <PerformanceMetrics />
      </Suspense>

      {/* Subjects Section */}
      <section>
        <Suspense
          fallback={
            <>
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-8 w-32" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:col-span-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SubjectCardSkeleton key={i} />
                ))}
              </div>
            </>
          }
        >
          <SubjectsList />
        </Suspense>
      </section>
    </div>
); }