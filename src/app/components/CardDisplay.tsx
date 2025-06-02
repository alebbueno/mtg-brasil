'use client';
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Interface para a resposta da API do Scryfall
interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  mana_cost?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  rarity: string;
  set_name: string;
  image_uris?: {
    normal: string;
  };
  card_faces?: Array<{
    image_uris?: {
      normal: string;
    };
    name: string;
    type_line: string;
    mana_cost?: string;
    oracle_text?: string;
    power?: string;
    toughness?: string;
  }>;
}

interface Props {
  card: ScryfallCard;
  isDoubleFaced: boolean;
  displayCard: ScryfallCard | ScryfallCard['card_faces'][0];
  translatedOracleText: string;
}

// Função para converter símbolos de mana em elementos estilizados
const manaSymbols: { [key: string]: { symbol: string; className: string } } = {
  '{W}': { symbol: '⚪', className: 'text-white' }, // Mana branca
  '{U}': { symbol: '🔵', className: 'text-blue-400' }, // Mana azul
  '{B}': { symbol: '⚫', className: 'text-gray-800' }, // Mana preta
  '{R}': { symbol: '🔴', className: 'text-red-500' }, // Mana vermelha
  '{G}': { symbol: '🟢', className: 'text-green-500' }, // Mana verde
  '{C}': { symbol: '💎', className: 'text-gray-400' }, // Mana incolor
  '{1}': { symbol: '1', className: 'text-gray-400' },
  '{2}': { symbol: '2', className: 'text-gray-400' },
  '{3}': { symbol: '3', className: 'text-gray-400' },
  '{4}': { symbol: '4', className: 'text-gray-400' },
  '{5}': { symbol: '5', className: 'text-gray-400' },
  '{X}': { symbol: 'X', className: 'text-gray-400' },
  '{T}': { symbol: '↷', className: 'text-gray-400' }, // Símbolo de tap
  '{R/W}': { symbol: '🔴⚪', className: 'text-red-500' }, // Mana híbrido
};

// Função para converter símbolos de mana
const renderManaCost = (text: string) => {
  return text.replace(/{[^}]+}/g, (match) => {
    const mana = manaSymbols[match];
    if (mana) {
      return `<span class="${mana.className} font-bold">${mana.symbol}</span>`;
    }
    return match;
  });
};

// Função para formatar o texto da carta
const renderOracleText = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, index) => {
    const formattedLine = line.replace(
      /\b(Channel|Flash|Haste|Flying|Trample|Lifelink|Deathtouch|Vigilance|Hexproof)\b/gi,
      (match) => `<span class="font-bold text-yellow-400">${match}</span>`
    );
    const withMana = renderManaCost(formattedLine);
    return <div key={index} dangerouslySetInnerHTML={{ __html: withMana }} />;
  });
};

export default function CardDisplay({ card, isDoubleFaced, displayCard, translatedOracleText }: Props) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 flex items-center justify-center">
      <Card className="w-full max-w-5xl bg-gray-800 border-gray-700 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 py-6">
          <CardTitle className="text-3xl sm:text-4xl font-extrabold text-center text-white drop-shadow-md">
            {card.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Imagens da carta */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-2">{isDoubleFaced ? "Frente" : "Carta"}</p>
                {displayCard.image_uris?.normal ? (
                  <div className="relative group">
                    <Image
                      src={displayCard.image_uris.normal}
                      alt={card.name}
                      width={340}
                      height={475}
                      className="rounded-lg shadow-lg w-full transition-transform duration-300 group-hover:scale-105"
                      priority={true}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[475px] bg-gray-700 rounded-lg border-2 border-gray-600">
                    <p className="text-gray-400">Imagem não disponível</p>
                  </div>
                )}
              </div>
              {isDoubleFaced && card.card_faces![1]?.image_uris?.normal && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Verso</p>
                  <div className="relative group">
                    <Image
                      src={card.card_faces![1].image_uris.normal}
                      alt={`${card.name} (verso)`}
                      width={340}
                      height={475}
                      className="rounded-lg shadow-lg w-full transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Informações da carta */}
            <div className="space-y-6">
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-blue-400">📜</span> Tipo
                </h3>
                <p className="text-gray-200">{displayCard.type_line}</p>
              </div>
              {displayCard.mana_cost && (
                <div className="border-t border-gray-600 pt-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-purple-400">✨</span> Custo de Mana
                  </h3>
                  <div
                    className="text-lg"
                    dangerouslySetInnerHTML={{ __html: renderManaCost(displayCard.mana_cost) }}
                  />
                </div>
              )}
              {translatedOracleText && (
                <div className="border-t border-gray-600 pt-4 bg-gray-700/50 p-4 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <span className="text-green-400">📖</span> Texto (Português)
                    </h3>
                    {displayCard.oracle_text && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-gray-400 hover:text-gray-200 transition">
                              <span className="text-lg">ℹ️</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-gray-800 border-gray-700 text-white max-w-md p-4 shadow-lg rounded-md transition-opacity duration-200">
                            <h4 className="text-sm font-semibold mb-2">Texto Original (Inglês)</h4>
                            <div className="text-sm">{renderOracleText(displayCard.oracle_text)}</div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div className="text-lg text-gray-100">{renderOracleText(translatedOracleText)}</div>
                </div>
              )}
              {(displayCard.power || displayCard.toughness) && (
                <div className="border-t border-gray-600 pt-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="text-red-400">⚔️</span> Poder/Resistência
                  </h3>
                  <p className="text-gray-200">
                    {displayCard.power}/{displayCard.toughness}
                  </p>
                </div>
              )}
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span> Raridade
                </h3>
                <p className="text-gray-200 capitalize">{card.rarity}</p>
              </div>
              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-indigo-400">📚</span> Set
                </h3>
                <p className="text-gray-200">{card.set_name}</p>
              </div>
              <Link href="/">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-6 flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-105">
                  <span>⬅️</span> Voltar para a busca
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}