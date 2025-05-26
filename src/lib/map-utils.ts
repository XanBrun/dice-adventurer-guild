
export interface MapData {
  id: string;
  name: string;
  imagePath: string;
  description: string;
  type: 'world' | 'dungeon' | 'city' | 'region';
  campaignId: string;
}

export const mapTypes = [
  { id: 'world', name: 'Mapa del mundo' },
  { id: 'dungeon', name: 'Mazmorra' },
  { id: 'city', name: 'Ciudad' },
  { id: 'region', name: 'Región' },
];

export interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'location' | 'quest' | 'enemy' | 'treasure';
  discovered: boolean;
  description?: string;
}

// Mapas de ejemplo para las campañas
const DEMO_MAPS: MapData[] = [
  {
    id: 'map-1',
    name: 'Reino de Valoria',
    imagePath: '/maps/valoria.jpg',
    description: 'El gran reino donde comenzará tu aventura.',
    type: 'world',
    campaignId: 'campaign-1'
  },
  {
    id: 'map-2',
    name: 'Cripta de Azathoth',
    imagePath: '/maps/crypt.jpg',
    description: 'Un antiguo lugar de descanso que esconde muchos secretos.',
    type: 'dungeon',
    campaignId: 'campaign-2'
  },
  {
    id: 'map-3',
    name: 'Ciudad de Eastmarch',
    imagePath: '/maps/city.jpg',
    description: 'La bulliciosa ciudad capital con todos sus secretos.',
    type: 'city',
    campaignId: 'campaign-1'
  }
];

export const getMapsByCampaignId = (campaignId: string): MapData[] => {
  return DEMO_MAPS.filter(map => map.campaignId === campaignId);
};

export const getMapById = (mapId: string): MapData | undefined => {
  return DEMO_MAPS.find(map => map.id === mapId);
};

// Función para generar marcadores aleatorios (para propósitos de demo)
export const generateRandomMarkers = (count: number): MapMarker[] => {
  const markers: MapMarker[] = [];
  const types: ('location' | 'quest' | 'enemy' | 'treasure')[] = ['location', 'quest', 'enemy', 'treasure'];
  const locationNames = [
    'Aldea de Pinares', 'Ruinas Antiguas', 'Montañas del Norte', 'Lago Cristalino',
    'Bosque Oscuro', 'Caverna Profunda', 'Torre del Mago', 'Castillo Abandonado',
    'Posada del Viajero', 'Templo Sagrado', 'Campamento de Bandidos', 'Mina de Hierro'
  ];

  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    markers.push({
      id: `marker-${i}`,
      x: Math.random(),
      y: Math.random(),
      label: locationNames[i % locationNames.length],
      type,
      discovered: Math.random() > 0.3, // 70% de probabilidad de estar descubierto
    });
  }

  return markers;
};
