'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogIn, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
  const [loadingAction, setLoadingAction] = useState<'signIn' | 'signUp' | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuthAction = async (action: 'signIn' | 'signUp') => {
    setLoadingAction(action)
    setMessage(null)

    const { data, error } = await supabase.auth[action === 'signIn' ? 'signInWithPassword' : 'signUp']({
      email,
      password,
      ...(action === 'signUp' && {
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
    }, }), })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } 
    
    else if (data.session) { 
      router.push('/dashboard')
      router.refresh()
    } 
    
    else if (action === 'signUp' && !data.session) { 
      setMessage({ type: 'success', text: 'Cadastro realizado! Verifique seu e-mail para confirmar a conta.' })
    }
    
    setLoadingAction(null)
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
    const action = submitter.value as 'signIn' | 'signUp';

    if (!email || !password) {
      setMessage({ type: 'error', text: 'E-mail e senha são obrigatórios.' });
      return;
    }

    handleAuthAction(action);
  };

  const wavyMaskSVG1 = "url(\"data:image/svg+xml,<svg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'><path d='M 0 40 C 20 40, 20 0, 40 0 S 60 40, 80 40' stroke='white' stroke-width='0.5' fill='none'/><path d='M 0 80 C 20 80, 20 40, 40 40 S 60 80, 80 80' stroke='white' stroke-width='0.5' fill='none'/></svg>\")";  
  const wavyMaskSVG2 = "url(\"data:image/svg+xml,<svg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'><path d='M 0 30 C 10 30, 20 0, 30 0 S 50 30, 60 30' stroke='white' stroke-width='0.5' fill='none'/><path d='M 0 60 C 10 60, 20 30, 30 30 S 50 60, 60 60' stroke='white' stroke-width='0.5' fill='none'/></svg>\")";

  const backgroundStyle = {
    maskImage: `${wavyMaskSVG1}, ${wavyMaskSVG2}`,
    WebkitMaskImage: `${wavyMaskSVG1}, ${wavyMaskSVG2}`,
    maskRepeat: "repeat, repeat",
    WebkitMaskRepeat: "repeat, repeat",
    maskPosition: "0 0, 25px 25px"
  };

  return (
    <div 
      className="w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-20 -mb-30 flex items-center justify-center p-4 bg-background relative overflow-hidden"
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      
      <div 
        aria-hidden="true" 
        className="absolute inset-0 z-0 bg-gradient-to-br from-blue-300 to-indigo-400 dark:from-blue-800 dark:to-indigo-900 opacity-30"
        style={backgroundStyle} 
      />
      
      <Card className="w-full max-w-sm md:max-w-md relative z-10 overflow-hidden shadow-xl bg-card">
        
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-300 to-indigo-400 dark:from-blue-800 dark:to-indigo-900" />
        
        <CardHeader className="text-center pt-10">

          <Link href="/" className="flex items-center justify-center space-x-1 group mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-indigo-400 dark:from-blue-800 dark:to-indigo-900 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <span className="text-white font-bold text-lg">Os</span>
            </div>
            <span className="text-lg font-semibold bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent transition-transform duration-200 group-hover:scale-105 dark:from-gray-100 dark:to-gray-400">
              lo
            </span>
          </Link>
          <CardTitle className="text-2xl font-semibold">
            Seja bem-vindo(a) de volta!
          </CardTitle>
          <CardDescription className="pt-1">
            Preparamos tudo para você, apenas entre ou crie sua conta para continuar, com e-mail e senha.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 px-6 pt-2 pb-6">
            {message && (
              <div className={`p-3 rounded-md text-sm font-medium ${
                message.type === 'error' 
                  ? 'bg-red-100/80 text-red-900 dark:bg-red-950/40 dark:text-red-300' 
                  : 'bg-green-100/80 text-green-900 dark:bg-green-950/40 dark:text-green-300'
              }`}>
                {message.text}
              </div>
            )}

            <div className="grid gap-3">
              <Label htmlFor="email">E-mail principal</Label>
              <Input 
                id="email"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="seu@email.com" 
                disabled={loadingAction !== null}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••" 
                  disabled={loadingAction !== null}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 p-6 pt-0">
            <Button 
              type="submit"
              name="action"
              value="signIn"
              className="w-full"
              disabled={loadingAction !== null}
            >
              {loadingAction === 'signIn' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entre em Oslo
                </>
              )}
            </Button>

            <div className="relative w-full my-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            <Button 
              type="submit"
              name="action"
              value="signUp"
              variant="outline" 
              className="w-full"
              disabled={loadingAction !== null}
            >
              {loadingAction === 'signUp' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Crie sua conta com um clique!
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
) }