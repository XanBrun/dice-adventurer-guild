import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothOff,
  BluetoothSearching,
  UserRound,
  Server
} from "lucide-react";
import { bluetoothManager, BluetoothRole, BluetoothDevice } from '@/lib/bluetooth-utils';
import { useToast } from "@/components/ui/use-toast";

interface BluetoothStatusProps {
  onRoleChange?: (role: BluetoothRole) => void;
}

const BluetoothStatus: React.FC<BluetoothStatusProps> = ({ onRoleChange }) => {
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [role, setRole] = useState<BluetoothRole>('none');
  const [connectedDevices, setConnectedDevices] = useState<BluetoothDevice[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setIsAvailable(bluetoothManager.isAvailable);
    setIsConnected(bluetoothManager.isConnected);
    setRole(bluetoothManager.role);
    setConnectedDevices(bluetoothManager.connectedDevices);

    bluetoothManager.setOnConnectionChangeCallback((connected, updatedDevices) => {
      setIsConnected(connected);
      setRole(bluetoothManager.role);
      setConnectedDevices(updatedDevices || []);
      setIsSearching(false);
      
      if (onRoleChange) {
        onRoleChange(bluetoothManager.role);
      }
    });

    bluetoothManager.setOnSearchingCallback((searching) => {
      setIsSearching(searching);
    });
    
    return () => {
      bluetoothManager.setOnConnectionChangeCallback(null);
      bluetoothManager.setOnMessageCallback(null);
      bluetoothManager.setOnSearchingCallback(null);
    };
  }, [onRoleChange]);

  const handleConnectNarrator = async () => {
    try {
      setIsSearching(true);
      await bluetoothManager.startAsNarrator();
    } catch (error) {
      console.error("Error al conectar como narrador:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar el modo narrador"
      });
      setIsSearching(false);
    }
  };

  const handleConnectPlayer = async () => {
    try {
      setIsSearching(true);
      await bluetoothManager.connectAsPlayer();
    } catch (error) {
      console.error("Error al conectar como jugador:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo conectar a la partida"
      });
      setIsSearching(false);
    }
  };

  const handleDisconnect = () => {
    bluetoothManager.disconnect();
  };

  if (!isAvailable) {
    return (
      <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/20 p-2 rounded-md">
        <BluetoothOff className="h-5 w-5 text-red-500" />
        <span className="text-sm">Bluetooth no disponible</span>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-900/20 p-2 rounded-md animate-pulse">
        <BluetoothSearching className="h-5 w-5 text-amber-500" />
        <span className="text-sm">{role === 'player' ? 'Buscando narrador...' : 'Activando modo narrador...'}</span>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/20 p-2 rounded-md">
        <BluetoothConnected className="h-5 w-5 text-emerald-500" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">
              {role === 'narrator' ? 'Narrador' : 'Jugador'}
            </span>
            {role === 'narrator' && (
              <Badge variant="outline" className="ml-1">
                <Server className="h-3 w-3 mr-1" />
                {connectedDevices.length} jugadores
              </Badge>
            )}
          </div>
          {connectedDevices.length > 0 && role === 'narrator' && (
            <div className="text-xs my-1 text-muted-foreground">
              {connectedDevices.map(device => device.name).join(', ')}
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDisconnect}
            className="text-xs h-6 mt-1 text-red-500 hover:text-red-700 hover:bg-red-100 p-1"
          >
            Desconectar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        variant="outline" 
        size="sm"
        onClick={handleConnectNarrator}
        className="flex gap-1 items-center"
      >
        <Server className="h-4 w-4" />
        <span>Narrador</span>
      </Button>
      
      <Button
        variant="outline" 
        size="sm"
        onClick={handleConnectPlayer}
        className="flex gap-1 items-center"
      >
        <UserRound className="h-4 w-4" />
        <span>Jugador</span>
      </Button>
    </div>
  );
};

export default BluetoothStatus;