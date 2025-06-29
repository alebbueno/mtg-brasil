/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
'use client'

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Zap, Loader2, VideoOff } from 'lucide-react';
import { toast } from 'sonner';
import { recognizeCardFromImage } from '@/app/actions/ai/visionActions';

// AJUSTE: A interface de props agora controla a visibilidade do modal
interface CameraScannerProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function CameraScanner({ isOpen, onOpenChange }: CameraScannerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setError(null);
    setIsLoading(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err: any) {
        setError('Permissão para usar a câmera foi negada ou não há câmera disponível.');
        toast.error("Erro ao acessar a câmera.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Seu navegador não suporta o acesso à câmera.');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const handleCaptureAndAnalyze = async () => {
    if (!videoRef.current) return;
    setIsAnalyzing(true);
    toast.info("Analisando a imagem da carta...");

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      toast.error("Erro no navegador ao capturar a imagem.");
      setIsAnalyzing(false);
      return;
    }

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg', 0.9);
    const result = await recognizeCardFromImage(imageBase64);

    if (result.cardName) {
      toast.success(`Carta encontrada: ${result.cardName}`);
      onOpenChange(false); // Fecha o modal
      router.push(`/card/${encodeURIComponent(result.cardName)}`);
    } else {
      toast.error(result.error || "Não foi possível identificar a carta.");
    }
    setIsAnalyzing(false);
  };

  // AJUSTE: O componente agora é apenas o Dialog, sem o Trigger
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/80 backdrop-blur-md border-neutral-800 p-0 max-w-[90vw] md:max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="p-4 border-b border-neutral-800">
          <DialogTitle className="text-white">Aponte para a carta</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {isLoading && <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />}
          {error && <div className="text-center text-red-400 p-4"><VideoOff className="h-12 w-12 mx-auto mb-2" /><p>{error}</p></div>}
          <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${isLoading || error ? 'hidden' : 'block'}`} />
          {!isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[88%] h-[85%] max-w-[280px] md:max-w-[400px] border-4 border-dashed border-white/50 rounded-2xl" />
            </div>
          )}
        </div>
        
        <DialogFooter className="p-4 border-t border-neutral-800">
          <Button size="lg" className="w-full bg-amber-500 text-black hover:bg-amber-400" disabled={isLoading || !!error || isAnalyzing} onClick={handleCaptureAndAnalyze}>
            {isAnalyzing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analisando...</> : <><Zap className="mr-2 h-5 w-5" /> Capturar e Analisar</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}