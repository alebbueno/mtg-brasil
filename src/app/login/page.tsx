/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Chrome } from 'lucide-react'
import { createClient } from '@/app/utils/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Aguarda um pequeno atraso para garantir que a sessão seja propagada
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log('Login com email/senha bem-sucedido')

      // Força a revalidação dos Server Components e redireciona
      router.refresh()
      router.push('/')

    } catch (error: any) {
      console.error('Login Error:', error)
      if (error.message === 'Invalid login credentials') {
        setError('Email ou senha inválidos. Por favor, verifique os seus dados.')
      } else {
        setError(error.message || 'Ocorreu um erro inesperado.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoginWithGoogle = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        throw error
      }
      console.log('Iniciando login com Google')
    } catch (error: any) {
      console.error('Google Login Error:', error)
      setError(error.message || 'Erro ao fazer login com Google.')
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-neutral-950"
      style={{
        backgroundImage: `radial-gradient(circle at top right, rgba(217, 119, 6, 0.1), transparent 40%),
                          radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1), transparent 50%)`,
      }}
    >
      <div className="w-full max-w-md p-8 space-y-8 bg-neutral-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-neutral-700/60">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-amber-400">
            Bem-vindo de volta!
          </h1>
          <p className="text-neutral-300 mt-2">
            Faça login para continuar a sua jornada.
          </p>
        </header>

        <Button
          onClick={handleLoginWithGoogle}
          variant="outline"
          className="w-full text-lg py-6 bg-white text-black hover:bg-neutral-200 flex items-center gap-3 transition-transform hover:scale-105"
        >
          <Chrome size={22} />
          Continuar com Google
        </Button>

        <div className="flex items-center">
          <div className="flex-grow border-t border-neutral-700"></div>
          <span className="flex-shrink mx-4 text-neutral-500 text-xs uppercase">OU</span>
          <div className="flex-grow border-t border-neutral-700"></div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neutral-400">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-neutral-800 border-neutral-700 focus:ring-amber-500 focus:border-amber-500"
              placeholder="seu.email@exemplo.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-neutral-400">Senha</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-amber-400 hover:underline"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 bg-neutral-800 border-neutral-700 focus:ring-amber-500 focus:border-amber-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro no Login</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full text-lg py-6 bg-amber-500 text-black hover:bg-amber-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'A entrar...' : 'Entrar com Email'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-neutral-400">
            Não tem uma conta?{' '}
            <Link href="/signup" className="font-medium text-amber-400 hover:underline">
              Registe-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}