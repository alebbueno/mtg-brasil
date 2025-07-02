/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/no-static-element-interactions */
'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/app/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ReferralLink from '@/app/(site)/components/ui/ReferralLink'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Image as ImageIcon, Loader2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import UserPointsDisplay from '@/app/(site)/components/ui/UserPointsDisplay'
import { Checkbox } from '@/components/ui/checkbox'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group' // Importa ToggleGroup
import ManaCost from '@/components/ui/ManaCost'

type Profile = {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  cover_image_url: string | null
  cover_position_y: number | null
  favorite_colors: string[] | null
  favorite_formats: string[] | null
  points: number | null
  referral_code: string | null
}

const ALL_COLORS = ['W', 'U', 'B', 'R', 'G'];
const ALL_FORMATS = ['Commander', 'Standard', 'Pioneer', 'Modern', 'Pauper', 'Legacy', 'Vintage'];

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ y: 0, position: 50 })

  const getProfile = useCallback(async (user: User) => {
    try {
      setLoading(true);
      const { data, error, status } = await supabase.from('profiles').select(`*`).eq('id', user.id).single();
      if (error && status !== 406) throw error;
      if (data) setProfile(data);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Não foi possível carregar os dados do perfil.' });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        getProfile(user);
      } else {
        router.push('/login');
      }
    }
    fetchUserAndProfile()
  }, [supabase, getProfile, router]);

  const updateProfile = async () => {
    if (!user || !profile) return;
    setUpdating(true);
    setMessage(null);
    try {
      const updates = {
        id: user.id,
        username: profile.username,
        full_name: profile.full_name,
        bio: profile.bio,
        cover_position_y: profile.cover_position_y,
        favorite_colors: profile.favorite_colors,
        favorite_formats: profile.favorite_formats,
        updated_at: new Date().toISOString(),
        // AJUSTE CRÍTICO: Incluímos o referral_code para que ele não seja perdido.
        referral_code: profile.referral_code, 
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: `Ocorreu um erro ao atualizar: ${error.message}` });
    } finally {
      setUpdating(false);
    }
  };

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    if (!user || !event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${type}-${Date.now()}.${fileExt}`;
    const bucket = type === 'avatar' ? 'avatars' : 'covers';
    setUpdating(true);
    setMessage(null);
    try {
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      if (!publicUrl) throw new Error('Não foi possível obter o URL público da imagem.');
      const fieldToUpdate = type === 'avatar' ? 'avatar_url' : 'cover_image_url';
      const updates = type === 'avatar' ? { [fieldToUpdate]: publicUrl } : { [fieldToUpdate]: publicUrl, cover_position_y: 50 };
      const { error: dbError } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (dbError) throw dbError;
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      setMessage({ type: 'success', text: `Imagem de ${type} atualizada!` });
    } catch (error: any) {
      setMessage({ type: 'error', text: `Erro ao fazer upload da imagem de ${type}.` });
    } finally {
      setUpdating(false);
      event.target.value = '';
    }
  };
  
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!profile?.cover_image_url) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ y: e.clientY, position: profile.cover_position_y || 50 });
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !profile) return;
    const deltaY = e.clientY - dragStart.y;
    const containerHeight = (e.currentTarget as HTMLElement).clientHeight;
    if (containerHeight === 0) return;
    const percentageChange = (deltaY / containerHeight) * 100;
    let newPosition = dragStart.position + percentageChange;
    newPosition = Math.max(0, Math.min(100, newPosition));
    setProfile({ ...profile, cover_position_y: newPosition });
  };
  
  const handleDragEnd = () => setIsDragging(false);

  // const handleColorChange = (color: string, isChecked: boolean) => {
  //   setProfile(p => {
  //       if (!p) return null;
  //       const currentColors = p.favorite_colors || [];
  //       const newColors = isChecked ? [...currentColors, color] : currentColors.filter(c => c !== color);
  //       return { ...p, favorite_colors: newColors };
  //   });
  // };

  const handleFormatChange = (format: string, isPressed: boolean) => {
    setProfile(p => {
        if (!p) return null;
        const currentFormats = p.favorite_formats || [];
        const newFormats = isPressed ? [...currentFormats, format] : currentFormats.filter(f => f !== format);
        return { ...p, favorite_formats: newFormats };
    });
  };

  if (loading) {
    return ( <div className="min-h-screen flex items-center justify-center bg-neutral-950"><Loader2 className="h-12 w-12 animate-spin text-amber-500" /></div> )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div 
        className={`group relative h-48 sm:h-64 bg-neutral-800 select-none ${profile?.cover_image_url ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd} onMouseLeave={handleDragEnd}
      >
        {profile?.cover_image_url ? (<Image src={profile.cover_image_url} alt="Imagem de capa" fill unoptimized className="object-cover pointer-events-none" style={{ objectPosition: `50% ${profile.cover_position_y || 50}%` }} priority />) : (<div className="w-full h-full bg-gradient-to-r from-neutral-800 to-neutral-700"></div>)}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <label htmlFor="cover-upload" className="bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black/70 transition" title="Carregar nova capa"><Upload className="h-5 w-5 text-white" /><input id="cover-upload" type="file" className="hidden" accept="image/*" onChange={(e) => uploadImage(e, 'cover')} disabled={updating} /></label>
        </div>
        {profile?.cover_image_url && (<div className="absolute bottom-4 right-4 w-1/3 max-w-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3"><ImageIcon className="h-5 w-5 text-white/70" /><input type="range" min="0" max="100" value={profile.cover_position_y || 50} onChange={(e) => setProfile(p => p ? { ...p, cover_position_y: parseInt(e.target.value) } : null)} className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer" disabled={updating} /></div>)}
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <div className="relative h-32 w-32 rounded-full border-4 border-neutral-950 bg-neutral-700">
            {profile?.avatar_url && (<Image src={profile.avatar_url} alt="Avatar" unoptimized fill className="object-cover rounded-full" />)}
            <label htmlFor="avatar-upload" className="absolute bottom-1 right-1 bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black/70 transition"><Upload className="h-4 w-4 text-white" /><input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={(e) => uploadImage(e, 'avatar')} disabled={updating} /></label>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto pt-24 pb-12 px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{profile?.full_name || 'Nome do Usuário'}</h1>
          <p className="text-amber-500">@{profile?.username || 'username'}</p>
        </div>

        <Card className="bg-neutral-900 border-neutral-800"><CardHeader><CardTitle className="text-xl font-semibold text-amber-500">Gamificação e Recompensas</CardTitle><CardDescription>Seus pontos e seu link para convidar amigos.</CardDescription></CardHeader><CardContent className="space-y-6"><div><Label className="text-sm text-neutral-400">Seus Pontos</Label><UserPointsDisplay points={profile?.points} /></div><div><Label className="text-sm text-neutral-400">Seu Link de Convite</Label><ReferralLink referralCode={profile?.referral_code || null} /></div></CardContent></Card>
        
        <div className="p-8 bg-neutral-900 rounded-lg border border-neutral-800 space-y-6">
          <h2 className="text-xl font-semibold text-amber-500 border-b border-neutral-700 pb-2">Informações do Perfil</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><Label htmlFor="fullName">Nome Completo</Label><Input id="fullName" value={profile?.full_name || ''} onChange={(e) => setProfile(p => p ? {...p, full_name: e.target.value} : null)} disabled={updating} /></div>
            <div><Label htmlFor="username">Nickname</Label><Input id="username" value={profile?.username || ''} onChange={(e) => setProfile(p => p ? {...p, username: e.target.value} : null)} disabled={updating} /></div>
          </div>
          <div><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={profile?.bio || ''} onChange={(e) => setProfile(p => p ? {...p, bio: e.target.value} : null)} placeholder="Conte-nos um pouco sobre você..." disabled={updating} /></div>

          <h2 className="text-xl font-semibold text-amber-500 border-b border-neutral-700 pb-2 pt-4">Preferências de Magic</h2>

          {/* --- AJUSTE PRINCIPAL: Novo seletor de cores --- */}
          <div className="space-y-3">
            <Label>Cores Favoritas</Label>
            <ToggleGroup 
                type="multiple"
                variant="outline"
                className="justify-start pt-2"
                value={profile?.favorite_colors || []}
                // A função onValueChange já nos dá o array completo de valores selecionados
                onValueChange={(colors) => {
                    setProfile(p => p ? { ...p, favorite_colors: colors } : null);
                }}
            >
              {ALL_COLORS.map(color => (
                <ToggleGroupItem 
                  key={color} 
                  value={color} 
                  aria-label={`Selecionar cor ${color}`}
                  className="w-12 h-12 data-[state=on]:bg-amber-500/20 data-[state=on]:border-amber-400"
                >
                  <ManaCost cost={`{${color}}`} />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          
          <div className="space-y-3">
            <Label>Formatos que Joga</Label>
            <div className="flex flex-wrap gap-2 pt-2">
                {ALL_FORMATS.map(format => (
                    <Toggle key={format} pressed={profile?.favorite_formats?.includes(format)} onPressedChange={(isPressed) => handleFormatChange(format, isPressed)} variant="outline">{format}</Toggle>
                ))}
            </div>
          </div>

          {message && (<Alert variant={message.type === 'success' ? 'default' : 'destructive'} className={message.type === 'success' ? 'bg-green-500/10 border-green-500/30' : ''}><AlertTitle>{message.type === 'success' ? 'Sucesso' : 'Erro'}</AlertTitle><AlertDescription>{message.text}</AlertDescription></Alert>)}

          <div className="flex justify-end pt-4">
            <Button onClick={updateProfile} disabled={updating}>
              {updating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...</> : <><Check className="mr-2 h-4 w-4" /> Salvar Alterações</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}