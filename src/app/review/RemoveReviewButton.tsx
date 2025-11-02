"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { removeQuestionFromReview } from "@/app/actions";

type Props = {
  questionId: string;
  questionStatement: string;
};

export default function RemoveReviewButton({
  questionId,
  questionStatement,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const truncatedStatement = questionStatement.substring(0, 70) + "...";
    const confirmation = `Tem certeza que deseja remover esta questão da sua revisão?\n\n"${truncatedStatement}"\n\nTodos os seus registros de ERRO para esta questão serão apagados.`;

    if (!confirm(confirmation)) {
      return;
    }

    startTransition(async () => {
      try {
        await removeQuestionFromReview(questionId);
      } catch (error) {
        console.error(error);
        alert(
          "Houve um erro ao tentar remover a questão. Tente novamente."
  ); } }); };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      className="text-muted-foreground hover:text-destructive"
      disabled={isPending}
      onClick={handleClick}
      title="Remover da revisão"
    >
      {isPending ? (
        <Loader2 className="size-6 animate-spin" />
      ) : (
        <Trash2 className="size-6" />
      )}
    </Button>
); }