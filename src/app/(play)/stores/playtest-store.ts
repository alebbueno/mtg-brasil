/* eslint-disable no-unused-vars */
'use client';

import { create } from 'zustand';
import type { ScryfallCard } from '@/app/lib/types';
import { toast } from 'sonner';

export interface GameCard extends ScryfallCard {
  zone: string;
  instanceId: string;
  tapped: boolean;
  commanderTax: number;
  powerCounters: number; // Contadores para poder
  toughnessCounters: number; // Contadores para resistência
}

export type Zone = 'library' | 'hand' | 'battlefield' | 'graveyard' | 'exile' | 'commandZone';

interface PlaytestZones {
  library: GameCard[];
  hand: GameCard[];
  battlefield: GameCard[];
  graveyard: GameCard[];
  exile: GameCard[];
  commandZone: GameCard[];
}

interface PlaytestState extends PlaytestZones {
  initialDeck: GameCard[];
  actions: {
    initializeDeck: (
      decklist: { name: string; count: number }[],
      commanderList: { name: string; count: number }[] | undefined | null,
      scryfallMap: Map<string, ScryfallCard>,
      deckFormat: string
    ) => void;
    drawCard: (count?: number) => void;
    shuffleLibrary: () => void;
    moveCard: (cardInstanceId: string, fromZone: Zone, toZone: Zone) => void;
    moveCardToLibrary: (cardInstanceId: string, fromZone: Zone, position: 'top' | 'bottom') => void;
    toggleTap: (cardInstanceId: string) => void;
    resetGame: () => void;
    millCards: (count: number) => void;
    shuffleGraveyardIntoLibrary: () => void;
    returnCommanderToZone: (cardInstanceId: string) => void;
    nextTurn: () => void;
    addPowerToughnessCounters: (cardInstanceId: string, power: number, toughness: number) => void; // Ação renomeada
  }
}

const shuffle = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const usePlaytestStore = create<PlaytestState>((set, get) => ({
  library: [], hand: [], battlefield: [], graveyard: [], exile: [], commandZone: [],
  initialDeck: [],

  actions: {
    initializeDeck: (decklist, commanderList, scryfallMap, deckFormat) => {
      const createCardInstance = (cardData: ScryfallCard, id: string): GameCard => ({
        ...cardData,
        instanceId: id,
        tapped: false,
        commanderTax: 0,
        powerCounters: 0, // Inicializa com 0
        toughnessCounters: 0, // Inicializa com 0
        zone: ''
      });

      let potentialCommanders = commanderList;
      if ((!potentialCommanders || potentialCommanders.length === 0) && deckFormat === 'commander' && decklist.length > 0) {
        potentialCommanders = [{ name: decklist[0].name, count: 1 }];
      }

      const commanderNames = potentialCommanders?.map(c => c.name) || [];

      const commanders: GameCard[] = (potentialCommanders || []).map((item, index) => {
        const cardData = scryfallMap.get(item.name)!;
        return createCardInstance(cardData, `cmd-${cardData.id}-${index}`);
      });
      
      const fullLibrary = decklist
        .filter(item => !commanderNames.includes(item.name))
        .flatMap(item => {
          const cardData = scryfallMap.get(item.name);
          if (!cardData) return [];
          return Array.from({ length: item.count }, (_, i) => createCardInstance(cardData, `${cardData.id}-${i}`));
        });

      const fullDeckForReset = [...commanders, ...fullLibrary];
      
      set({
        library: shuffle(fullLibrary),
        commandZone: commanders,
        initialDeck: fullDeckForReset,
        hand: [],
        battlefield: [],
        graveyard: [],
        exile: [],
      });
      
      get().actions.drawCard(7);
    },

    drawCard: (count = 1) => {
      set(state => {
        if (state.library.length < count) {
          toast.warning("Não há cartas suficientes no grimório.");
          return state;
        }
        const drawnCards = state.library.slice(0, count);
        const newLibrary = state.library.slice(count);
        return { library: newLibrary, hand: [...drawnCards, ...state.hand] };
      });
    },

    shuffleLibrary: () => {
      set(state => ({ library: shuffle([...state.library]) }));
      toast.info("Grimório embaralhado.");
    },

    moveCard: (cardInstanceId, from, to) => {
      set(state => {
        if (!state[from]) return state;
        const fromZone = [...state[from]];
        const toZone = to ? [...state[to]] : [];
        const cardIndex = fromZone.findIndex(c => c.instanceId === cardInstanceId);
        if (cardIndex === -1) return state;
        const [cardToMove] = fromZone.splice(cardIndex, 1);
        cardToMove.tapped = false;
        if (to === 'graveyard' || to === 'exile' || to === 'hand') {
            toZone.unshift(cardToMove);
        } else {
            toZone.push(cardToMove);
        }
        return { ...state, [from]: fromZone, [to]: toZone };
      });
    },

    moveCardToLibrary: (cardInstanceId, fromZone, position) => {
        set(state => {
            const originZone = [...state[fromZone]];
            const cardIndex = originZone.findIndex(c => c.instanceId === cardInstanceId);
            if (cardIndex === -1) return state;
            const [cardToMove] = originZone.splice(cardIndex, 1);
            cardToMove.tapped = false;
            const newLibrary = [...state.library];
            if (position === 'top') {
                newLibrary.unshift(cardToMove);
            } else {
                newLibrary.push(cardToMove);
            }
            toast.info(`${cardToMove.name} foi para o ${position === 'top' ? 'topo' : 'fundo'} do grimório.`);
            return { ...state, [fromZone]: originZone, library: newLibrary };
        });
    },
    
    toggleTap: (cardInstanceId: string) => {
        set(state => ({
            battlefield: state.battlefield.map(card => 
                card.instanceId === cardInstanceId ? { ...card, tapped: !card.tapped } : card
            )
        }));
    },

    resetGame: () => {
      const { initialDeck, actions } = get();
      if (initialDeck.length === 0) return;
      const commanders = initialDeck.filter(c => c.instanceId.startsWith('cmd-'));
      const library = initialDeck.filter(c => !c.instanceId.startsWith('cmd-'));
      set({
        library: shuffle(library),
        commandZone: commanders,
        hand: [], battlefield: [], graveyard: [], exile: [],
      });
      actions.drawCard(7);
      toast.success("Jogo reiniciado!");
    },
    
    millCards: (count: number) => {
        set(state => {
            if (state.library.length < count) {
                toast.warning("Não há cartas suficientes para 'millar'.");
                return state;
            }
            const milledCards = state.library.slice(0, count);
            const newLibrary = state.library.slice(count);
            const newGraveyard = [...milledCards, ...state.graveyard];
            toast.info(`${count} carta(s) movida(s) para o cemitério.`);
            return { library: newLibrary, graveyard: newGraveyard };
        });
    },

    shuffleGraveyardIntoLibrary: () => {
        set(state => {
            if (state.graveyard.length === 0) {
                toast.info("Cemitério já está vazio.");
                return state;
            }
            const newLibrary = shuffle([...state.library, ...state.graveyard]);
            toast.success("Cemitério embaralhado de volta no grimório!");
            return { graveyard: [], library: newLibrary };
        });
    },
    
    returnCommanderToZone: (cardInstanceId: string) => {
      set(state => {
        const battlefield = [...state.battlefield];
        const commandZone = [...state.commandZone];
        const cardIndex = battlefield.findIndex(c => c.instanceId === cardInstanceId);
        if (cardIndex === -1) return state;
        const [cardToMove] = battlefield.splice(cardIndex, 1);
        cardToMove.commanderTax += 2;
        cardToMove.tapped = false;
        commandZone.push(cardToMove);
        toast.error(`${cardToMove.name} voltou para a Zona de Comando. Imposto: +${cardToMove.commanderTax}`);
        return { ...state, battlefield, commandZone };
      });
    },

    nextTurn: () => {
      set(state => {
        const updatedBattlefield = state.battlefield.map(card => ({
          ...card,
          tapped: false
        }));
        if (state.library.length === 0) {
          toast.warning("Não há cartas suficientes no grimório para o próximo turno.");
          return { ...state, battlefield: updatedBattlefield };
        }
        const drawnCards = state.library.slice(0, 1);
        const newLibrary = state.library.slice(1);
        toast.info("Próximo turno: cartas desviradas e 1 carta comprada.");
        return {
          ...state,
          battlefield: updatedBattlefield,
          library: newLibrary,
          hand: [...drawnCards, ...state.hand]
        };
      });
    },

    addPowerToughnessCounters: (cardInstanceId: string, power: number, toughness: number) => {
      set(state => {
        const battlefield = state.battlefield.map(card =>
          card.instanceId === cardInstanceId
            ? {
                ...card,
                powerCounters: (card.powerCounters || 0) + power,
                toughnessCounters: (card.toughnessCounters || 0) + toughness
              }
            : card
        );
        const updatedCard = battlefield.find(card => card.instanceId === cardInstanceId);
        if (updatedCard) {
          toast.info(
            `Adicionado ${power >= 0 ? '+' : ''}${power}/${toughness >= 0 ? '+' : ''}${toughness} em ${
              updatedCard.name
            }. Total: ${updatedCard.powerCounters >= 0 ? '+' : ''}${updatedCard.powerCounters}/${
              updatedCard.toughnessCounters >= 0 ? '+' : ''
            }${updatedCard.toughnessCounters}`
          );
        }
        return { ...state, battlefield };
      });
    }
  }
}));