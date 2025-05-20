
import { useState, useEffect, useCallback } from 'react';
import { DiceRoll } from '@/lib/dice-utils';

type SoundState = {
  isSoundEnabled: boolean;
  playingSoundId: string | null;
};

export const useRollSounds = () => {
  // Estado para controlar si el sonido está activado
  const [soundState, setSoundState] = useState<SoundState>({
    isSoundEnabled: true,
    playingSoundId: null
  });

  // Efecto para cargar la preferencia de sonido desde localStorage
  useEffect(() => {
    try {
      const savedSoundPreference = localStorage.getItem('diceRollSoundEnabled');
      if (savedSoundPreference !== null) {
        setSoundState(prev => ({
          ...prev,
          isSoundEnabled: savedSoundPreference === 'true'
        }));
      }
    } catch (error) {
      console.error("Error loading sound preference:", error);
    }
  }, []);

  // Función para alternar el estado del sonido
  const toggleSound = useCallback(() => {
    setSoundState(prev => {
      const newState = {
        ...prev,
        isSoundEnabled: !prev.isSoundEnabled
      };
      
      // Guardar preferencia en localStorage
      try {
        localStorage.setItem('diceRollSoundEnabled', String(newState.isSoundEnabled));
      } catch (error) {
        console.error("Error saving sound preference:", error);
      }
      
      return newState;
    });
  }, []);

  // Función para reproducir el sonido de una tirada
  const playSoundForRoll = useCallback((roll: DiceRoll) => {
    if (!soundState.isSoundEnabled) return;
    
    try {
      // Determinar qué sonido reproducir
      let soundPath = `/sounds/${roll.diceType}.mp3`;
      
      // Reproducir sonidos especiales para críticos y pifias (d20)
      if (roll.diceType === 'd20' && roll.count === 1) {
        if (roll.results[0] === 20) {
          soundPath = '/sounds/critical.mp3';
        } else if (roll.results[0] === 1) {
          soundPath = '/sounds/fail.mp3';
        }
      }
      
      // Crear y reproducir el audio
      const audio = new Audio(soundPath);
      audio.volume = 0.7; // Volumen al 70%
      
      // ID único para esta reproducción
      const soundId = `sound-${Date.now()}`;
      setSoundState(prev => ({ ...prev, playingSoundId: soundId }));
      
      // Reproducir el sonido
      audio.play().catch(error => {
        console.error("Error playing sound:", error);
      });
      
      // Limpiar el ID cuando el sonido termine
      audio.onended = () => {
        setSoundState(prev => {
          if (prev.playingSoundId === soundId) {
            return { ...prev, playingSoundId: null };
          }
          return prev;
        });
      };
    } catch (error) {
      console.error("Error playing dice roll sound:", error);
    }
  }, [soundState.isSoundEnabled]);

  return {
    isSoundEnabled: soundState.isSoundEnabled,
    isPlaying: soundState.playingSoundId !== null,
    playSoundForRoll,
    toggleSound
  };
};
