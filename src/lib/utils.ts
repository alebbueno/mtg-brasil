/* eslint-disable no-console */
/* eslint-disable no-undef */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { cache } from 'react'

export const getBRLRate = cache(async () => {
  try {
    // API pública e simples para cotações
    const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL');
    if (!response.ok) {
      throw new Error('Falha ao buscar a taxa de câmbio.');
    }
    const data = await response.json();
    const rate = parseFloat(data.USDBRL.bid);
    return rate;
  } catch (error) {
    console.error("Erro na API de câmbio:", error);
    // Retorna um valor padrão em caso de falha para não quebrar a interface
    return 5.20; 
  }
});