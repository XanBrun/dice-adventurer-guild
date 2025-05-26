
// Interfaces y utilidades para gestionar personajes de juego

export interface Character {
  id: string;
  name: string;
  level: number;
  race: string;
  class: string;
  abilities: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  modifiers: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hitPoints: {
    max: number;
    current: number;
  };
  armorClass: number;
  initiative: number;
  proficiencyBonus: number;
  skills: Record<string, boolean>; // Habilidades y si es proficiente
  avatarUrl?: string; // URL de la imagen del personaje (opcional)
  description?: string; // Descripción del personaje (opcional)
  createdAt: Date;
  updatedAt: Date;
}

export interface Enemy extends Omit<Character, 'race' | 'class'> {
  type: string; // El tipo de criatura
  challenge: number; // Nivel de desafío
  isNPC: boolean; // Si es un NPC o un enemigo
}

export const DEFAULT_SKILLS = [
  "acrobatics", "animalHandling", "arcana", "athletics", 
  "deception", "history", "insight", "intimidation", 
  "investigation", "medicine", "nature", "perception", 
  "performance", "persuasion", "religion", "sleightOfHand", 
  "stealth", "survival"
];

export const SKILL_NAMES_SPANISH = {
  "acrobatics": "Acrobacias",
  "animalHandling": "Trato con Animales",
  "arcana": "Arcano",
  "athletics": "Atletismo",
  "deception": "Engaño",
  "history": "Historia",
  "insight": "Perspicacia",
  "intimidation": "Intimidación",
  "investigation": "Investigación",
  "medicine": "Medicina",
  "nature": "Naturaleza",
  "perception": "Percepción",
  "performance": "Interpretación",
  "persuasion": "Persuasión",
  "religion": "Religión",
  "sleightOfHand": "Juego de Manos",
  "stealth": "Sigilo",
  "survival": "Supervivencia"
};

export const SKILL_ABILITY_MAP = {
  "acrobatics": "dexterity",
  "animalHandling": "wisdom",
  "arcana": "intelligence",
  "athletics": "strength",
  "deception": "charisma",
  "history": "intelligence",
  "insight": "wisdom",
  "intimidation": "charisma",
  "investigation": "intelligence",
  "medicine": "wisdom",
  "nature": "intelligence",
  "perception": "wisdom",
  "performance": "charisma",
  "persuasion": "charisma",
  "religion": "intelligence",
  "sleightOfHand": "dexterity",
  "stealth": "dexterity",
  "survival": "wisdom"
};

export const ABILITY_NAMES = [
  "strength", "dexterity", "constitution", 
  "intelligence", "wisdom", "charisma"
];

export const ABILITY_NAMES_SPANISH = {
  "strength": "Fuerza",
  "dexterity": "Destreza",
  "constitution": "Constitución",
  "intelligence": "Inteligencia",
  "wisdom": "Sabiduría",
  "charisma": "Carisma"
};

export const CHARACTER_RACES = [
  "Humano", "Elfo", "Enano", "Halfling", "Gnomo", 
  "Semielfo", "Semiorco", "Tiefling", "Dracónido"
];

export const CHARACTER_CLASSES = [
  "Bárbaro", "Bardo", "Brujo", "Clérigo", "Druida", 
  "Explorador", "Guerrero", "Hechicero", "Mago", "Monje", 
  "Paladín", "Pícaro"
];

export const ENEMY_TYPES = [
  "Humanoide", "Bestia", "Dragón", "Aberración",
  "Celestial", "Constructo", "Elemental", "Hada",
  "Demonio", "Gigante", "Monstruosidad", "Muerto viviente",
  "Planta", "Viscoso"
];

// Lista de avatares predeterminados para personajes
export const DEFAULT_AVATARS = [
  "/avatars/warrior.png",
  "/avatars/mage.png",
  "/avatars/rogue.png",
  "/avatars/cleric.png",
  "/avatars/ranger.png",
  "/avatars/bard.png",
  "/avatars/default.png"
];

// Calcular el modificador según la puntuación de habilidad
export const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

// Obtener un avatar predeterminado según la clase
export const getDefaultAvatarByClass = (characterClass: string): string => {
  switch (characterClass.toLowerCase()) {
    case "guerrero":
    case "bárbaro":
    case "paladín":
      return "/avatars/warrior.png";
    case "mago":
    case "hechicero":
    case "brujo":
      return "/avatars/mage.png";
    case "pícaro":
      return "/avatars/rogue.png";
    case "clérigo":
    case "druida":
      return "/avatars/cleric.png";
    case "explorador":
      return "/avatars/ranger.png";
    case "bardo":
      return "/avatars/bard.png";
    default:
      return "/avatars/default.png";
  }
};

// Crear un nuevo personaje con valores predeterminados
export const createDefaultCharacter = (name: string = "Nuevo Aventurero"): Character => {
  const id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const defaultAbilities = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  };

  // Calcular modificadores iniciales
  const modifiers = {} as Record<string, number>;
  Object.entries(defaultAbilities).forEach(([ability, value]) => {
    modifiers[ability] = calculateModifier(value);
  });

  // Crear objeto de habilidades con proficiencias iniciales en false
  const skills = {} as Record<string, boolean>;
  DEFAULT_SKILLS.forEach(skill => {
    skills[skill] = false;
  });

  return {
    id,
    name,
    level: 1,
    race: 'Humano',
    class: 'Guerrero',
    abilities: defaultAbilities,
    modifiers: modifiers as Character['modifiers'],
    hitPoints: {
      max: 10,
      current: 10
    },
    armorClass: 10,
    initiative: modifiers.dexterity,
    proficiencyBonus: 2,
    skills,
    avatarUrl: getDefaultAvatarByClass('Guerrero'),
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Crear un enemigo con valores predeterminados
export const createDefaultEnemy = (name: string = "Enemigo"): Enemy => {
  const character = createDefaultCharacter(name);
  
  return {
    ...character,
    type: ENEMY_TYPES[0],
    challenge: 1,
    isNPC: false,
  };
};

// Guardar personajes en el localStorage
export const saveCharacter = (character: Character): void => {
  try {
    // Actualizar la fecha de modificación
    character.updatedAt = new Date();
    
    // Obtener los personajes guardados
    const savedCharacters = JSON.parse(localStorage.getItem('characters') || '[]');
    
    // Verificar si el personaje ya existe
    const index = savedCharacters.findIndex((c: Character) => c.id === character.id);
    
    if (index >= 0) {
      // Actualizar personaje existente
      savedCharacters[index] = character;
    } else {
      // Añadir nuevo personaje
      savedCharacters.push(character);
    }
    
    localStorage.setItem('characters', JSON.stringify(savedCharacters));
  } catch (error) {
    console.error('Error al guardar el personaje:', error);
  }
};

// Cargar personajes desde localStorage
export const loadCharacters = (): Character[] => {
  try {
    const characters = JSON.parse(localStorage.getItem('characters') || '[]');
    
    // Convertir las fechas de string a Date
    return characters.map((character: any) => ({
      ...character,
      createdAt: new Date(character.createdAt),
      updatedAt: new Date(character.updatedAt)
    }));
  } catch (error) {
    console.error('Error al cargar personajes:', error);
    return [];
  }
};

// Obtener un personaje específico por ID o el primero si no se especifica ID
export const getCharacter = (characterId?: string): Character | null => {
  try {
    const characters = loadCharacters();
    
    if (characterId) {
      // Buscar por ID específico
      const character = characters.find(c => c.id === characterId);
      return character || null;
    } else if (characters.length > 0) {
      // Devolver el primer personaje si existe
      return characters[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener el personaje:', error);
    return null;
  }
};

// Eliminar un personaje
export const deleteCharacter = (characterId: string): void => {
  try {
    const savedCharacters = JSON.parse(localStorage.getItem('characters') || '[]');
    const updatedCharacters = savedCharacters.filter((c: Character) => c.id !== characterId);
    localStorage.setItem('characters', JSON.stringify(updatedCharacters));
  } catch (error) {
    console.error('Error al eliminar el personaje:', error);
  }
};

// Calcular valor total de una habilidad (modificador de habilidad + proficiencia si aplica)
export const calculateSkillValue = (
  character: Character,
  skillName: string
): number => {
  const ability = SKILL_ABILITY_MAP[skillName as keyof typeof SKILL_ABILITY_MAP];
  const abilityMod = character.modifiers[ability as keyof typeof character.modifiers];
  const isProficient = character.skills[skillName] || false;

  return abilityMod + (isProficient ? character.proficiencyBonus : 0);
};
