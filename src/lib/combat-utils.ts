
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

// Combat Rules Constants
export const STANDARD_ACTIONS = [
  {
    name: "Atacar",
    description: "Realiza un ataque cuerpo a cuerpo o a distancia contra un objetivo."
  },
  {
    name: "Lanzar un hechizo",
    description: "Lanza un hechizo con un tiempo de lanzamiento de 1 acción."
  },
  {
    name: "Correr",
    description: "Aumenta tu velocidad de movimiento en este turno."
  },
  {
    name: "Esquivar",
    description: "Te concentras en evitar ataques, dando desventaja a los ataques contra ti."
  },
  {
    name: "Ayudar",
    description: "Das ventaja a un aliado en una tirada de característica o ataque."
  },
  {
    name: "Esconderse",
    description: "Intentas esconderte de los enemigos."
  }
];

export const BONUS_ACTIONS = [
  {
    name: "Ataque con arma secundaria",
    description: "Cuando usas la acción de Atacar con un arma ligera en una mano, puedes usar una bonusacción para atacar con otra arma ligera que tengas en la otra mano."
  },
  {
    name: "Lanzar un hechizo rápido",
    description: "Algunos hechizos pueden lanzarse como bonusacción."
  },
  {
    name: "Activar habilidades de clase",
    description: "Muchas habilidades de clase utilizan una bonusacción para activarse."
  }
];

export const REACTIONS = [
  {
    name: "Ataque de oportunidad",
    description: "Cuando un enemigo sale de tu alcance, puedes usar tu reacción para realizar un ataque cuerpo a cuerpo contra él."
  },
  {
    name: "Hechizos de reacción",
    description: "Algunos hechizos pueden lanzarse como reacción cuando se cumple una condición específica."
  },
  {
    name: "Habilidades defensivas",
    description: "Ciertas habilidades te permiten reducir el daño o evitar efectos como reacción."
  }
];

export const CONDITIONS = [
  {
    name: "Aturdido",
    description: "No puedes realizar acciones, bonusacciones o reacciones, y fallas automáticamente tiradas de Fuerza y Destreza."
  },
  {
    name: "Cegado",
    description: "No puedes ver, fallas automáticamente cualquier tirada que requiera vista, y los ataques contra ti tienen ventaja."
  },
  {
    name: "Derribado",
    description: "Tu única opción de movimiento es gatear, tienes desventaja en tiradas de ataque, y los ataques contra ti tienen ventaja si están a 5 pies."
  },
  {
    name: "Paralizado",
    description: "No puedes realizar ninguna acción, bonusacción o reacción, fallas automáticamente tiradas de Fuerza y Destreza, y los ataques contra ti tienen ventaja."
  }
];

export const COVER_RULES = [
  {
    name: "Cobertura media (1/2)",
    description: "Un objetivo tiene cobertura media si un obstáculo bloquea al menos la mitad de su cuerpo. El objetivo recibe +2 a la CA y tiradas de salvación de Destreza."
  },
  {
    name: "Cobertura tres cuartos (3/4)",
    description: "Un objetivo tiene cobertura tres cuartos si aproximadamente tres cuartos de su cuerpo están cubiertos. El objetivo recibe +5 a la CA y tiradas de salvación de Destreza."
  },
  {
    name: "Cobertura total",
    description: "Un objetivo tiene cobertura total si está completamente oculto. No puede ser blanco directo de un ataque o un hechizo."
  }
];

export const CRITICAL_HIT_RULES = {
  description: "Cuando obtienes un 20 natural en una tirada de ataque, aciertas automáticamente e infliges daño crítico. Tira los dados de daño dos veces y suma los resultados más los modificadores."
};

export const INITIATIVE_VARIANTS = [
  {
    name: "Estándar",
    description: "Cada participante hace una tirada de iniciativa (d20 + modificador de Destreza) al inicio del combate. El orden de mayor a menor determina el turno."
  },
  {
    name: "Por grupo",
    description: "Todos los jugadores actúan en un mismo turno, seguido por todos los enemigos. Se usa una sola tirada de iniciativa por grupo."
  },
  {
    name: "Cíclica",
    description: "Al final de cada ronda, todos vuelven a tirar iniciativa para determinar el orden de la siguiente ronda."
  }
];

// Roll initiative for a combatant (Player or Enemy)
export const rollInitiative = (combatant: Character | Enemy): number => {
  // Roll d20 for initiative
  const roll = Math.floor(Math.random() * 20) + 1;
  
  // Add initiative modifier from combatant
  let modifier = 0;
  
  if ('class' in combatant) {
    // It's a player character
    // Since Character no longer has attributes directly, use a default value for now
    modifier = 0; // Default for now, could be improved later
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
