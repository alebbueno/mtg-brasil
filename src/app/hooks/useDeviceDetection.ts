/* eslint-disable no-undef */
'use client'

import { useState, useEffect } from 'react';

/**
 * Hook customizado para detectar se o dispositivo é mobile (baseado no suporte a toque).
 * Retorna 'true' se for mobile, 'false' caso contrário.
 */
export function useDeviceDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Esta verificação só pode rodar no cliente, após o componente montar.
    // 'ontouchstart' in window: verifica se o evento de toque existe.
    // navigator.maxTouchPoints > 0: uma verificação adicional para dispositivos de toque mais modernos.
    const mobileCheck = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(mobileCheck);
  }, []); // O array vazio [] garante que isso rode apenas uma vez.

  return { isMobile };
}