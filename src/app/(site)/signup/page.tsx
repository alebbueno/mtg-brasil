/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/signup/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { createClient } from '@/app/(site)/utils/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        // A URL de confirmação que o usuário receberá no email.
        // O usuário precisa clicar nela para confirmar a conta.
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Signup Error:', error)
      setError(error.message)
      setIsSubmitting(false)
    } else {
      // O Supabase enviará um email de confirmação.
      // Você pode redirecionar para uma página de "verifique seu email" aqui.
      router.push('/confirm-email') // Crie esta página informativa
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-neutral-900 rounded-lg shadow-lg border border-neutral-700">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-amber-500">
            Criar Conta
          </h1>
          <p className="text-neutral-300 mt-2">
            Junte-se à comunidade e salve suas cartas favoritas.
          </p>
        </header>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-neutral-800 border-neutral-600 focus:ring-amber-500"
              placeholder="Seu nome completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-neutral-800 border-neutral-600 focus:ring-amber-500"
              placeholder="seu.email@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-neutral-800 border-neutral-600 focus:ring-amber-500"
              placeholder="••••••••"
            />
            <p className="text-xs text-neutral-500">Mínimo de 6 caracteres.</p>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro no Cadastro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full bg-amber-500 text-black hover:bg-amber-600" disabled={isSubmitting}>
            {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-neutral-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-medium text-amber-500 hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
