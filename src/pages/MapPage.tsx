
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Map as MapIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCampaignById } from "@/lib/campaign-utils";
import { MapData, MapMarker, getMapsByCampaignId, generateRandomMarkers } from "@/lib/map-utils";
import Map from "@/components/Map";
import { toast } from "@/components/ui/sonner";

const MapPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [maps, setMaps] = useState<MapData[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  
  useEffect(() => {
    if (campaignId) {
      const campaign = getCampaignById(campaignId);
      if (!campaign) {
        navigate('/campaigns');
        toast.error("Campaña no encontrada");
        return;
      }

      // Cargar mapas de la campaña
      const campaignMaps = getMapsByCampaignId(campaignId);
      setMaps(campaignMaps);
      
      if (campaignMaps.length > 0) {
        setSelectedMapId(campaignMaps[0].id);
        
        // Intentar cargar marcadores guardados o generar aleatorios
        try {
          const savedMarkers = localStorage.getItem(`map-markers-${campaignMaps[0].id}`);
          if (savedMarkers) {
            setMarkers(JSON.parse(savedMarkers));
          } else {
            // Para demo, generamos marcadores aleatorios
            setMarkers(generateRandomMarkers(5));
          }
        } catch (error) {
          console.error("Error loading map markers:", error);
          setMarkers(generateRandomMarkers(5));
        }
      }
    }
  }, [campaignId, navigate]);
  
  const handleMapChange = (mapId: string) => {
    setSelectedMapId(mapId);
    
    // Cargar marcadores para el mapa seleccionado
    try {
      const savedMarkers = localStorage.getItem(`map-markers-${mapId}`);
      if (savedMarkers) {
        setMarkers(JSON.parse(savedMarkers));
      } else {
        // Para demo, generamos marcadores aleatorios
        setMarkers(generateRandomMarkers(3 + Math.floor(Math.random() * 5)));
      }
    } catch (error) {
      console.error("Error loading map markers:", error);
      setMarkers(generateRandomMarkers(5));
    }
  };
  
  const handleMarkerAdded = (marker: MapMarker) => {
    setMarkers(prev => [...prev, marker]);
    toast.success("Marcador añadido", {
      description: `Punto "${marker.label}" añadido al mapa`,
    });
  };
  
  const handleMarkerRemoved = (markerId: string) => {
    setMarkers(prev => prev.filter(m => m.id !== markerId));
    toast.info("Marcador eliminado");
  };
  
  const selectedMap = maps.find(map => map.id === selectedMapId);
  
  if (maps.length === 0) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/campaigns')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a campañas
          </Button>
          
          <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
            <CardContent className="p-10 text-center">
              <MapIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-medieval mb-2">No hay mapas disponibles</h2>
              <p className="text-muted-foreground mb-6">
                Esta campaña no tiene mapas interactivos disponibles.
              </p>
              <Button onClick={() => navigate('/campaigns')}>
                Volver a campañas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate(`/campaigns/${campaignId}`)}
                className="mb-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la campaña
              </Button>
              <h1 className="text-3xl md:text-4xl font-medieval text-primary">
                Mapas interactivos
              </h1>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => setIsEditMode(!isEditMode)}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                {isEditMode ? 'Modo visualización' : 'Modo edición'}
              </Button>
            </div>
          </div>
          
          <Tabs 
            value={selectedMapId || ''} 
            onValueChange={handleMapChange}
            className="w-full"
          >
            <TabsList className="w-full mb-4 overflow-auto">
              {maps.map((map) => (
                <TabsTrigger 
                  key={map.id} 
                  value={map.id}
                  className="font-medieval"
                >
                  {map.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {maps.map((map) => (
              <TabsContent 
                key={map.id} 
                value={map.id}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row gap-4 items-start mb-4">
                  <div className="w-full md:w-3/4">
                    <Map
                      mapImage={map.imagePath}
                      campaignId={campaignId}
                      markers={markers}
                      onMarkerAdded={handleMarkerAdded}
                      onMarkerRemoved={handleMarkerRemoved}
                      isEditable={isEditMode}
                    />
                  </div>
                  <div className="w-full md:w-1/4">
                    <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <h3 className="font-medieval text-lg mb-2">{map.name}</h3>
                        <Badge>{map.type}</Badge>
                        <p className="mt-4 text-muted-foreground">{map.description}</p>
                        
                        <Separator className="my-4" />
                        
                        <div className="space-y-2">
                          <h4 className="font-medieval">Lugares marcados</h4>
                          <div className="text-sm">
                            {markers.filter(m => m.discovered).length} descubiertos de {markers.length} totales
                          </div>
                          <ul className="space-y-1 max-h-[200px] overflow-y-auto">
                            {markers.filter(m => m.discovered).map(marker => (
                              <li key={marker.id} className="flex items-center gap-2 text-sm">
                                <MapPin className="h-3 w-3" />
                                <span>{marker.label}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default MapPage;
