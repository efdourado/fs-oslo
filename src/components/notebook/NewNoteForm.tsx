"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { createNotebookNote } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Subject = {
  id: string;
  name: string;
};

type NewNoteFormProps = {
  subjects: Subject[];
  children: React.ReactNode;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar Anotação"}
    </Button>
); }

export default function NewNoteForm({ subjects, children }: NewNoteFormProps) {
  const [open, setOpen] = useState(false);

  const handleAction = async (formData: FormData) => {
    await createNotebookNote(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Anotação Pessoal</DialogTitle>
          <DialogDescription>
            Escolha uma matéria e escreva sua anotação. Ela ficará salva no seu
            caderno.
          </DialogDescription>
        </DialogHeader>
        <form action={handleAction}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subjectId">Matéria</Label>
              <Select name="subjectId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma matéria" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="noteContent">Sua Anotação</Label>
              <Textarea
                id="noteContent"
                name="noteContent"
                required
                placeholder="Escreva sua anotação aqui..."
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
); }