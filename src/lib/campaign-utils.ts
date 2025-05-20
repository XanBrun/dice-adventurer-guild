
export interface Campaign {
  id: string;
  name: string;
  description: string;
  adventures: Adventure[];
  difficulty: 'easy' | 'medium' | 'hard';
  minLevel: number;
  maxLevel: number;
  thumbnail: string;
}

export interface Adventure {
  id: string;
  name: string;
  description: string;
  encounters: Encounter[];
  objectives: string[];
  rewards: Reward[];
}

export interface Encounter {
  id: string;
  title: string;
  description: string;
  enemies?: Enemy[];
  challenge?: string;
  treasure?: Treasure[];
}

export interface Enemy {
  name: string;
  stats: {
    hp: number;
    ac: number;
    initiative: number;
  };
  attacks: Attack[];
}

export interface Attack {
  name: string;
  diceType: string;
  count: number;
  modifier: number;
  damage: string;
}

export interface Treasure {
  name: string;
  type: 'gold' | 'item' | 'weapon' | 'armor' | 'magic';
  value: number;
  rarity?: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary';
  description?: string;
}

export interface Reward {
  name: string;
  description: string;
  type: 'gold' | 'item' | 'xp' | 'ability';
  value: number;
}

// Campañas predefinidas
export const PREDEFINED_CAMPAIGNS: Campaign[] = [
  {
    id: 'c-001',
    name: 'La Cripta de los Antiguos',
    description: 'Explora una antigua cripta llena de tesoros y peligros ancestrales.',
    difficulty: 'easy',
    minLevel: 1,
    maxLevel: 3,
    thumbnail: '/campaigns/crypt.jpg',
    adventures: [
      {
        id: 'a-001',
        name: 'El Bosque Sombrío',
        description: 'Navega por el bosque que oculta la entrada a la cripta ancestral.',
        objectives: [
          'Encontrar el mapa de la cripta',
          'Derrotar al guardián del bosque',
          'Descubrir la entrada secreta'
        ],
        encounters: [
          {
            id: 'e-001',
            title: 'Emboscada Goblin',
            description: 'Un grupo de goblins te embosca mientras acampas!',
            enemies: [
              {
                name: 'Goblin Scout',
                stats: {
                  hp: 7,
                  ac: 15,
                  initiative: 2
                },
                attacks: [
                  {
                    name: 'Dagger',
                    diceType: 'd4',
                    count: 1,
                    modifier: 2,
                    damage: 'piercing'
                  }
                ]
              },
              {
                name: 'Goblin Leader',
                stats: {
                  hp: 12,
                  ac: 16,
                  initiative: 3
                },
                attacks: [
                  {
                    name: 'Scimitar',
                    diceType: 'd6',
                    count: 1,
                    modifier: 3,
                    damage: 'slashing'
                  }
                ]
              }
            ],
            treasure: [
              {
                name: 'Small Pouch of Gold',
                type: 'gold',
                value: 25
              },
              {
                name: 'Map Fragment',
                type: 'item',
                value: 0,
                rarity: 'common',
                description: 'Un trozo de mapa que parece indicar la ubicación de la cripta'
              }
            ]
          },
          {
            id: 'e-002',
            title: 'El Guardián del Bosque',
            description: 'Un antiguo constructo de madera y piedra bloquea tu camino.',
            enemies: [
              {
                name: 'Forest Guardian',
                stats: {
                  hp: 45,
                  ac: 14,
                  initiative: 0
                },
                attacks: [
                  {
                    name: 'Root Slam',
                    diceType: 'd8',
                    count: 2,
                    modifier: 4,
                    damage: 'bludgeoning'
                  },
                  {
                    name: 'Thorn Spray',
                    diceType: 'd6',
                    count: 3,
                    modifier: 2,
                    damage: 'piercing'
                  }
                ]
              }
            ],
            treasure: [
              {
                name: 'Llave de Piedra',
                type: 'item',
                value: 0,
                rarity: 'uncommon',
                description: 'Una llave tallada en piedra antigua con símbolos arcanos'
              }
            ]
          }
        ],
        rewards: [
          {
            name: 'Mapa de la Cripta',
            description: 'Un mapa detallado que muestra la disposición de la Cripta de los Antiguos',
            type: 'item',
            value: 0
          },
          {
            name: 'Oro del Guardián',
            description: 'Oro encontrado en los restos del guardián',
            type: 'gold',
            value: 100
          },
          {
            name: 'Experiencia del Bosque',
            description: 'Experiencia ganada por superar los desafíos del bosque',
            type: 'xp',
            value: 300
          }
        ]
      },
      {
        id: 'a-002',
        name: 'Las Catacumbas Olvidadas',
        description: 'Explora las catacumbas bajo la cripta y enfrenta a los no-muertos que la protegen.',
        objectives: [
          'Derrotar al nigromante',
          'Encontrar la cámara del tesoro',
          'Recuperar el amuleto ancestral'
        ],
        encounters: [
          {
            id: 'e-003',
            title: 'Esqueletos Guardianes',
            description: 'Un grupo de esqueletos defiende la entrada a la cámara principal.',
            enemies: [
              {
                name: 'Skeleton Warrior',
                stats: {
                  hp: 13,
                  ac: 13,
                  initiative: 2
                },
                attacks: [
                  {
                    name: 'Rusty Sword',
                    diceType: 'd6',
                    count: 1,
                    modifier: 2,
                    damage: 'slashing'
                  }
                ]
              }
            ]
          },
          {
            id: 'e-004',
            title: 'El Nigromante',
            description: 'El maestro de los no-muertos se prepara para el combate.',
            enemies: [
              {
                name: 'Apprentice Necromancer',
                stats: {
                  hp: 24,
                  ac: 12,
                  initiative: 2
                },
                attacks: [
                  {
                    name: 'Necrotic Touch',
                    diceType: 'd8',
                    count: 1,
                    modifier: 4,
                    damage: 'necrotic'
                  },
                  {
                    name: 'Shadow Bolt',
                    diceType: 'd10',
                    count: 1,
                    modifier: 3,
                    damage: 'necrotic'
                  }
                ]
              }
            ],
            treasure: [
              {
                name: 'Amuleto Ancestral',
                type: 'magic',
                value: 250,
                rarity: 'rare',
                description: 'Un amuleto que otorga +1 a las tiradas de salvación'
              },
              {
                name: 'Grimorio Arcano',
                type: 'item',
                value: 75,
                rarity: 'uncommon',
                description: 'Un libro con hechizos necrománticos básicos'
              }
            ]
          }
        ],
        rewards: [
          {
            name: 'Amuleto Ancestral',
            description: 'Un poderoso amuleto que otorga protección contra lo arcano',
            type: 'item',
            value: 0
          },
          {
            name: 'Tesoro de la Cripta',
            description: 'Monedas y gemas encontradas en la cámara del tesoro',
            type: 'gold',
            value: 350
          },
          {
            name: 'Conocimiento Arcano',
            description: 'Habilidad especial para detectar magia una vez al día',
            type: 'ability',
            value: 0
          },
          {
            name: 'Experiencia de las Catacumbas',
            description: 'Experiencia ganada por derrotar al nigromante y sus secuaces',
            type: 'xp',
            value: 500
          }
        ]
      }
    ]
  },
  {
    id: 'c-002',
    name: 'La Amenaza del Dragón',
    description: 'Un dragón rojo amenaza el valle. Detén su reinado de terror.',
    difficulty: 'hard',
    minLevel: 5,
    maxLevel: 8,
    thumbnail: '/campaigns/dragon.jpg',
    adventures: [
      {
        id: 'a-003',
        name: 'La Aldea Quemada',
        description: 'Investiga los ataques del dragón en una aldea local',
        objectives: [
          'Rescatar a los supervivientes',
          'Encontrar pistas sobre el paradero del dragón',
          'Defender la aldea de los kobolds'
        ],
        encounters: [
          {
            id: 'e-005',
            title: 'Kobolds Saqueadores',
            description: 'Un grupo de kobolds ataca a los supervivientes.',
            enemies: [
              {
                name: 'Kobold Fighter',
                stats: {
                  hp: 15,
                  ac: 13,
                  initiative: 2
                },
                attacks: [
                  {
                    name: 'Spear',
                    diceType: 'd6',
                    count: 1,
                    modifier: 3,
                    damage: 'piercing'
                  }
                ]
              }
            ]
          }
        ],
        rewards: [
          {
            name: 'Mapa de la Montaña',
            description: 'Un mapa que muestra la ubicación de la guarida del dragón',
            type: 'item',
            value: 0
          },
          {
            name: 'Gratitud de la Aldea',
            description: 'Oro recaudado por los aldeanos agradecidos',
            type: 'gold',
            value: 200
          }
        ]
      }
    ]
  }
];

export const getCampaignById = (id: string): Campaign | undefined => {
  return PREDEFINED_CAMPAIGNS.find(campaign => campaign.id === id);
};

export const getAdventureById = (campaignId: string, adventureId: string): Adventure | undefined => {
  const campaign = getCampaignById(campaignId);
  if (!campaign) return undefined;
  
  return campaign.adventures.find(adventure => adventure.id === adventureId);
};

export const getEncounterById = (
  campaignId: string, 
  adventureId: string, 
  encounterId: string
): Encounter | undefined => {
  const adventure = getAdventureById(campaignId, adventureId);
  if (!adventure) return undefined;
  
  return adventure.encounters.find(encounter => encounter.id === encounterId);
};
