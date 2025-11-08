import { createServer } from "@/lib/supabase/server";
import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LayoutPanelLeft,
  Logs,
  TextAlignStart,
  Bookmark,
  AlertCircle,
} from "lucide-react";
import NewNoteForm from "@/components/notebook/NewNoteForm";
import DeleteNoteButton from "@/components/notebook/DeleteNoteButton";

type NotebookEntry = {
  id: string;
  content: string;
  entry_type: "highlight" | "user_note";
  subjects: {
    name: string;
  } | null;
  questions: {
    statement: string;
  }[] | null;
  created_at: string;
};

type Subject = {
  id: string;
  name: string;
};

function NewNoteCardSkeleton() {
  return (
    <Card className="border-2 border-dashed border-muted-foreground/30 relative overflow-hidden opacity-70 animate-pulse">
      <CardHeader className="px-6 pt-0">
        <div className="flex items-center gap-3">
          <TextAlignStart className="h-6 w-6 text-muted-foreground" />
          <div>
            <CardTitle className="text-lg">Notas</CardTitle>
            <CardDescription>
              Clique e adicione uma outra anotação pessoal!
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-3 text-center space-y-6">
        <p className="text-3xl font-bold">...</p>
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div className="rounded-full h-2 bg-blue-300/50 dark:bg-blue-800/50" style={{ width: `50%` }} />
        </div>
      </CardContent>
      <div className="absolute -top-2 right-5">
        <Bookmark className="h-10 w-10 fill-blue-300/50 text-blue-300/50 dark:fill-blue-800/50 dark:text-blue-800/50" />
      </div>
    </Card>
); }

export default async function NotebookPage() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>Usuário não autenticado.</p>;
  }

  const [subjectsResult, entriesResult] = await Promise.all([
    supabase.from("subjects").select("id, name"),
    supabase
      .from("notebook_entries")
      .select(
        `
        id,
        content,
        entry_type,
        created_at,
        subjects (name),
        questions (statement)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const { data: subjectsData, error: subjectsError } = subjectsResult;
  const { data: allEntries, error: entriesError } = entriesResult;

  if (subjectsError) {
    console.error("Erro ao buscar matérias:", subjectsError.message);
  }
  
  const error = entriesError;
  const subjects = (subjectsData || []) as Subject[];
  const typedEntries = (allEntries || []) as unknown as NotebookEntry[];
  
  const groupedBySubject = typedEntries.reduce(
    (acc, entry) => {
      const subjectName = entry.subjects?.name || "Sem Matéria";
      if (!acc[subjectName]) {
        acc[subjectName] = [];
      }
      acc[subjectName].push(entry);
      return acc;
    },
    {} as Record<string, NotebookEntry[]>
  );

  const totalEntries = typedEntries.length;
  const highlightsCount = typedEntries.filter(
    (entry) => entry.entry_type === "highlight"
  ).length;
  const notesCount = typedEntries.filter(
    (entry) => entry.entry_type === "user_note"
  ).length;

  return (
    <div className="space-y-12">
      {/* --- Header --- */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
          Meu Caderno Digital
        </h1>
        <p className="mt-2 text-muted-foreground">
          Espaço para rabiscos, grifos e anotações pessoais.
        </p>
      </div>

      {/* --- Conteúdo --- */}
      <section>
        {error ? (
          // --- Erro ---
          <Card className="border-2 border border-destructive/50 bg-destructive/5 mt-8">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-destructive">
                Ocorreu um erro...
              </h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Erro ao buscar seu caderno. Detalhe: {error.message}
              </p>
            </CardContent>
          </Card>
        ) : totalEntries === 0 ? (

          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                 <CardHeader className="px-6 pt-0">
                    <div className="flex items-center gap-3">
                      <LayoutPanelLeft className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">Registros Totais</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                <CardContent className="p-6 pt-3 text-center">
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="px-6 pt-0">
                    <div className="flex items-center gap-3">
                      <Logs className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <CardTitle className="text-lg">Grifos</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                <CardContent className="p-6 pt-3 text-center">
                  <p className="text-3xl font-bold">0</p>
                </CardContent>
              </Card>

              <Suspense fallback={<NewNoteCardSkeleton />}>
                <NewNoteForm subjects={subjects}>
                  <Card className="border-2 border-blue-300 dark:border-blue-800 relative overflow-hidden cursor-pointer shadow-lg hover:shadow-xl hover:scale-101 transition-all duration-300">
                    <CardHeader className="px-6 pt-0">
                      <div className="flex items-center gap-3">
                        <TextAlignStart className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">Notas</CardTitle>
                          <CardDescription>
                            Clique e adicione uma outra anotação pessoal!
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-3 text-center space-y-6">
                      <p className="text-3xl font-bold">{notesCount}</p>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className="rounded-full h-2 bg-blue-300 dark:bg-blue-800 transition-all duration-500"
                          style={{ width: `0%` }}
                        />
                      </div>
                    </CardContent>
                    <div className="absolute -top-2 right-5">
                      <Bookmark className="h-10 w-10 fill-blue-300 text-blue-300 dark:fill-blue-800 dark:text-blue-800" />
                    </div>
                  </Card>
                </NewNoteForm>
              </Suspense>
            </div>
            
            <Card className="border-2 border bg-card mt-8">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <LayoutPanelLeft className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  Caderno limpo!
                </h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Ao resolver questões, selecione textos e clique em
                  &quot;Grifar&quot;; ou crie anotações soltas.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="px-6 pt-0">
                  <div className="flex items-center gap-3">
                    <LayoutPanelLeft className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">Registros Totais</CardTitle>
                      <CardDescription>Grifos e anotações.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-3 text-center space-y-6">
                  <p className="text-3xl font-bold">{totalEntries}</p>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="rounded-full h-2 bg-primary"
                      style={{ width: `100%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="px-6 pt-0">
                  <div className="flex items-center gap-3">
                    <Logs className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">Grifos</CardTitle>
                      <CardDescription>
                        Destaques das questões.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-3 text-center space-y-6">
                  <p className="text-3xl font-bold">{highlightsCount}</p>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="rounded-full h-2 bg-yellow-500 dark:bg-yellow-800"
                      style={{
                        width: `${
                          totalEntries > 0
                            ? (highlightsCount / totalEntries) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Suspense fallback={<NewNoteCardSkeleton />}>
                <NewNoteForm subjects={subjects}>
                  <Card className="pt-0 border-2 border-blue-300 dark:border-blue-800 relative overflow-hidden cursor-pointer shadow-lg hover:shadow-xl hover:scale-101 transition-all duration-300">
                    <CardHeader className="px-6 pt-5 pb-2 bg-blue-300 dark:bg-blue-800">
                      <div className="flex items-center gap-3">
                        <TextAlignStart className="h-6 w-6" />
                        <div>
                          <CardTitle className="text-lg">Notas</CardTitle>
                          <CardDescription className="text-foreground">
                            Clique e adicione uma outra anotação pessoal!
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 -mt-4 text-center space-y-6">
                      <p className="text-3xl font-bold">{notesCount}</p>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className="rounded-full h-2 bg-primary transition-all duration-500"
                          style={{
                            width: `${
                              totalEntries > 0
                                ? (notesCount / totalEntries) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </NewNoteForm>
              </Suspense>
            </div>

            <div className="space-y-12">
              {Object.entries(groupedBySubject).map(([subject, entries]) => (
                <div key={subject} className="space-y-12">
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
                      Sessão: {subject}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                      Com {entries.length}{" "}
                      {entries.length === 1 ? "registro" : "registros"}!
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {entries.map((entry) => (
                      <Card
                        key={entry.id}
                        className="hover:shadow-md transition-shadow relative group"
                      >
                        <div className="absolute top-6 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DeleteNoteButton
                            entryId={entry.id}
                            entryContent={entry.content}
                          />
                        </div>

                        <CardHeader className="">
                          <div className="flex items-center gap-3">
                            {entry.entry_type === "highlight" ? (
                              <Logs className="h-6 w-6 text-muted-foreground" />
                            ) : (
                              <TextAlignStart className="h-6 w-6 text-muted-foreground" />
                            )}
                            <div>
                              <CardTitle className="text-lg">
                                {entry.entry_type === "highlight"
                                  ? "Grifo"
                                  : "Nota Pessoal"}
                              </CardTitle>

                              <CardDescription>
                                Registro escrito em:{" "}
                                {(() => {
                                  const dateStr = new Date(
                                    entry.created_at
                                  ).toLocaleDateString("pt-BR", {
                                    weekday: "long",
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  });

                                  return (
                                    dateStr.charAt(0).toUpperCase() +
                                    dateStr.slice(1)
                                  );
                                })()}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <blockquote className="text-sm p-3 bg-accent rounded-lg border-l-4 border-blue-300 dark:border-blue-800 mt-2">
                            <p className="text-accent-foreground/90 whitespace-pre-wrap">
                              {entry.entry_type === "highlight"
                                ? `"${entry.content}"`
                                : entry.content}
                            </p>
                          </blockquote>

                          {entry.entry_type === "highlight" &&
                            entry.questions?.[0] && (
                              <div className="pt-4 border-t mt-6">
                                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                                  Fonte da Questão:
                                </h4>
                                <p className="text-sm p-3 bg-accent rounded-lg border">
                                  {entry.questions[0].statement}
                                </p>
                              </div>
                            )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
); }