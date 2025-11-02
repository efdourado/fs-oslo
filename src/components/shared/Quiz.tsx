'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { saveAnswer, classifyError, createNotebookHighlight, createQuizSession, updateQuizSession } from '@/app/actions' 
import { Highlighter, Loader2 } from 'lucide-react'

type Option = { id: string; option_text: string; is_correct: boolean; }
type Question = { 
  id: string; 
  statement: string; 
  explanation: string | null; 
  subject_id: string; 
  options: Option[];
  banca: string | null;
  ano: number | null;
  orgao: string | null;
  cargo: string | null;
}
type QuizProps = { questions: Question[] }

export default function Quiz({ questions }: QuizProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [lastAnswerId, setLastAnswerId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState<{ correct: boolean }[]>([]);
  const router = useRouter()
  const [selection, setSelection] = useState<{ text: string; range: Range } | null>(null)
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const quizCardRef = useRef<HTMLDivElement>(null)
  const currentQuestion = questions[currentQuestionIndex]
  const correctOption = currentQuestion.options.find(opt => opt.is_correct)
  
  useEffect(() => {
    const startSession = async () => {
      try {
        const newSessionId = await createQuizSession(currentQuestion.subject_id);
        setSessionId(newSessionId);
      } catch (error) {
        console.error(error);
        // um tratamento de erro para o usuário, se necessário
      }
    };
    startSession();
  }, [currentQuestion.subject_id]);


  useEffect(() => {
    const handleMouseUp = () => {
      const currentSelection = window.getSelection();
      const selectedText = currentSelection?.toString().trim();

      if (selectedText && currentSelection && currentSelection.rangeCount > 0) {
        const range = currentSelection.getRangeAt(0);
        const cardRect = quizCardRef.current?.getBoundingClientRect();
        
        if (cardRect && quizCardRef.current?.contains(range.commonAncestorContainer)) {
          const rect = range.getBoundingClientRect();
          setSelection({ text: selectedText, range });
          setPopupPosition({
            top: rect.top - cardRect.top - 40,
            left: rect.left - cardRect.left + rect.width / 2,
      }); } } else {
        setSelection(null);
    } };

    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentQuestionIndex]);
  
  const highlightSelection = () => {
    if (!selection) return;
    const span = document.createElement('span');
    span.className = 'bg-yellow-200/70 dark:bg-yellow-700/70 rounded';
    try {
      selection.range.surroundContents(span);
    } catch {
      span.appendChild(selection.range.extractContents());
      selection.range.insertNode(span);
    }
    window.getSelection()?.removeAllRanges();
  }

  const handleHighlight = () => {
    if (!selection) return;
    highlightSelection();
    startTransition(async () => {
      try {
        await createNotebookHighlight(currentQuestion.id, currentQuestion.subject_id, selection.text);
      } catch (error) {
        console.error(error);
      } finally {
        setSelection(null);
  } }); }

  const handleOptionSelect = (optionId: string) => {
    if (isAnswered) return
    setSelectedOptionId(optionId)
  }

  const handleCheckAnswer = () => {
    if (!selectedOptionId || !sessionId) return
    const correct = selectedOptionId === correctOption?.id
    setIsCorrect(correct)
    setIsAnswered(true)
    
    setResults(prev => [...prev, { correct }]);

    startTransition(async () => {
      const newAnswerId = await saveAnswer(currentQuestion.id, selectedOptionId, correct, sessionId)
      if (newAnswerId) {
        setLastAnswerId(newAnswerId)
  } }) }
  
  const handleClassifyError = (errorType: 'attention' | 'knowledge') => {
    if (!lastAnswerId) return;
    startTransition(async () => {
        await classifyError(lastAnswerId, errorType);
        setLastAnswerId(null); 
  }); }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedOptionId(null)
      setIsAnswered(false)
      setLastAnswerId(null)
      setIsCorrect(false)
      setSelection(null)
    } else {
      const correctCount = results.filter(r => r.correct).length;
      const totalCount = questions.length;
      const subjectId = currentQuestion.subject_id;
      
      if (sessionId) {
        startTransition(async () => {
          await updateQuizSession(sessionId, correctCount, totalCount);
          router.push(`/practice/results?correct=${correctCount}&total=${totalCount}&subjectId=${subjectId}&sessionId=${sessionId}`);
        });
      } else {
        router.push(`/practice/results?correct=${correctCount}&total=${totalCount}&subjectId=${subjectId}`);
  } } }

  if (!sessionId) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Iniciando o quiz...</p>
      </div>
  ); }
  
  return (
    <Card className="w-full max-w-3xl mx-auto relative" ref={quizCardRef}>
      {selection && (
        <div className="absolute z-10" style={{ top: popupPosition.top, left: popupPosition.left, transform: 'translateX(-50%)' }}>
          <Button size="sm" onClick={handleHighlight} disabled={isPending}>
            <Highlighter className="size-4 mr-2" />
            Grifar
          </Button>
        </div>
      )}

      <CardHeader>
        <CardTitle>Questão {currentQuestionIndex + 1} de {questions.length}</CardTitle>
        
        {(currentQuestion.banca || currentQuestion.ano || currentQuestion.orgao) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-sm text-muted-foreground">
              {currentQuestion.banca && <Badge variant="outline">{currentQuestion.banca}</Badge>}
              {currentQuestion.ano && <Badge variant="outline">{currentQuestion.ano}</Badge>}
              {currentQuestion.orgao && <Badge variant="secondary">{currentQuestion.orgao}</Badge>}
              {currentQuestion.cargo && <Badge variant="secondary">{currentQuestion.cargo}</Badge>}
          </div>
        )}

        <CardDescription className="text-base text-foreground pt-4">
          {currentQuestion.statement}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-3">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          const isOptionCorrect = option.id === correctOption?.id;
          return (
            <Button
              key={option.id}
              variant="outline"
              className={cn(
                "justify-start text-left h-auto py-3 px-4 whitespace-normal transition-all duration-300",
                isAnswered && isOptionCorrect && 'bg-green-100 border-green-400 text-green-900 hover:bg-green-200 dark:bg-green-950 dark:border-green-700 dark:text-green-300',
                isAnswered && isSelected && !isOptionCorrect && 'bg-red-100 border-red-400 text-red-900 hover:bg-red-200 dark:bg-red-950 dark:border-red-700 dark:text-red-300',
                !isAnswered && isSelected && 'bg-accent border-primary/50'
              )}
              onClick={() => handleOptionSelect(option.id)}
              disabled={isAnswered || isPending}
            >
              {option.option_text}
            </Button>
        ) })}
      </CardContent>

      {isAnswered && (
        <CardFooter className="flex-col items-start gap-4 pt-4 border-t">
          <h3 className="font-semibold">Explicação:</h3>
          <p className="text-sm text-muted-foreground">
            {currentQuestion.explanation || "Nenhuma explicação fornecida."}
          </p>

          {!isCorrect && lastAnswerId && (
            <div className="w-full pt-4 mt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Por que você errou?</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleClassifyError('attention')} disabled={isPending || !lastAnswerId}>
                  Falta de Atenção
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleClassifyError('knowledge')} disabled={isPending || !lastAnswerId}>
                  Não Sabia o Conteúdo
                </Button>
              </div>
            </div>
          )}
        </CardFooter>
      )}

      <CardFooter className="pt-6">
        {isAnswered ? (
          <Button onClick={handleNextQuestion} className="w-full" disabled={isPending}>
             {isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Finalizando...</>
            ) : currentQuestionIndex === questions.length - 1 ? "Finalizar Quiz" : "Próxima Questão"}
          </Button>
        ) : (
          <Button onClick={handleCheckAnswer} disabled={!selectedOptionId || isPending} className="w-full">
            {isPending ? "Salvando..." : "Verificar Resposta"}
          </Button>
        )}
      </CardFooter>
    </Card>
) }