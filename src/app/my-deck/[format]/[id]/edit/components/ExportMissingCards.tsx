/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-console */
/* eslint-disable no-undef */
'use client';

import { useRef, useState, useEffect, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ClipboardCopy, Image as ImageIcon, Loader2, X } from 'lucide-react';
import MissingCardImage from './MissingCardImage'; 

interface MissingCard {
  id: string;
  name: string;
  missing: number;
  image_uris?: {
    normal?: string;
  };
}

interface ExportMissingCardsProps {
  missingCards: MissingCard[];
  deckName: string;
}

const preloadImages = (cards: MissingCard[]): Promise<any> => {
  const promises = cards
    .filter(card => card.image_uris?.normal)
    .map(card => {
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = card.image_uris!.normal!;
        img.onload = resolve;
        img.onerror = reject;
      });
  });

  return Promise.all(promises);
};

export default function ExportMissingCards({ missingCards, deckName }: ExportMissingCardsProps) {
  const imageExportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Classe no body para bloquear .ms enquanto modal aberto
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isModalOpen]);

  const handleExportText = () => {
    if (missingCards.length === 0) {
      toast.info("Você já tem todas as cartas para este deck!");
      return;
    }
    const textList = missingCards.map(card => `${card.missing}x ${card.name}`).join('\n');
    navigator.clipboard.writeText(textList);
    toast.success("Lista de cartas faltantes copiada!");
  };

  const handleOpenModal = async () => {
    if (missingCards.length === 0) {
      toast.info("Você já tem todas as cartas para este deck!");
      return;
    }
    setIsExporting(true);
    const toastId = toast.loading("Carregando imagens das cartas...");
    try {
      await preloadImages(missingCards);
      toast.success("Imagens carregadas!", { id: toastId });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      toast.error("Falha ao carregar imagens.", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!imageExportRef.current) return;

    setIsExporting(true);
    const toastId = toast.loading("Gerando imagem...");
    try {
      const dataUrl = await toPng(imageExportRef.current, { 
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#171717',
      });
      const link = document.createElement('a');
      link.download = `cartas-faltantes-${deckName.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Imagem gerada com sucesso!", { id: toastId });
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast.error("Erro ao gerar imagem.", { id: toastId });
    } finally {
      setIsExporting(false);
      setIsModalOpen(false); // fecha modal após download, opcional
    }
  };

    // Estilos do modal e overlay
    const modalOverlayStyle: CSSProperties = {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        zIndex: 2147483647,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

     // Atualização do estilo do modalContentStyle
    const modalContentStyle: CSSProperties = {
        backgroundColor: '#171717',
        padding: '24px',
        borderRadius: '10px',
        maxWidth: '95vw',
        maxHeight: 'none',      // sem limite de altura
        overflowY: 'visible',   // remove a barra de scroll vertical
        position: 'relative',
    };

    // Atualização do exportContainerStyle
    const exportContainerStyle: CSSProperties = {
    width: '95vw',         // largura maior, adaptável
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '16px',
    // boxShadow removido
    };

  const titleStyle: CSSProperties = {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#f59e0b',
    borderBottom: '2px solid #404040',
    paddingBottom: '16px',
    marginBottom: '16px',
    textAlign: 'center',
    width: '100%',
  };

  return (
    <>
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download size={20} /> Exportar Cartas Faltantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-neutral-400">
            {missingCards.length > 0
              ? `Você precisa de ${missingCards.length} tipo(s) de carta(s) para completar este deck.`
              : "Parabéns! Você já tem todas as cartas necessárias."
            }
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleExportText} variant="outline" className="flex-1 min-w-[140px]">
              <ClipboardCopy className="mr-2 h-4 w-4" /> Copiar Texto
            </Button>
            <Button onClick={handleOpenModal} variant="secondary" className="flex-1 min-w-[140px]" disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
              {isExporting ? 'Carregando...' : 'Visualizar Imagem'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && createPortal(
        <div style={modalOverlayStyle} onClick={() => setIsModalOpen(false)} aria-modal="true" role="dialog">
          <div
            style={modalContentStyle}
            onClick={e => e.stopPropagation()} // impedir fechar ao clicar dentro
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#f59e0b',
              }}
              aria-label="Fechar modal"
            >
              <X size={24} />
            </button>

            <h2 style={titleStyle}>Lista de Compras: {deckName}</h2>
            <div ref={imageExportRef} style={exportContainerStyle}>
              {missingCards.map((card) => (
                <MissingCardImage
                  key={card.id}
                  name={card.name}
                  missing={card.missing}
                  imageUrl={card.image_uris?.normal}
                />
              ))}
            </div>

            <div className="mt-6 flex justify-center gap-4">
              <Button onClick={handleDownloadImage} variant="secondary" disabled={isExporting}>
                {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                {isExporting ? 'Gerando...' : 'Baixar Imagem'}
              </Button>
              <Button onClick={() => setIsModalOpen(false)} variant="outline">Fechar</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
