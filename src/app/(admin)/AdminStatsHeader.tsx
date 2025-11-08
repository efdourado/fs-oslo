import { createServer } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Users, RollerCoaster, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import NewBatchQuestionForm from "./NewBatchQuestionForm";

async function getStats() {
  const supabase = await createServer();
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats");

  if (error) {
    console.error("Erro ao buscar estatísticas de admin:", error);
    return null;
  }
  return data[0];
}

function KPICard({
  title,
  value,
  description,
  icon: Icon,
  barColor = "bg-primary",
  className,
  cardHeaderClassName = "px-6 pt-0",
  iconClassName = "h-6 w-6 text-muted-foreground",
  CardDescriptionClassName,
  cardContentClassName = "p-6 pt-3 text-center space-y-6",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  barColor?: string;
  className?: string;
  cardHeaderClassName?: string;
  iconClassName?: string;
  CardDescriptionClassName?: string;
  cardContentClassName?: string;
}) {
  return (
    <Card className={cn(className)}>
      <CardHeader className={cn(cardHeaderClassName)}>
        <div className="flex items-center gap-3">
          <Icon className={cn(iconClassName)}/>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className={cn(CardDescriptionClassName)}>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn(cardContentClassName)}>
        <p className="text-3xl font-bold">{value}</p>

        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className={cn("rounded-full h-2 transition-all", barColor)}
            style={{ width: `100%` }}
          />
        </div>
      </CardContent>
    </Card>
); }

export default async function AdminStatsHeader() {
  const stats = await getStats();

  if (!stats) {
    return (
      <Card className="border-2 border-dashed border-destructive/50 bg-destructive/5 my-8">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-destructive">
            Erro ao carregar estatísticas
          </h3>
          <p className="text-muted-foreground">
            Não foi possível buscar os insights do painel de administração.
          </p>
        </CardContent>
      </Card>
  ); }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <KPICard
        title="Total de Cadastros"
        value={stats.total_users}
        description="Usuários registrados na plataforma."
        icon={Users}
      />
      <KPICard
        title="Total de Sessões"
        value={stats.total_subjects}
        description="Sessões disponíveis para estudo."
        icon={RollerCoaster}
      />

      <NewBatchQuestionForm>
        <KPICard
          title="Total de Questões"
          value={stats.total_questions}
          description="Clique e adicione uma outra questão!"
          icon={PlusCircle}
          className="pt-0 border-2 border-blue-300 dark:border-blue-800 relative overflow-hidden cursor-pointer shadow-lg hover:shadow-xl hover:scale-101 transition-all duration-300 h-full"
          cardHeaderClassName="px-6 pt-5 pb-2 bg-blue-300 dark:bg-blue-800"
          iconClassName=""
          CardDescriptionClassName="text-foreground"
          cardContentClassName="p-6 -mt-4 text-center space-y-6"
        />
      </NewBatchQuestionForm>
    </div>
); }