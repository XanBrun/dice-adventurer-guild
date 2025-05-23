
export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

export type RollType = 'normal' | 'advantage' | 'disadvantage';

export type DiceRoll = {
  id: string;
  diceType: DiceType;
  count: number;
  modifier: number;
  rollType: RollType;
  results: number[];
  total: number;
  timestamp: Date;
  playerName: string;
};

export type DiceSet = {
  type: DiceType;
  sides: number;
  color: string;
  icon: string;
};

export const DICE_SETS: DiceSet[] = [
  { type: 'd4', sides: 4, color: 'bg-blue-500', icon: '△' },
  { type: 'd6', sides: 6, color: 'bg-red-500', icon: '⬦' },
  { type: 'd8', sides: 8, color: 'bg-green-500', icon: '◇' },
  { type: 'd10', sides: 10, color: 'bg-yellow-500', icon: '◇' },
  { type: 'd12', sides: 12, color: 'bg-purple-500', icon: '⬠' },
  { type: 'd20', sides: 20, color: 'bg-emerald-green', icon: '⬠' },
  { type: 'd100', sides: 100, color: 'bg-dragon-red', icon: '⬠' },
];

export const rollDice = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

export const performDiceRoll = (
  diceType: DiceType,
  count: number,
  modifier: number,
  rollType: RollType,
  playerName: string
): DiceRoll => {
  const diceSet = DICE_SETS.find((dice) => dice.type === diceType);
  
  if (!diceSet) {
    throw new Error(`Invalid dice type: ${diceType}`);
  }

  let results: number[] = [];
  
  // Roll the dice
  for (let i = 0; i < count; i++) {
    results.push(rollDice(diceSet.sides));
  }

  // Handle advantage/disadvantage (roll an extra die and take highest/lowest)
  if ((rollType === 'advantage' || rollType === 'disadvantage') && count === 1) {
    const extraRoll = rollDice(diceSet.sides);
    results.push(extraRoll);
    
    if (rollType === 'advantage') {
      results = [Math.max(...results)];
    } else {
      results = [Math.min(...results)];
    }
  }

  // Calculate the total
  const diceSum = results.reduce((sum, result) => sum + result, 0);
  const total = diceSum + modifier;

  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
  const modifierText = roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier < 0 ? `${roll.modifier}` : '';
  const diceText = `${roll.count}${roll.diceType}${modifierText}`;
  const rollTypeText = roll.rollType !== 'normal' ? ` (${roll.rollType})` : '';
  
  return `${roll.playerName} rolled ${diceText}${rollTypeText}: [${roll.results.join(', ')}]${modifierText} = ${roll.total}`;
};
