/* eslint-disable no-undef */
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Gift, Loader2 } from 'lucide-react'
import { createClient } from '@/app/utils/supabase/client'
import { FaGoogle } from 'react-icons/fa' // Lembre-se de instalar: npm install react-icons

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [referralCode, setReferralCode] = useState<string | null>(null)

  // Efeito que roda no cliente para ler o código de convite da URL
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setReferralCode(ref)
    }
  }, [searchParams])

  const handleEmailSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const supabase = createClient()

    // Envia os dados, incluindo o código de referência se ele existir
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          ...(referralCode && { referral_code: referralCode }),
        },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setIsSubmitting(false)
    } else {
      router.push('/confirm-email')
    }
  }
  
  // Função para lidar com o login social
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    const supabase = createClient();
    setIsSubmitting(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        // Passa o código de referência como query param
        queryParams: {
          ...(referralCode && { referral_code: referralCode }),
        }
      }
    });
    if (error) {
        setError(error.message);
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-neutral-900 rounded-lg shadow-lg border border-neutral-700">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-amber-500">
            Criar Conta
          </h1>
          <p className="text-neutral-300 mt-2">
            Junte-se à comunidade e comece a montar seus decks.
          </p>
        </header>

        {referralCode && (
          <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center text-sm text-green-300 flex items-center justify-center gap-2">
            <Gift className="h-5 w-5" />
            <p>Você foi convidado! Complete seu cadastro.</p>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6">
            <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FaGoogle className="mr-2 h-5 w-5" />}
                Continuar com Google
            </Button>
        </div>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-900 px-2 text-neutral-500">OU CONTINUE COM EMAIL</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignUp} className="space-y-6">
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Criar Conta com Email'}
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