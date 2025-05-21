
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

export type DiceCombination = {
  diceType: DiceType;
  count: number;
};

export type CombinedDiceRoll = {
  id: string;
  dice: DiceCombination[];
  modifier: number;
  rollType: RollType;
  results: {diceType: DiceType, values: number[]}[];
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

export const performCombinedDiceRoll = (
  dice: DiceCombination[],
  modifier: number,
  rollType: RollType,
  playerName: string
): CombinedDiceRoll => {
  const results: {diceType: DiceType, values: number[]}[] = [];
  let total = modifier;

  // Roll each type of dice
  for (const diceItem of dice) {
    if (diceItem.count <= 0) continue;
    
    const diceSet = DICE_SETS.find((d) => d.type === diceItem.diceType);
    if (!diceSet) {
      throw new Error(`Invalid dice type: ${diceItem.diceType}`);
    }

    const values: number[] = [];
    for (let i = 0; i < diceItem.count; i++) {
      const roll = rollDice(diceSet.sides);
      values.push(roll);
      total += roll;
    }

    results.push({
      diceType: diceItem.diceType,
      values
    });
  }

  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dice,
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

export const formatCombinedRollResult = (roll: CombinedDiceRoll): string => {
  const modifierText = roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier < 0 ? `${roll.modifier}` : '';
  
  let diceText = roll.dice
    .filter(d => d.count > 0)
    .map(d => `${d.count}${d.type}`)
    .join(' + ');
    
  const rollTypeText = roll.rollType !== 'normal' ? ` (${roll.rollType})` : '';
  
  let resultsText = roll.results
    .map(r => `${r.diceType}[${r.values.join(', ')}]`)
    .join(' + ');
    
  if (roll.modifier !== 0) {
    resultsText += modifierText;
  }
  
  return `${roll.playerName} rolled ${diceText}${rollTypeText}: ${resultsText} = ${roll.total}`;
};
