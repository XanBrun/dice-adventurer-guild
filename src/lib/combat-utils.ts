
import { generateRandomId } from './dice-utils';
import { Character } from './character-utils';

// Types for combat system
export interface Enemy {
  id: string;
  name: string;
  stats: {
    hp: number;
    maxHp: number;
    ac: number;
    initiative: number;
  };
  attacks: EnemyAttack[];
}

export interface EnemyAttack {
  name: string;
  bonus: number;
  damage: string; // e.g. "1d8+3"
  description?: string;
}

export interface CombatParticipant {
  id: string;
  name: string;
  initiativeRoll: number;
}

export type CombatActionType = 'attack' | 'defend' | 'skill';

export interface CombatAction {
  type: CombatActionType;
  description: string;
  timestamp: Date;
}

export interface CombatTurn {
  id: string;
  combatantId: string;
  combatantName: string;
  initiative: number;
  isPlayer: boolean;
  actions: CombatAction[];
}

// Roll initiative for a combatant (Player or Enemy)
export const rollInitiative = (combatant: Character | Enemy): number => {
  // Roll d20 for initiative
  const roll = Math.floor(Math.random() * 20) + 1;
  
  // Add initiative modifier from combatant
  let modifier = 0;
  
  if ('class' in combatant) {
    // It's a player character
    modifier = Math.floor((combatant.attributes.dexterity - 10) / 2);
  } else {
    // It's an enemy
    modifier = combatant.stats.initiative;
  }
  
  return roll + modifier;
};

export const createEnemy = (name: string, hp: number): Enemy => {
  return {
    id: generateRandomId(),
    name,
    stats: {
      hp,
      maxHp: hp,
      ac: 10,
      initiative: 0
    },
    attacks: []
  };
};
