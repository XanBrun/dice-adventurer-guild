
// Utilidades para la gestión de Bluetooth

// Interfaz para el dispositivo Bluetooth
export interface BluetoothDevice {
  id: string;
  name: string;
  isConnected: boolean;
}

// Interfaz para los mensajes enviados por Bluetooth
export interface BluetoothMessage {
  type: 'ROLL' | 'CHARACTER' | 'ENEMY' | 'CHAT' | 'SYSTEM';
  playerId: string;
  playerName: string;
  data: any;
  timestamp: Date;
}

// Estado global de la conexión Bluetooth
export type BluetoothRole = 'narrator' | 'player' | 'none';

// Clase principal para gestionar la conexión Bluetooth
export class BluetoothManager {
  private static instance: BluetoothManager;
  private _role: BluetoothRole = 'none';
  private _isAvailable: boolean = false;
  private _isConnected: boolean = false;
  private _connectedDevices: BluetoothDevice[] = [];
  private _onMessageCallback: ((message: BluetoothMessage) => void) | null = null;
  private _onConnectionChangeCallback: ((connected: boolean, devices?: BluetoothDevice[]) => void) | null = null;
  private _onSearchingCallback: ((searching: boolean) => void) | null = null;
  private _device: any = null;
  private _server: any = null;
  private _characteristic: any = null;
  private _serviceUUID: string = '0000180d-0000-1000-8000-00805f9b34fb'; // UUID estándar para servicio de corazón
  private _characteristicUUID: string = '00002a37-0000-1000-8000-00805f9b34fb'; // UUID para medición de ritmo cardíaco

  private constructor() {
    // Comprobamos si el navegador soporta Bluetooth
    this._isAvailable = 'bluetooth' in navigator;
    console.log('Bluetooth disponible:', this._isAvailable);
  }

  public static getInstance(): BluetoothManager {
    if (!BluetoothManager.instance) {
      BluetoothManager.instance = new BluetoothManager();
    }
    return BluetoothManager.instance;
  }

  // Getters públicos
  public get isAvailable(): boolean {
    return this._isAvailable;
  }

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public get role(): BluetoothRole {
    return this._role;
  }

  public get connectedDevices(): BluetoothDevice[] {
    return [...this._connectedDevices];
  }

  // Callbacks para eventos
  public setOnMessageCallback(callback: ((message: BluetoothMessage) => void) | null) {
    this._onMessageCallback = callback;
  }

  public setOnConnectionChangeCallback(callback: ((connected: boolean, devices?: BluetoothDevice[]) => void) | null) {
    this._onConnectionChangeCallback = callback;
  }
  
  public setOnSearchingCallback(callback: ((searching: boolean) => void) | null) {
    this._onSearchingCallback = callback;
  }

  // Método para notificar que estamos buscando
  private notifySearchingState(searching: boolean) {
    if (this._onSearchingCallback) {
      this._onSearchingCallback(searching);
    }
  }

  // Para iniciar como narrador (servidor)
  public async startAsNarrator(): Promise<boolean> {
    if (!this._isAvailable) {
      console.error('Bluetooth no disponible en este dispositivo');
      return false;
    }

    try {
      this.notifySearchingState(true);
      
      // En una implementación real, solicitaríamos permisos Bluetooth
      // y configuraríamos un GATT Server.
      // Para esta demo, simularemos el proceso.
      
      console.log('Iniciando como narrador...');
      
      // Simular tiempo de configuración
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this._role = 'narrator';
      this._isConnected = true;
      this._connectedDevices = [];
      
      if (this._onConnectionChangeCallback) {
        this._onConnectionChangeCallback(true, this._connectedDevices);
      }
      
      this.notifySearchingState(false);
      
      // Iniciar simulación de jugadores que se conectan para la demo
      this.simulatePlayersConnecting();
      
      return true;
    } catch (error) {
      console.error('Error al iniciar como narrador:', error);
      this.notifySearchingState(false);
      return false;
    }
  }

  // Para conectar como jugador (cliente)
  public async connectAsPlayer(): Promise<boolean> {
    if (!this._isAvailable) {
      console.error('Bluetooth no disponible en este dispositivo');
      return false;
    }

    try {
      this.notifySearchingState(true);
      
      // Solicitar dispositivo Bluetooth
      try {
        this._device = await (navigator as any).bluetooth.requestDevice({
          filters: [
            { services: [this._serviceUUID] },
            { name: 'Narrador RPG' } // Filtro adicional para encontrar narradores
          ],
          optionalServices: [this._serviceUUID]
        });
  
        console.log('Dispositivo seleccionado:', this._device.name);
        
        // Conectar al dispositivo
        const server = await this._device.gatt.connect();
        this._server = server;
        console.log('Conectado al servidor GATT');
        
        // En una implementación real, obtendrías el servicio y características específicas
        // const service = await server.getPrimaryService(this._serviceUUID);
        // this._characteristic = await service.getCharacteristic(this._characteristicUUID);
        
        this._role = 'player';
        this._isConnected = true;
        
        // Añadir el dispositivo a la lista de conectados
        const newDevice: BluetoothDevice = {
          id: this._device.id,
          name: this._device.name || 'Narrador',
          isConnected: true
        };
        
        this._connectedDevices = [newDevice];
        
        if (this._onConnectionChangeCallback) {
          this._onConnectionChangeCallback(true, this._connectedDevices);
        }
      } catch (error) {
        console.error('Error al solicitar dispositivo Bluetooth:', error);
        
        // Para la demostración, vamos a simular que se conectó correctamente
        console.log('Simulando conexión exitosa para demostración...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        this._role = 'player';
        this._isConnected = true;
        
        // Simular dispositivo conectado
        const simulatedDevice: BluetoothDevice = {
          id: 'simulated-narrator-id',
          name: 'Narrador (Simulado)',
          isConnected: true
        };
        
        this._connectedDevices = [simulatedDevice];
        
        if (this._onConnectionChangeCallback) {
          this._onConnectionChangeCallback(true, this._connectedDevices);
        }
      }
      
      this.notifySearchingState(false);
      return true;
    } catch (error) {
      console.error('Error al conectar como jugador:', error);
      this.notifySearchingState(false);
      return false;
    }
  }

  // Para desconectar
  public disconnect(): void {
    if (this._device && this._isConnected) {
      try {
        if (this._device.gatt && this._device.gatt.connected) {
          this._device.gatt.disconnect();
        }
        console.log('Desconectado del servidor');
      } catch (error) {
        console.error('Error al desconectar:', error);
      }
    }
    
    this._isConnected = false;
    this._role = 'none';
    this._connectedDevices = [];
    
    if (this._onConnectionChangeCallback) {
      this._onConnectionChangeCallback(false, this._connectedDevices);
    }
  }

  // Para enviar un mensaje
  public async sendMessage(message: Omit<BluetoothMessage, 'timestamp'>): Promise<boolean> {
    if (!this._isConnected) {
      console.error('No hay conexión Bluetooth activa');
      return false;
    }

    try {
      const fullMessage: BluetoothMessage = {
        ...message,
        timestamp: new Date()
      };
      
      console.log('Enviando mensaje:', fullMessage);
      
      // En una implementación real, aquí enviarías los datos a través de la característica Bluetooth
      // Por ahora, simplemente simulamos el envío y procesamos el mensaje localmente
      setTimeout(() => {
        if (this._onMessageCallback) {
          this._onMessageCallback(fullMessage);
        }
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      return false;
    }
  }

  // Simulación de conexión de jugadores para el modo narrador (demo)
  private simulatePlayersConnecting(): void {
    if (this._role !== 'narrator') return;
    
    // Simular que un jugador se conecta después de 3 segundos
    setTimeout(() => {
      if (!this._isConnected || this._role !== 'narrator') return;
      
      const player1: BluetoothDevice = {
        id: 'simulated-player-1',
        name: 'Jugador 1',
        isConnected: true
      };
      
      this._connectedDevices = [...this._connectedDevices, player1];
      
      if (this._onConnectionChangeCallback) {
        this._onConnectionChangeCallback(true, this._connectedDevices);
      }
      
      // Simular mensaje de conexión
      if (this._onMessageCallback) {
        const connectMessage: BluetoothMessage = {
          type: 'CHARACTER',
          playerId: player1.id,
          playerName: 'Aragorn',
          data: { joined: true },
          timestamp: new Date()
        };
        this._onMessageCallback(connectMessage);
      }
    }, 3000);
    
    // Simular que otro jugador se conecta después de 7 segundos
    setTimeout(() => {
      if (!this._isConnected || this._role !== 'narrator') return;
      
      const player2: BluetoothDevice = {
        id: 'simulated-player-2',
        name: 'Jugador 2',
        isConnected: true
      };
      
      this._connectedDevices = [...this._connectedDevices, player2];
      
      if (this._onConnectionChangeCallback) {
        this._onConnectionChangeCallback(true, this._connectedDevices);
      }
      
      // Simular mensaje de conexión
      if (this._onMessageCallback) {
        const connectMessage: BluetoothMessage = {
          type: 'CHARACTER',
          playerId: player2.id,
          playerName: 'Gandalf',
          data: { joined: true },
          timestamp: new Date()
        };
        this._onMessageCallback(connectMessage);
      }
    }, 7000);
  }
}

export const bluetoothManager = BluetoothManager.getInstance();
