
import { useState, useEffect } from 'react';
import { DiceRoll } from '@/lib/dice-utils';

type SoundType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100' | 'critical' | 'fail';

export const useRollSounds = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(false);
  const [sounds, setSounds] = useState<Record<SoundType, HTMLAudioElement | null>>({
    'd4': null,
    'd6': null,
    'd8': null,
    'd10': null,
    'd12': null,
    'd20': null,
    'd100': null,
    'critical': null,
    'fail': null
  });

  // Inicializar los sonidos
  useEffect(() => {
    // Comprobar si localStorage ya tiene una preferencia de sonido
    const savedPreference = localStorage.getItem('sound-enabled');
    if (savedPreference !== null) {
      setIsSoundEnabled(savedPreference === 'true');
    }

    // Cargar todos los sonidos
    const newSounds: Record<SoundType, HTMLAudioElement> = {
      'd4': new Audio('/sounds/d4.mp3'),
      'd6': new Audio('/sounds/d6.mp3'),
      'd8': new Audio('/sounds/d8.mp3'),
      'd10': new Audio('/sounds/d10.mp3'),
      'd12': new Audio('/sounds/d12.mp3'),
      'd20': new Audio('/sounds/d20.mp3'),
      'd100': new Audio('/sounds/d100.mp3'),
      'critical': new Audio('/sounds/critical.mp3'),
      'fail': new Audio('/sounds/fail.mp3'),
    };

    // Configurar el volumen para cada sonido
    Object.values(newSounds).forEach(sound => {
      if (sound) sound.volume = 0.5;
    });

    setSounds(newSounds);

    // Limpiar los sonidos cuando el componente se desmonte
    return () => {
      Object.values(newSounds).forEach(sound => {
        if (sound) {
          sound.pause();
          sound.currentTime = 0;
        }
      });
    };
  }, []);

  // Guardar la preferencia de sonido cuando cambie
  useEffect(() => {
    localStorage.setItem('sound-enabled', isSoundEnabled.toString());
  }, [isSoundEnabled]);

  const toggleSound = () => {
    setIsSoundEnabled(!isSoundEnabled);
  };

  const playSound = (soundType: SoundType) => {
    if (!isSoundEnabled) return;
    
    const sound = sounds[soundType];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.error("Error playing sound:", error);
      });
    }
  };

  const playSoundForRoll = (roll: DiceRoll) => {
    if (!isSoundEnabled) return;

    // Determinar qué sonido reproducir
    const diceType = roll.diceType as SoundType;
    
    // Comprobar si es un crítico o una pifia con d20
    if (roll.diceType === 'd20' && roll.count === 1) {
      if (roll.results[0] === 20) {
        playSound('critical');
        return;
      } else if (roll.results[0] === 1) {
        playSound('fail');
        return;
      }
    }
    
    // De lo contrario, reproducir el sonido normal del dado
    playSound(diceType);
  };

  return { isSoundEnabled, toggleSound, playSound, playSoundForRoll };
};
