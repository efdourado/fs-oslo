"use client";

import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle, Home, Repeat } from "lucide-react";

export default function QuizResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subjectId = searchParams.get("subjectId");
  const total = searchParams.get("total");
  const correct = searchParams.get("correct");
  const sessionId = searchParams.get("sessionId");

  if (!total || !correct) {
    router.push("/dashboard");
    return null;
  }
  const totalQuestions = parseInt(total, 10);
  const correctAnswers = parseInt(correct, 10);
  const incorrectAnswers = totalQuestions - correctAnswers;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Quiz Finalizado!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            Confira seu desempenho nesta sessão.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-around items-center p-6 bg-secondary/50 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold">{correctAnswers}</span>
              <span className="text-sm text-muted-foreground">Acertos</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">{incorrectAnswers}</span>
              <span className="text-sm text-muted-foreground">Erros</span>
            </div>
          </div>
          <div>
            <p className="text-xl font-semibold">
              Seu aproveitamento foi de{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {accuracy}%
              </span>
            </p>
             {sessionId && (
              <p className="text-xs text-muted-foreground mt-2">
                ID da Sessão: {sessionId}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
          {subjectId && (
            <Link href={`/practice/${subjectId}`} className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <Repeat className="h-4 w-4" />
                Tentar Novamente
              </Button>
            </Link>
          )}
          <Link href="/dashboard" className="w-full">
            <Button className="w-full gap-2">
              <Home className="h-4 w-4" />
              Voltar ao Painel
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
); }