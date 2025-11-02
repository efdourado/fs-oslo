import { createServer } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, GitCompare } from "lucide-react";

type SessionFromRPC = {
  id: string;
  completed_at: string;
  score: number;
  total_questions: number;
  subjects: { name: string; } | { name: string; }[] | null;
};
type Session = {
  id: string;
  completed_at: string;
  score: number;
  total_questions: number;
  subjects: {
    name: string;
} | null; };

async function getRecentSessions() {
  const supabase = await createServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;
  const { data: sessions, error } = await supabase
    .from('quiz_sessions')
    .select(`
      id,
      completed_at,
      score,
      total_questions,
      subjects (name)
    `)
    .eq('user_id', user.id)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Erro ao buscar sessões recentes:", error);
    return null;
  }
  const formattedSessions = sessions?.map((s: SessionFromRPC) => ({
    ...s,
    subjects: Array.isArray(s.subjects) ? s.subjects[0] : s.subjects,
  }));

  return formattedSessions as Session[];
}

function AccuracyBadge({ accuracy }: { accuracy: number }) {
  const color = accuracy >= 80 ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : 
                accuracy >= 60 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" : 
                                 "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300";

  return (
    <Badge className={`rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      {accuracy}%
    </Badge>
  );
}

export default async function RecentSessions() {
  const sessions = await getRecentSessions();

  if (!sessions || sessions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="px-6 pt-0">
        <div className="flex items-center gap-3">
          <History className="h-6 w-6 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg">Sessões Recentes</CardTitle>
            <CardDescription>Seu histórico com as últimas 5 sessões de questões.</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flow-root mt-2">
          <ul className="-my-4 divide-y divide-border">
            {sessions.map((session) => {
              const accuracy = session.total_questions > 0 
                ? Math.round((session.score / session.total_questions) * 100) 
                : 0;
              
              return (
                <li key={session.id} className="flex items-center space-x-4 py-4">
       
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {session.subjects?.name || 'Sessão desconhecida'}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                       {new Date(session.completed_at).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <AccuracyBadge accuracy={accuracy} />

                     <div className="text-right">
                        <p className="text-sm font-semibold">{session.score} de {session.total_questions}</p>
                        <p className="text-xs text-muted-foreground">acertos potenciais.</p>
                     </div>
                  </div>

                  
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <GitCompare className="h-5 w-5 text-primary" />
                  </div>
                </li>
            ); })}
          </ul>
        </div>
      </CardContent>
    </Card>
); }