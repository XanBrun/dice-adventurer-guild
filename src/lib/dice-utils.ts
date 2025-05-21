import { generateRandomId } from "./utils";

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export const DICE_SETS = [
  { type: 'd4', color: 'bg-red-500' },
  { type: 'd6', color: 'bg-green-500' },
  { type: 'd8', color: 'bg-blue-500' },
  { type: 'd10', color: 'bg-yellow-500' },
  { type: 'd12', color: 'bg-purple-500' },
  { type: 'd20', color: 'bg-orange-500' },
  { type: 'd100', color: 'bg-gray-500' },
];

export const rollDie = (type: DiceType): number => {
  switch (type) {
    case 'd4': return Math.floor(Math.random() * 4) + 1;
    case 'd6': return Math.floor(Math.random() * 6) + 1;
    case 'd8': return Math.floor(Math.random() * 8) + 1;
    case 'd10': return Math.floor(Math.random() * 10) + 1;
    case 'd12': return Math.floor(Math.random() * 12) + 1;
    case 'd20': return Math.floor(Math.random() * 20) + 1;
    case 'd100': return Math.floor(Math.random() * 100) + 1;
    default: return 0;
  }
};

export interface RollResult {
  id: string;
  playerName: string;
  diceType: DiceType;
  value: number;
  modifier: number;
  total: number;
  reason?: string;
  timestamp: Date;
}

const generateRollId = (): string => {
  return `roll-${generateRandomId()}`;
};

export const rollDice = (
  diceType: DiceType,
  count: number = 1,
  modifier: number = 0,
  playerName: string = "Jugador",
  reason?: string
): RollResult[] => {
  const rolls: RollResult[] = [];
  for (let i = 0; i < count; i++) {
    const value = rollDie(diceType);
    const total = value + modifier;
    rolls.push({
      id: generateRollId(),
      playerName,
      diceType,
      value,
      modifier,
      total,
      reason,
      timestamp: new Date(),
    });
  }
  return rolls;
};

export type RollType = "ROLL" | "COMBINED_ROLL" | "CHARACTER" | "ENEMY" | "CHAT" | "SYSTEM";

export interface RollHistoryItem {
  id: string;
  characterName: string;
  type: RollType;
  roll: RollResult[] | CombinedDiceRoll;
  timestamp: Date;
}

export interface DiceCombination {
  diceType: DiceType;
  count: number;
}

export interface CombinedDiceRoll {
  id: string;
  playerName: string;
  results: {
    diceType: DiceType;
    values: number[];
  }[];
  modifier: number;
  total: number;
  timestamp: Date;
}

export const rollCombinedDice = (
  diceCombinations: DiceCombination[],
  modifier: number = 0,
  playerName: string = "Jugador"
): CombinedDiceRoll => {
  const results = diceCombinations.map(combination => {
    const values = Array.from({ length: combination.count }, () => 
      rollDie(combination.diceType)
    );
    
    return {
      diceType: combination.diceType,
      values
    };
  });
  
  const diceTotal = results.reduce((total, result) => {
    return total + result.values.reduce((sum, value) => sum + value, 0);
  }, 0);
  
  const total = diceTotal + modifier;
  
  return {
    id: generateRollId(),
    playerName,
    results,
    modifier,
    total,
    timestamp: new Date()
  };
};
