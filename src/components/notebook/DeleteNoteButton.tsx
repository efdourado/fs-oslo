"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteNotebookEntry } from "@/app/actions"; 

type Props = {
  entryId: string;
  entryContent: string;
};

export default function DeleteNoteButton({
  entryId,
  entryContent,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const truncatedContent = entryContent.substring(0, 70) + "...";
    const confirmation = `Tem certeza que deseja apagar esta anotação?\n\n"${truncatedContent}"\n\nEsta ação é irreversível.`;

    if (!confirm(confirmation)) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteNotebookEntry(entryId);
      } catch (error) {
        console.error(error);
        alert(
          "Houve um erro ao tentar apagar a anotação. Tente novamente."
  ); } }); };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      className="text-muted-foreground hover:text-destructive"
      disabled={isPending}
      onClick={handleClick}
      title="Remover anotação"
    >
      {isPending ? (
        <Loader2 className="size-6 animate-spin" />
      ) : (
        <Trash2 className="size-6" />
      )}
    </Button>
); }