
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, X, Plus, Minus, Home } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/sonner";

interface MapMarker {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'location' | 'quest' | 'enemy' | 'treasure';
  discovered: boolean;
}

interface MapProps {
  mapImage: string;
  campaignId?: string;
  markers?: MapMarker[];
  onMarkerAdded?: (marker: MapMarker) => void;
  onMarkerRemoved?: (markerId: string) => void;
  isEditable?: boolean;
}

const Map: React.FC<MapProps> = ({
  mapImage,
  campaignId,
  markers = [],
  onMarkerAdded,
  onMarkerRemoved,
  isEditable = false
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [addingMarker, setAddingMarker] = useState(false);
  const [localMarkers, setLocalMarkers] = useState<MapMarker[]>(markers);
  const [newMarkerName, setNewMarkerName] = useState<string>('');
  
  // Cargar marcadores de localStorage si no se proporcionan
  useEffect(() => {
    if (markers.length === 0 && campaignId) {
      try {
        const savedMarkers = localStorage.getItem(`map-markers-${campaignId}`);
        if (savedMarkers) {
          setLocalMarkers(JSON.parse(savedMarkers));
        }
      } catch (error) {
        console.error("Error loading map markers:", error);
      }
    } else {
      setLocalMarkers(markers);
    }
  }, [markers, campaignId]);

  // Guardar marcadores en localStorage si el usuario añade/quita
  useEffect(() => {
    if (campaignId && localMarkers.length > 0) {
      try {
        localStorage.setItem(`map-markers-${campaignId}`, JSON.stringify(localMarkers));
      } catch (error) {
        console.error("Error saving map markers:", error);
      }
    }
  }, [localMarkers, campaignId]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    // Limitar el zoom entre 0.5 y 3
    const newScale = Math.min(Math.max(scale - e.deltaY * 0.005, 0.5), 3);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Solo permitir arrastrar cuando no se está agregando un marcador
    if (!addingMarker) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: position.x + e.movementX / scale,
        y: position.y + e.movementY / scale
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!addingMarker || !mapRef.current || !isEditable) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / scale - position.x) / rect.width;
    const y = ((e.clientY - rect.top) / scale - position.y) / rect.height;
    
    // Solo agregar marcador si está dentro del mapa (0-1)
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      const markerName = newMarkerName.trim() || "Nuevo punto";
      
      const newMarker: MapMarker = {
        id: `marker-${Date.now()}`,
        x,
        y,
        label: markerName,
        type: 'location',
        discovered: true
      };
      
      const updatedMarkers = [...localMarkers, newMarker];
      setLocalMarkers(updatedMarkers);
      
      if (onMarkerAdded) {
        onMarkerAdded(newMarker);
      }
      
      // Desactivar modo de agregar marcador después de colocarlo
      setAddingMarker(false);
      setNewMarkerName('');
      
      toast.success("Marca añadida", {
        description: `${markerName} ha sido añadido al mapa`
      });
    }
  };

  const removeMarker = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditable) return;
    
    const markerToRemove = localMarkers.find(m => m.id === id);
    const updatedMarkers = localMarkers.filter(m => m.id !== id);
    setLocalMarkers(updatedMarkers);
    
    if (onMarkerRemoved) {
      onMarkerRemoved(id);
    }
    
    if (markerToRemove) {
      toast.info(`Marca "${markerToRemove.label}" eliminada`);
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'quest': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'enemy': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'treasure': return 'text-amber-500 bg-amber-100 dark:bg-amber-900/30';
      default: return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
    }
  };

  const resetMapView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    toast.info("Vista del mapa reiniciada");
  };

  return (
    <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-medieval">Mapa Interactivo</CardTitle>
        <div className="flex gap-2">
          {isEditable && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nombre de la marca"
                value={newMarkerName}
                onChange={(e) => setNewMarkerName(e.target.value)}
                className="p-2 text-sm border rounded-md w-40"
              />
              <Button
                variant={addingMarker ? "destructive" : "outline"} 
                size="sm"
                onClick={() => setAddingMarker(!addingMarker)}
              >
                {addingMarker ? <X className="h-4 w-4 mr-1" /> : <MapPin className="h-4 w-4 mr-1" />}
                {addingMarker ? "Cancelar" : "Añadir"}
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale(Math.min(scale + 0.2, 3))}
            title="Acercar"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale(Math.max(scale - 0.2, 0.5))}
            title="Alejar"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetMapView}
            title="Reiniciar vista"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div 
          className="relative w-full h-[400px] overflow-hidden border rounded-md cursor-move"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleMapClick}
          ref={mapRef}
        >
          <div 
            className="absolute inset-0 bg-no-repeat bg-contain bg-center"
            style={{
              backgroundImage: `url(${mapImage})`,
              transform: `scale(${scale})`,
              transformOrigin: 'center',
            }}
          />
          <div 
            className="absolute inset-0"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center',
            }}
          >
            {localMarkers.map((marker) => (
              <div 
                key={marker.id}
                className="absolute"
                style={{ 
                  left: `${marker.x * 100}%`, 
                  top: `${marker.y * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onMouseEnter={() => setShowTooltip(marker.id)}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <div className={`${getMarkerColor(marker.type)} rounded-full p-1.5 shadow-md relative`}>
                  <MapPin className="h-5 w-5" />
                  
                  {showTooltip === marker.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-10 bg-white dark:bg-gray-800 p-2 rounded shadow-lg -translate-x-1/2 left-1/2 bottom-full mb-2 whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        <span>{marker.label}</span>
                        {isEditable && (
                          <button 
                            onClick={(e) => removeMarker(marker.id, e)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {addingMarker && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                Haz clic para añadir un marcador
              </div>
            </div>
          )}
          
          {scale !== 1 && (
            <div className="absolute bottom-2 right-2 bg-white/80 dark:bg-black/80 px-2 py-1 rounded text-xs">
              Zoom: {Math.round(scale * 100)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Map;
