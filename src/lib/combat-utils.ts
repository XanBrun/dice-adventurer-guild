
export type AttackType = 'melee' | 'ranged' | 'spell';
export type DamageType = 'slashing' | 'piercing' | 'bludgeoning' | 'fire' | 'cold' | 'lightning' | 'acid' | 'poison' | 'necrotic' | 'radiant' | 'force' | 'psychic' | 'thunder';

export interface CombatAction {
  name: string;
  type: 'action' | 'bonus' | 'reaction' | 'free';
  description: string;
}

export interface Condition {
  name: string;
  description: string;
  effects: string[];
}

// Standard combat actions
export const STANDARD_ACTIONS: CombatAction[] = [
  {
    name: "Atacar",
    type: "action",
    description: "Realiza un ataque cuerpo a cuerpo o a distancia contra un objetivo."
  },
  {
    name: "Lanzar hechizo",
    type: "action",
    description: "Lanza un hechizo con un tiempo de lanzamiento de 1 acción."
  },
  {
    name: "Esquivar",
    type: "action",
    description: "Te concentras en evitar ataques. Los ataques contra ti tienen desventaja y tienes ventaja en tiradas de salvación de Destreza."
  },
  {
    name: "Ayudar",
    type: "action",
    description: "Ayuda a un aliado, dándole ventaja en su próxima tirada de habilidad o ataque contra un objetivo que puedas ver."
  },
  {
    name: "Esconderse",
    type: "action",
    description: "Intenta esconderte, haciendo una tirada de Destreza (Sigilo)."
  },
  {
    name: "Preparar",
    type: "action",
    description: "Prepara una acción para un desencadenante específico que ocurra antes de tu siguiente turno."
  },
  {
    name: "Usar objeto",
    type: "action",
    description: "Interactúa con un segundo objeto o característica del entorno."
  },
  {
    name: "Correr",
    type: "action",
    description: "Aumenta tu movimiento por tu velocidad de nuevo después de usar tu movimiento normal."
  },
  {
    name: "Desenganchar",
    type: "action",
    description: "Tu movimiento no provoca ataques de oportunidad durante este turno."
  }
];

// Bonus actions
export const BONUS_ACTIONS: CombatAction[] = [
  {
    name: "Acción adicional",
    type: "bonus",
    description: "Una acción adicional otorgada por una habilidad de clase, hechizo, u otra característica."
  },
  {
    name: "Ataque fuera de mano",
    type: "bonus",
    description: "Cuando usas la acción de Atacar con un arma ligera a una mano, puedes usar una acción adicional para atacar con otra arma ligera que tengas en la otra mano."
  }
];

// Reactions
export const REACTIONS: CombatAction[] = [
  {
    name: "Ataque de oportunidad",
    type: "reaction",
    description: "Cuando un enemigo sale de tu alcance, puedes usar tu reacción para hacer un ataque cuerpo a cuerpo contra él."
  },
  {
    name: "Lanzar hechizo",
    type: "reaction",
    description: "Lanzar un hechizo con un tiempo de lanzamiento de 1 reacción."
  },
  {
    name: "Característica especial",
    type: "reaction",
    description: "Usar una característica de clase o racial que requiere una reacción."
  }
];

// Conditions
export const CONDITIONS: Condition[] = [
  {
    name: "Apresado",
    description: "Un personaje apresado tiene su velocidad reducida a 0, y no puede beneficiarse de bonificadores a su velocidad.",
    effects: [
      "Velocidad reducida a 0",
      "No se beneficia de bonificadores a la velocidad",
      "Desventaja en ataques",
      "Desventaja en tiradas de salvación de Destreza",
      "Ventaja para los atacantes"
    ]
  },
  {
    name: "Aturdido",
    description: "Un personaje aturdido está incapacitado, no puede moverse, y sólo puede hablar confusamente.",
    effects: [
      "Incapacitado",
      "No puede moverse",
      "Solo puede hablar confusamente",
      "Falla automáticamente las tiradas de salvación de Fuerza y Destreza",
      "Ventaja para los atacantes"
    ]
  },
  {
    name: "Cegado",
    description: "Un personaje cegado no puede ver y falla automáticamente cualquier prueba de característica que requiera la vista.",
    effects: [
      "Falla automáticamente pruebas que requieran vista",
      "Desventaja en tiradas de ataque",
      "Los ataques contra la criatura tienen ventaja"
    ]
  },
  {
    name: "Derribado",
    description: "Un personaje derribado solo puede moverse arrastrándose, a menos que se levante.",
    effects: [
      "Solo puede moverse arrastrándose",
      "Desventaja en tiradas de ataque",
      "Ventaja en ataques cuerpo a cuerpo contra la criatura",
      "Desventaja en ataques a distancia contra la criatura"
    ]
  },
  {
    name: "Envenenado",
    description: "Un personaje envenenado sufre desventaja en las tiradas de ataque y las pruebas de característica.",
    effects: [
      "Desventaja en tiradas de ataque",
      "Desventaja en pruebas de característica"
    ]
  },
  {
    name: "Inconsciente",
    description: "Un personaje inconsciente está incapacitado, no puede moverse ni hablar, y no es consciente de su entorno.",
    effects: [
      "Incapacitado",
      "No puede moverse ni hablar",
      "No es consciente del entorno",
      "Deja caer lo que esté sosteniendo y cae derribado",
      "Falla automáticamente tiradas de salvación de Fuerza y Destreza",
      "Ventaja para los atacantes",
      "Los ataques cuerpo a cuerpo que impactan son críticos si el atacante está a 5 pies"
    ]
  }
];

// Cover rules
export const COVER_RULES = {
  "Media cobertura": "Un objetivo tiene media cobertura si un obstáculo bloquea al menos la mitad de su cuerpo. El objetivo tiene un +2 a su CA y a las tiradas de salvación de Destreza.",
  "Tres cuartos de cobertura": "Un objetivo tiene tres cuartos de cobertura si aproximadamente tres cuartos de él están cubiertos por un obstáculo. El objetivo tiene un +5 a su CA y a las tiradas de salvación de Destreza.",
  "Cobertura total": "Un objetivo tiene cobertura total si está completamente oculto por un obstáculo. No puede ser objetivo directo de un ataque o un hechizo."
};

// Critical hit rules
export const CRITICAL_HIT_RULES = {
  "Regla básica": "Cuando obtienes un crítico, tira todos los dados de daño del ataque dos veces y súmalos, junto con cualquier modificador relevante.",
  "Regla de máximo daño": "En lugar de tirar el daño dos veces, haz el máximo daño posible en una tirada y luego añade el resultado de tirar los dados normalmente.",
  "Regla de daño adicional": "Añade dados de daño adicionales según el nivel o tipo de arma."
};

// Initiative variants
export const INITIATIVE_VARIANTS = {
  "Individual": "Cada personaje tira iniciativa por separado.",
  "Grupal": "Cada grupo (jugadores, enemigos) tira una única iniciativa y todos los miembros del grupo actúan al mismo tiempo.",
  "Dexteridad pura": "En lugar de tirar el d20, usa solo el modificador de Destreza para determinar el orden de iniciativa.",
  "Naipes": "Usa una baraja de cartas para determinar el orden de iniciativa, donde cada jugador recibe una carta y actúa según el valor de la carta."
};

// Calculate advantage and disadvantage
export const calculateAdvantageDisadvantage = (
  hasAdvantage: boolean,
  hasDisadvantage: boolean
): 'normal' | 'advantage' | 'disadvantage' => {
  if (hasAdvantage && !hasDisadvantage) return 'advantage';
  if (!hasAdvantage && hasDisadvantage) return 'disadvantage';
  return 'normal';
};

// Check if attack hits
export const checkAttackHit = (
  attackRoll: number,
  armorClass: number,
  isCritical: boolean = false
): boolean => {
  if (isCritical) return true;
  return attackRoll >= armorClass;
};

// Calculate combat advantage based on positions
export const calculatePositionalAdvantage = (
  attackerPosition: string,
  targetPosition: string,
  targetIsUnaware: boolean = false
): 'normal' | 'advantage' | 'disadvantage' => {
  // Sample logic - would be expanded in a real implementation
  if (targetIsUnaware) return 'advantage';
  if (targetPosition === 'prone' && attackerPosition === 'melee') return 'advantage';
  if (targetPosition === 'prone' && attackerPosition === 'ranged') return 'disadvantage';
  
  return 'normal';
};
