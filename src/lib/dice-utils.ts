
import { v4 as uuidv4 } from 'uuid';

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

// Generate a random ID for rolls
export const generateRandomId = (): string => {
  return uuidv4();
};

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

// Export RollType for DiceControls.tsx
export type RollType = "normal" | "advantage" | "disadvantage";

// Export DiceRoll interface for components
export interface DiceRoll {
  id: string;
  diceType: DiceType;
  count: number;
  modifier: number;
  rollType: RollType;
  results: number[];
  total: number;
  timestamp: Date;
  playerName: string;
}

export const performDiceRoll = (
  diceType: DiceType,
  count: number = 1,
  modifier: number = 0,
  rollType: RollType = "normal",
  playerName: string = "Aventurero"
): DiceRoll => {
  let results: number[] = [];
  
  // Roll dice based on roll type
  if (rollType === "advantage" && diceType === "d20") {
    // Roll twice and take the higher value for advantage
    const roll1 = rollDie(diceType);
    const roll2 = rollDie(diceType);
    results = [Math.max(roll1, roll2)];
  } else if (rollType === "disadvantage" && diceType === "d20") {
    // Roll twice and take the lower value for disadvantage
    const roll1 = rollDie(diceType);
    const roll2 = rollDie(diceType);
    results = [Math.min(roll1, roll2)];
  } else {
    // Normal roll
    for (let i = 0; i < count; i++) {
      results.push(rollDie(diceType));
    }
  }
  
  // Calculate total
  const diceTotal = results.reduce((sum, value) => sum + value, 0);
  const total = diceTotal + modifier;
  
  return {
    id: `roll-${generateRandomId()}`,
    diceType,
    count,
    modifier,
    rollType,
    results,
    total,
    timestamp: new Date(),
    playerName
  };
};

export const formatRollResult = (roll: DiceRoll): string => {
  let result = '';
  
  if (roll.count === 1) {
    result = `${roll.results[0]}`;
  } else {
    const resultStr = roll.results.join(' + ');
    result = `${resultStr} = ${roll.results.reduce((a, b) => a + b, 0)}`;
  }
  
  if (roll.modifier !== 0) {
    result += roll.modifier > 0 ? ` + ${roll.modifier}` : ` - ${Math.abs(roll.modifier)}`;
  }
  
  result += ` = ${roll.total}`;
  
  return result;
};

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

export type HistoryRollType = "ROLL" | "COMBINED_ROLL" | "CHARACTER" | "ENEMY" | "CHAT" | "SYSTEM";

export interface RollHistoryItem {
  id: string;
  characterName: string;
  type: HistoryRollType;
  roll: DiceRoll | CombinedDiceRoll;
  timestamp: Date;
}

export interface DiceCombination {
  diceType: DiceType;
  count: number;
}

export interface CombinedDiceRoll {
  id: string;
  playerName: string;
  dice: DiceCombination[];
  results: {
    diceType: DiceType;
    values: number[];
  }[];
  modifier: number;
  total: number;
  rollType: RollType;
  timestamp: Date;
}

export const performCombinedDiceRoll = (
  diceCombinations: DiceCombination[],
  modifier: number = 0,
  rollType: RollType = "normal",
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
    dice: diceCombinations,
    results,
    modifier,
    rollType,
    total,
    timestamp: new Date()
  };
};

export const formatCombinedRollResult = (roll: CombinedDiceRoll): string => {
  let resultParts: string[] = [];
  
  roll.results.forEach(diceResult => {
    if (diceResult.values.length > 0) {
      const diceStr = `${diceResult.values.join(' + ')} [${diceResult.diceType}]`;
      resultParts.push(diceStr);
    }
  });
  
  let result = resultParts.join(' + ');
  
  if (roll.modifier !== 0) {
    result += roll.modifier > 0 ? ` + ${roll.modifier}` : ` - ${Math.abs(roll.modifier)}`;
  }
  
  result += ` = ${roll.total}`;
  
  return result;
};

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
    dice: diceCombinations,
    results,
    modifier,
    rollType: "normal",
    total,
    timestamp: new Date()
  };
};
