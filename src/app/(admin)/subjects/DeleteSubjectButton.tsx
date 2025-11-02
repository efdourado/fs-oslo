"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSubject } from "../questions/actions";

export default function DeleteSubjectButton({ subjectId, subjectName }: { subjectId: string; subjectName: string; }) {
  const { pending } = useFormStatus();

  const deleteAction = deleteSubject.bind(null, subjectId);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const confirmation = `Tem certeza que deseja deletar a matéria "${subjectName}"?\n\nATENÇÃO: Isso deletará TODAS as questões, respostas de usuários e sessões de quiz associadas a ela. Esta ação é irreversível.`;
    if (!confirm(confirmation)) {
      e.preventDefault();
  } };

  return (
    <form action={deleteAction} onSubmit={handleSubmit}>
      <Button
        type="submit"
        variant="destructive"
        size="icon-sm"
        disabled={pending}
        aria-label="Deletar matéria"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </form>
); }