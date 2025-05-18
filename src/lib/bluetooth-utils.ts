
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
  private _onConnectionChangeCallback: ((connected: boolean) => void) | null = null;
  private _device: any = null;
  private _server: any = null;
  private _characteristic: any = null;

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
  public setOnMessageCallback(callback: (message: BluetoothMessage) => void) {
    this._onMessageCallback = callback;
  }

  public setOnConnectionChangeCallback(callback: (connected: boolean) => void) {
    this._onConnectionChangeCallback = callback;
  }

  // Para iniciar como narrador (servidor)
  public async startAsNarrator(): Promise<boolean> {
    if (!this._isAvailable) {
      console.error('Bluetooth no disponible en este dispositivo');
      return false;
    }

    try {
      // En una implementación real, aquí configurarías el servicio GATT Server
      console.log('Iniciando como narrador...');
      this._role = 'narrator';
      this._isConnected = true;
      
      if (this._onConnectionChangeCallback) {
        this._onConnectionChangeCallback(true);
      }
      
      return true;
    } catch (error) {
      console.error('Error al iniciar como narrador:', error);
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
      // Solicitar dispositivo Bluetooth
      this._device = await (navigator as any).bluetooth.requestDevice({
        // En una implementación real, definirías los servicios específicos
        acceptAllDevices: true
      });

      console.log('Dispositivo seleccionado:', this._device.name);
      
      // Conectar al dispositivo
      const server = await this._device.gatt.connect();
      this._server = server;
      console.log('Conectado al servidor GATT');
      
      // En una implementación real, obtendrías el servicio y características específicas
      this._role = 'player';
      this._isConnected = true;
      
      // Añadir el dispositivo a la lista de conectados
      const newDevice: BluetoothDevice = {
        id: this._device.id,
        name: this._device.name || 'Dispositivo desconocido',
        isConnected: true
      };
      
      this._connectedDevices = [newDevice];
      
      if (this._onConnectionChangeCallback) {
        this._onConnectionChangeCallback(true);
      }
      
      return true;
    } catch (error) {
      console.error('Error al conectar como jugador:', error);
      return false;
    }
  }

  // Para desconectar
  public disconnect(): void {
    if (this._server && this._role === 'player') {
      this._device.gatt.disconnect();
      console.log('Desconectado del servidor');
    }
    
    this._isConnected = false;
    this._role = 'none';
    this._connectedDevices = [];
    
    if (this._onConnectionChangeCallback) {
      this._onConnectionChangeCallback(false);
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
      
      return true;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      return false;
    }
  }
}

export const bluetoothManager = BluetoothManager.getInstance();
