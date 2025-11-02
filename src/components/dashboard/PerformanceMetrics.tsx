import { createServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import RecentSessions from "./RecentSessions";
import {CheckCircle, type LucideIcon, Blend, HeartCrack } from "lucide-react";

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
  }; }
  
  const totalQuestionsAnswered = sessions.reduce((sum, s) => sum + s.total_questions, 0);

  return {
    totalQuestionsAnswered,
    totalSessions: sessions.length,
}; }

function KPICard({ title, value, description, icon: Icon }: {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
}) {
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
        <p className="text-3xl font-bold">{value}</p>
        
        <div className="w-full bg-secondary rounded-full h-2">
          <div className="bg-primary rounded-full h-2 w-full"></div>
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
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
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
      </div>

      <div className="lg:col-span-2">
        <RecentSessions />
      </div>
    </section>
); }