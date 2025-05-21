// Bluetooth Web API utilities
import { toast } from "@/components/ui/sonner";

export type BluetoothRole = 'narrator' | 'player' | 'none';

export interface BluetoothDevice {
  id: string;
  name: string;
  isConnected: boolean;
}

export interface BluetoothMessage {
  type: 'ROLL' | 'CHARACTER' | 'ENEMY' | 'CHAT' | 'SYSTEM';
  playerId: string;
  playerName: string;
  data: any;
  timestamp: Date;
}

class BluetoothManager {
  private static instance: BluetoothManager;
  private _role: BluetoothRole = 'none';
  private _isAvailable: boolean = false;
  private _isConnected: boolean = false;
  private _connectedDevices: BluetoothDevice[] = [];
  private _onMessageCallback: ((message: BluetoothMessage) => void) | null = null;
  private _onConnectionChangeCallback: ((connected: boolean, devices?: BluetoothDevice[]) => void) | null = null;
  private _onSearchingCallback: ((searching: boolean) => void) | null = null;
  private _characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private _server: BluetoothRemoteGATTServer | null = null;

  private readonly SERVICE_UUID = '00001234-0000-1000-8000-00805f9b34fb';
  private readonly CHARACTERISTIC_UUID = '00001235-0000-1000-8000-00805f9b34fb';

  private constructor() {
    this._isAvailable = 'bluetooth' in navigator;
  }

  public static getInstance(): BluetoothManager {
    if (!BluetoothManager.instance) {
      BluetoothManager.instance = new BluetoothManager();
    }
    return BluetoothManager.instance;
  }

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

  public setOnMessageCallback(callback: ((message: BluetoothMessage) => void) | null) {
    this._onMessageCallback = callback;
  }

  public setOnConnectionChangeCallback(callback: ((connected: boolean, devices?: BluetoothDevice[]) => void) | null) {
    this._onConnectionChangeCallback = callback;
  }

  public setOnSearchingCallback(callback: ((searching: boolean) => void) | null) {
    this._onSearchingCallback = callback;
  }

  private notifySearchingState(searching: boolean) {
    if (this._onSearchingCallback) {
      this._onSearchingCallback(searching);
    }
  }

  private async initializeGATTServer(): Promise<boolean> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [this.SERVICE_UUID] }]
      });

      this._server = await device.gatt?.connect();
      if (!this._server) {
        throw new Error('Failed to connect to GATT server');
      }

      const service = await this._server.getPrimaryService(this.SERVICE_UUID);
      this._characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID);

      // Set up notification handling
      await this._characteristic.startNotifications();
      this._characteristic.addEventListener('characteristicvaluechanged', this.handleCharacteristicValueChanged.bind(this));

      return true;
    } catch (error) {
      console.error('Error initializing GATT server:', error);
      return false;
    }
  }

  private handleCharacteristicValueChanged(event: Event) {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    if (!value) return;

    const decoder = new TextDecoder('utf-8');
    const message = JSON.parse(decoder.decode(value));

    if (this._onMessageCallback) {
      this._onMessageCallback(message);
    }
  }

  public async startAsNarrator(): Promise<boolean> {
    if (!this._isAvailable) {
      toast.error("Bluetooth no disponible", {
        description: "Tu dispositivo no soporta Bluetooth"
      });
      return false;
    }

    try {
      this.notifySearchingState(true);
      const success = await this.initializeGATTServer();

      if (success) {
        this._role = 'narrator';
        this._isConnected = true;
        this._connectedDevices = [];

        if (this._onConnectionChangeCallback) {
          this._onConnectionChangeCallback(true, this._connectedDevices);
        }

        toast.success("Modo narrador activado", {
          description: "Esperando conexiones de jugadores..."
        });
      } else {
        throw new Error('Failed to initialize as narrator');
      }

      this.notifySearchingState(false);
      return true;
    } catch (error) {
      console.error('Error starting as narrator:', error);
      toast.error("Error al iniciar como narrador", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
      this.notifySearchingState(false);
      return false;
    }
  }

  public async connectAsPlayer(): Promise<boolean> {
    if (!this._isAvailable) {
      toast.error("Bluetooth no disponible", {
        description: "Tu dispositivo no soporta Bluetooth"
      });
      return false;
    }

    try {
      this.notifySearchingState(true);
      const success = await this.initializeGATTServer();

      if (success) {
        this._role = 'player';
        this._isConnected = true;
        
        const device: BluetoothDevice = {
          id: 'narrator',
          name: 'Narrador',
          isConnected: true
        };
        
        this._connectedDevices = [device];

        if (this._onConnectionChangeCallback) {
          this._onConnectionChangeCallback(true, this._connectedDevices);
        }

        toast.success("Conectado al narrador", {
          description: "Ya puedes participar en la partida"
        });
      } else {
        throw new Error('Failed to connect as player');
      }

      this.notifySearchingState(false);
      return true;
    } catch (error) {
      console.error('Error connecting as player:', error);
      toast.error("Error al conectar como jugador", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
      this.notifySearchingState(false);
      return false;
    }
  }

  public disconnect(): void {
    try {
      if (this._characteristic) {
        this._characteristic.stopNotifications();
      }
      if (this._server) {
        this._server.disconnect();
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
    }

    this._isConnected = false;
    this._role = 'none';
    this._connectedDevices = [];
    this._characteristic = null;
    this._server = null;

    if (this._onConnectionChangeCallback) {
      this._onConnectionChangeCallback(false, []);
    }

    toast.info("Desconectado", {
      description: "Se ha cerrado la conexión Bluetooth"
    });
  }

  public async sendMessage(message: Omit<BluetoothMessage, 'timestamp'>): Promise<boolean> {
    if (!this._isConnected || !this._characteristic) {
      toast.error("No hay conexión", {
        description: "No hay una conexión Bluetooth activa"
      });
      return false;
    }

    try {
      const fullMessage: BluetoothMessage = {
        ...message,
        timestamp: new Date()
      };

      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(fullMessage));
      await this._characteristic.writeValue(data);

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Error al enviar mensaje", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
      return false;
    }
  }
}

export const bluetoothManager = BluetoothManager.getInstance();