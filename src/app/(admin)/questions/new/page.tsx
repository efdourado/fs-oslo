'use client'

import { useState } from "react"
import { createQuestion } from "../actions"
import { Plus, Trash2, BookOpen, Tag, Building, FileText, Lightbulb } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export default function NewQuestionPage() {
  const [options, setOptions] = useState(["", ""])
  const [correctOption, setCorrectOption] = useState(0)
  const addOption = () => {
    setOptions([...options, ""])
  }
  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
      if (correctOption === index) {
        setCorrectOption(0)
      } else if (correctOption > index) {
        setCorrectOption(correctOption - 1)
  } } }
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }
  const formAction = async (formData: FormData) => {
    await createQuestion(formData);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
          Criar uma Questão
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Com mais questões, construímos um banco de estudo mais modular e eficiente.
        </p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Informações da Questão
          </CardTitle>
          <CardDescription>
            Preencha todos os campos obrigatórios para criar a questão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action={formAction} className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="flex items-center gap-2 text-sm font-medium">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  Matéria *
                </Label>
                <Input 
                  name="subject" 
                  id="subject" 
                  placeholder="Ex: Direito Administrativo" 
                  required 
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic" className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4 text-gray-500" />
                  Assunto *
                </Label>
                <Input 
                  name="topic" 
                  id="topic" 
                  placeholder="Ex: Atos Administrativos" 
                  required 
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Detalhes da Prova */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Detalhes da Prova
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banca" className="text-sm font-medium">Banca</Label>
                  <Input name="banca" id="banca" placeholder="Ex: FGV" className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ano" className="text-sm font-medium">Ano</Label>
                  <Input name="ano" id="ano" type="number" placeholder="2024" className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgao" className="text-sm font-medium">Órgão</Label>
                  <Input name="orgao" id="orgao" placeholder="Ex: Polícia Federal" className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo" className="text-sm font-medium">Cargo</Label>
                  <Input name="cargo" id="cargo" placeholder="Ex: Agente" className="rounded-lg" />
                </div>
              </div>
            </div>

            {/* Enunciado */}
            <div className="space-y-2">
              <Label htmlFor="statement" className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-gray-500" />
                Enunciado da Questão *
              </Label>
              <Textarea
                name="statement"
                id="statement"
                required
                placeholder="Digite o enunciado da questão aqui..."
                className="min-h-[120px] rounded-lg resize-none"
              />
            </div>

            {/* Opções de Resposta */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-gray-500" />
                Opções de Resposta *
              </Label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3 group">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="radio"
                        name="correctOptionIndex"
                        value={index}
                        checked={correctOption === index}
                        onChange={() => setCorrectOption(index)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Input
                        name={`option_${index}`}
                        placeholder={`Opção ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        required
                        className="rounded-lg flex-1"
                      />
                    </div>
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={addOption} 
                className="gap-2 rounded-lg border-dashed"
              >
                <Plus className="h-4 w-4" />
                Adicionar Opção
              </Button>
            </div>

            {/* Explicação */}
            <div className="space-y-2">
              <Label htmlFor="explanation" className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-gray-500" />
                Explicação
              </Label>
              <Textarea
                name="explanation"
                id="explanation"
                placeholder="Explique por que a resposta correta está certa..."
                className="min-h-[100px] rounded-lg resize-none"
              />
            </div>

            {/* Dicas */}
            <div className="space-y-2">
              <Label htmlFor="tips" className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-gray-500" />
                Dicas
              </Label>
              <Textarea
                name="tips"
                id="tips"
                placeholder="Adicione dicas ou mnemônicos sobre o assunto..."
                className="min-h-[100px] rounded-lg resize-none"
              />
            </div>

            {/* Botão de Submit */}
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium rounded-lg py-3 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Salvar Questão
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
) }