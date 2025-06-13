/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-console */
/* eslint-disable no-undef */
// app/profile/page.tsx
'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Check, Image as ImageIcon, Loader2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Tipagem para os dados do perfil, garantindo que os campos podem ser nulos
type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  birth_date: string | null
  cover_image_url: string | null
  cover_position_y: number | null // Nova propriedade para a posição da capa
  favorite_colors: string[] | null
  favorite_formats: string[] | null
  social_links: { twitter?: string; instagram?: string; } | null
}

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Estados para a funcionalidade de arrastar a imagem de capa
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ y: 0, position: 50 })

  // Função para buscar os dados do perfil do utilizador
  const getProfile = useCallback(async (user: User) => {
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setProfile(data)
      }
    } catch (error: any) {
      console.error('Error loading user data!', error)
      setMessage({ type: 'error', text: 'Não foi possível carregar os dados do perfil.' })
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Efeito para buscar o utilizador e o seu perfil ao carregar a página
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        getProfile(user)
      } else {
        // Se não houver utilizador, redireciona para a página de login
        router.push('/login');
      }
    }
    fetchUserAndProfile()
  }, [supabase, getProfile, router])

  // Função para ATUALIZAR os dados do perfil (texto, datas, etc.)
  const updateProfile = async () => {
    if (!user || !profile) return

    setUpdating(true)
    setMessage(null)

    try {
      const updates = {
        id: user.id,
        username: profile.username,
        full_name: profile.full_name,
        bio: profile.bio,
        birth_date: profile.birth_date,
        cover_position_y: profile.cover_position_y, // Guardar a nova posição da capa
        favorite_colors: profile.favorite_colors,
        favorite_formats: profile.favorite_formats,
        social_links: profile.social_links,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error
      
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
    } catch (error: any) {
      console.error('Error updating the data!', error)
      setMessage({ type: 'error', text: 'Ocorreu um erro ao atualizar o perfil.' })
    } finally {
      setUpdating(false)
    }
  }

  // Função para fazer UPLOAD de imagens (avatar ou capa)
  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    if (!user || !event.target.files || event.target.files.length === 0) {
      return
    }

    const file = event.target.files[0]
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${Math.random()}.${fileExt}`
    const bucket = type === 'avatar' ? 'avatars' : 'covers'

    setUpdating(true)
    setMessage(null)

    try {
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath)

      if (!publicUrl) {
        throw new Error('Não foi possível obter o URL público da imagem.')
      }

      const fieldToUpdate = type === 'avatar' ? 'avatar_url' : 'cover_image_url'
      const { error: dbError } = await supabase.from('profiles').update({ [fieldToUpdate]: publicUrl, cover_position_y: 50 }).eq('id', user.id)
      
      if (dbError) throw dbError

      setProfile(prev => prev ? { ...prev, [fieldToUpdate]: publicUrl, cover_position_y: 50 } : null)
      setMessage({ type: 'success', text: `Imagem de ${type} atualizada!` })

    } catch (error: any) {
        console.error(`Erro no upload da imagem de ${type}:`, error)
        setMessage({ type: 'error', text: `Erro ao fazer upload da imagem de ${type}.` })
    } finally {
        setUpdating(false)
        event.target.value = ''
    }
  }
  
  // --- Funções para arrastar a imagem de capa ---
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!profile?.cover_image_url) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
        y: e.clientY,
        position: profile.cover_position_y || 50
    });
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !profile) return;
    const deltaY = e.clientY - dragStart.y;
    const containerHeight = e.currentTarget.clientHeight;
    const percentageChange = (deltaY / containerHeight) * 100;
    let newPosition = dragStart.position + percentageChange;
    newPosition = Math.max(0, Math.min(100, newPosition));
    setProfile({ ...profile, cover_position_y: newPosition });
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };
  // ---------------------------------------------


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Imagem de Capa e Avatar */}
      <div 
        className={`group relative h-48 sm:h-64 bg-neutral-800 select-none ${profile?.cover_image_url ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd} // Termina o arraste se o rato sair da área
      >
        {profile?.cover_image_url ? (
          <Image 
            src={profile.cover_image_url} 
            alt="Imagem de capa" 
            fill
            className="object-cover pointer-events-none" // pointer-events-none para evitar que a imagem intercete os eventos do rato
            style={{ objectPosition: `50% ${profile.cover_position_y || 50}%` }}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-neutral-800 to-neutral-700"></div>
        )}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <label htmlFor="cover-upload" className="bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black/70 transition" title="Carregar nova capa">
            <Upload className="h-5 w-5 text-white" />
            <input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={(e) => uploadImage(e, 'cover')} disabled={updating} />
          </label>
        </div>

        {/* Slider de Posição da Capa - AJUSTADO */}
        {profile?.cover_image_url && (
          <div className="absolute bottom-4 right-4 w-1/3 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-white/70" />
              <input 
                  type="range"
                  min="0"
                  max="100"
                  value={profile.cover_position_y || 50}
                  onChange={(e) => setProfile(p => p ? { ...p, cover_position_y: parseInt(e.target.value) } : null)}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                  disabled={updating}
              />
          </div>
        )}
        
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <div className="relative h-32 w-32 rounded-full border-4 border-neutral-950 bg-neutral-700">
            {profile?.avatar_url && (
              <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover rounded-full" />
            )}
            <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black/70 transition">
              <Upload className="h-4 w-4 text-white" />
              <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={(e) => uploadImage(e, 'avatar')} disabled={updating} />
            </label>
          </div>
        </div>
      </div>
      
      {/* Formulário do Perfil */}
      <div className="max-w-4xl mx-auto pt-24 pb-12 px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{profile?.full_name || 'Nome do Utilizador'}</h1>
          <p className="text-amber-500">@{profile?.username || 'username'}</p>
        </div>
        
        <div className="p-8 bg-neutral-900 rounded-lg border border-neutral-800 space-y-6">
          <h2 className="text-xl font-semibold text-amber-500 border-b border-neutral-700 pb-2">Informações do Perfil</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input id="fullName" type="text" value={profile?.full_name || ''} onChange={(e) => setProfile(p => p ? {...p, full_name: e.target.value} : null)} disabled={updating} />
            </div>
            <div>
              <Label htmlFor="username">Nickname</Label>
              <Input id="username" type="text" value={profile?.username || ''} onChange={(e) => setProfile(p => p ? {...p, username: e.target.value} : null)} disabled={updating} />
            </div>
          </div>
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={profile?.bio || ''} onChange={(e) => setProfile(p => p ? {...p, bio: e.target.value} : null)} placeholder="Conte-nos um pouco sobre si..." disabled={updating} />
          </div>

          <div>
            <Label htmlFor="birthDate">Data de Nascimento</Label>
            <Input id="birthDate" type="date" value={profile?.birth_date || ''} onChange={(e) => setProfile(p => p ? {...p, birth_date: e.target.value} : null)} disabled={updating} />
          </div>

          <h2 className="text-xl font-semibold text-amber-500 border-b border-neutral-700 pb-2 pt-4">Preferências de Magic</h2>

          <div>
            <Label>Cores Favoritas (separadas por vírgula)</Label>
            <Input placeholder="Ex: Branco, Azul, Preto" value={profile?.favorite_colors?.join(', ') || ''} onChange={(e) => setProfile(p => p ? {...p, favorite_colors: e.target.value.split(',').map(s => s.trim())} : null)} disabled={updating} />
          </div>
          <div>
            <Label>Formatos que Joga (separados por vírgula)</Label>
            <Input placeholder="Ex: Commander, Modern, Pauper" value={profile?.favorite_formats?.join(', ') || ''} onChange={(e) => setProfile(p => p ? {...p, favorite_formats: e.target.value.split(',').map(s => s.trim())} : null)} disabled={updating} />
          </div>

          <h2 className="text-xl font-semibold text-amber-500 border-b border-neutral-700 pb-2 pt-4">Redes Sociais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="twitter">URL do Twitter/X</Label>
              <Input id="twitter" type="text" placeholder="https://x.com/username" value={profile?.social_links?.twitter || ''} onChange={(e) => setProfile(p => p ? {...p, social_links: {...p.social_links, twitter: e.target.value}} : null)} disabled={updating} />
            </div>
            <div>
              <Label htmlFor="instagram">URL do Instagram</Label>
              <Input id="instagram" type="text" placeholder="https://instagram.com/username" value={profile?.social_links?.instagram || ''} onChange={(e) => setProfile(p => p ? {...p, social_links: {...p.social_links, instagram: e.target.value}} : null)} disabled={updating} />
            </div>
          </div>

          {message && (
            <Alert variant={message.type === 'success' ? 'default' : 'destructive'} className={message.type === 'success' ? 'bg-green-500/10 border-green-500/30' : ''}>
              <AlertTitle>{message.type === 'success' ? 'Sucesso' : 'Erro'}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button onClick={updateProfile} disabled={updating}>
              {updating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A atualizar...</> : <><Check className="mr-2 h-4 w-4" /> Guardar Alterações</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
