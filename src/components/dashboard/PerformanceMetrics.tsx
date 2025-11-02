import { createServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {CheckCircle, type LucideIcon, Blend, HeartCrack, Cable } from "lucide-react";
import { cn } from "@/lib/utils";

async function getPerformanceStats() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: sessions, error } = await supabase
    .from('quiz_sessions')
    .select('score, total_questions')
    .eq('user_id', user.id)
    .not('completed_at', 'is', null);

  if (error || !sessions || sessions.length === 0) {
    return {
      totalQuestionsAnswered: 0,
      totalSessions: 0,
      averageAccuracy: 0,
  }; }
  
  const totalQuestionsAnswered = sessions.reduce((sum, s) => sum + s.total_questions, 0);
  const totalCorrectAnswers = sessions.reduce((sum, s) => sum + s.score, 0);
  const averageAccuracy = totalQuestionsAnswered > 0 
    ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) 
    : 0;

  return {
    totalQuestionsAnswered,
    totalSessions: sessions.length,
    averageAccuracy,
}; }

function getAccuracyBarColor(accuracy: number) {
  if (accuracy >= 80) return "bg-green-500 dark:bg-green-800";
  if (accuracy >= 60) return "bg-yellow-500 dark:bg-yellow-800";
  return "bg-red-500 dark:bg-red-800";
}

function getAccuracyTextColor(accuracy: number) {
  if (accuracy >= 80) return "text-green-500 dark:text-green-800";
  if (accuracy >= 60) return "text-yellow-500 dark:text-yellow-800";
  return "text-red-500 dark:text-red-800";
}


function KPICard({ title, value, description, icon: Icon, 
  percentage 
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  percentage?: number;
}) {

  const barWidth = percentage !== undefined ? percentage : 100;
  const barColor = percentage !== undefined ? getAccuracyBarColor(percentage) : "bg-primary";
  const textColor = percentage !== undefined ? getAccuracyTextColor(percentage) : undefined;

  return (
    <Card className="h-full">
      <CardHeader className="px-6 pt-0">
        <div className="flex items-center gap-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-3 text-center space-y-6 flex flex-col flex-grow justify-between">
        {/* MUDANÇA: 'cn' é usado para aplicar a 'textColor' dinâmica somente quando ela existir */}
        <p className={cn("text-3xl font-bold", textColor)}>
          {value}
        </p>
        
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div 
            className={cn("rounded-full h-2 transition-all duration-500", barColor)}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </CardContent>

    </Card>
); }

export default async function PerformanceMetrics() {
  const stats = await getPerformanceStats();

  if (!stats || stats.totalSessions === 0) {
    return (
      <Card className="border-2 border bg-card mt-8">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <HeartCrack className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">
            Sem sessões completadas.
          </h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Comece algum bloco de questões e volte depois... Suas estatísticas estarão aqui!
          </p>
        </CardContent>
      </Card>
  ); }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Card 1 e 2: Estáticos */}
      <KPICard
        title="Questões Resolvidas"
        value={stats.totalQuestionsAnswered}
        description="Soma de todas as perguntas respondidas desde o início."
        icon={CheckCircle}
      />      
      <KPICard
        title="Sessões Resolvidas"
        value={stats.totalSessions}
        description="Um número total dos conjuntos de questões completados."
        icon={Blend}
      />

      {/* Card 3: Dinâmico */}
      <KPICard
        title="Desempenho Médio"
        value={`${stats.averageAccuracy}%`}
        description="Percentual de acertos em todas as sessões."
        icon={Cable}
        percentage={stats.averageAccuracy}
      />
    </section>
); }