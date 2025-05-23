import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { DiceRoll, formatRollResult, performDiceRoll, DiceType } from "@/lib/dice-utils";
import { Enemy, ENEMY_TYPES, createDefaultEnemy, calculateModifier } from "@/lib/character-utils";
import { bluetoothManager, BluetoothMessage } from "@/lib/bluetooth-utils";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Trash2Icon } from "lucide-react";

interface InitiativeEntry {
  id: string;
  name: string;
  initiative: number;
  isPlayer: boolean;
}

const NarratorPanel: React.FC = () => {
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [isCreatingEnemy, setIsCreatingEnemy] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState<string[]>([]);
  const [initiativeOrder, setInitiativeOrder] = useState<InitiativeEntry[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(-1);
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const { toast } = useToast();

  // Efecto para configurar el callback de mensajes de Bluetooth
  useEffect(() => {
    if (bluetoothManager.role === 'narrator') {
      bluetoothManager.setOnMessageCallback((message) => {
        handleBluetoothMessage(message);
      });
    }
    
    return () => {
      bluetoothManager.setOnMessageCallback(null);
    };
  }, []);

  // Manejar mensajes recibidos por Bluetooth
  const handleBluetoothMessage = (message: BluetoothMessage) => {
    switch (message.type) {
      case 'ROLL':
        // Añadir tirada al historial
        if (message.data.roll) {
          setRollHistory((prev) => [message.data.roll, ...prev]);
          toast({
            title: `Tirada de ${message.playerName}`,
            description: formatRollResult(message.data.roll)
          });
        }
        break;
      case 'CHARACTER':
        // Actualizar lista de jugadores conectados
        if (!connectedPlayers.includes(message.playerName)) {
          setConnectedPlayers([...connectedPlayers, message.playerName]);
        }
        break;
      default:
        console.log("Mensaje recibido:", message);
    }
  };

  // Crear un nuevo enemigo
  const handleCreateEnemy = () => {
    setCurrentEnemy(createDefaultEnemy());
    setIsCreatingEnemy(true);
  };

  // Guardar el enemigo actual
  const handleSaveEnemy = () => {
    if (currentEnemy) {
      setEnemies([...enemies, currentEnemy]);
      toast({
        title: "Enemigo creado",
        description: `${currentEnemy.name} ha sido añadido al encuentro.`
      });
      setCurrentEnemy(null);
      setIsCreatingEnemy(false);
    }
  };

  // Actualizar un campo del enemigo
  const handleEnemyChange = (
    field: keyof Enemy,
    value: any
  ) => {
    if (currentEnemy) {
      setCurrentEnemy({
        ...currentEnemy,
        [field]: value
      });
    }
  };

  // Actualizar una habilidad del enemigo
  const handleEnemyAbilityChange = (ability: string, value: number) => {
    if (!currentEnemy) return;

    const updatedAbilities = {
      ...currentEnemy.abilities,
      [ability]: value
    };

    const updatedModifiers = {
      ...currentEnemy.modifiers
    };
    
    updatedModifiers[ability as keyof typeof updatedModifiers] = calculateModifier(value);

    // Si hay un cambio en destreza, actualizar iniciativa
    let updatedInitiative = currentEnemy.initiative;
    if (ability === 'dexterity') {
      updatedInitiative = calculateModifier(value);
    }

    setCurrentEnemy({
      ...currentEnemy,
      abilities: updatedAbilities,
      modifiers: updatedModifiers,
      initiative: updatedInitiative
    });
  };

  // Eliminar un enemigo
  const handleDeleteEnemy = (enemyId: string) => {
    const updatedEnemies = enemies.filter(enemy => enemy.id !== enemyId);
    setEnemies(updatedEnemies);
    
    // Si estamos en combate, actualizar iniciativa
    if (isCombatActive) {
      const updatedInitiative = initiativeOrder.filter(entry => entry.id !== enemyId);
      setInitiativeOrder(updatedInitiative);
    }
  };

  // Iniciar combate y calcular iniciativa
  const handleStartCombat = () => {
    const initiativeEntries: InitiativeEntry[] = [];
    
    // Añadir enemigos
    enemies.forEach(enemy => {
      // Tirar iniciativa (d20 + modificador)
      const initiativeRoll = Math.floor(Math.random() * 20) + 1 + enemy.initiative;
      
      initiativeEntries.push({
        id: enemy.id,
        name: enemy.name,
        initiative: initiativeRoll,
        isPlayer: false
      });
    });
    
    // Añadir jugadores conectados
    connectedPlayers.forEach((playerName, index) => {
      // Tirar iniciativa para jugadores
      const initiativeRoll = Math.floor(Math.random() * 20) + 1;
      
      initiativeEntries.push({
        id: `player_${index}`,
        name: playerName,
        initiative: initiativeRoll,
        isPlayer: true
      });
    });
    
    // Ordenar por iniciativa (mayor a menor)
    const orderedInitiative = initiativeEntries.sort((a, b) => b.initiative - a.initiative);
    setInitiativeOrder(orderedInitiative);
    setCurrentTurn(0);
    setIsCombatActive(true);
    
    toast({
      title: "¡Combate iniciado!",
      description: `Orden de iniciativa calculado. ${orderedInitiative[0]?.name} comienza.`
    });
  };

  // Avanzar al siguiente turno
  const handleNextTurn = () => {
    if (initiativeOrder.length === 0) return;
    
    const nextTurn = (currentTurn + 1) % initiativeOrder.length;
    setCurrentTurn(nextTurn);
    
    toast({
      title: "Siguiente turno",
      description: `Es el turno de ${initiativeOrder[nextTurn].name}.`
    });
  };

  // Finalizar combate
  const handleEndCombat = () => {
    setIsCombatActive(false);
    setInitiativeOrder([]);
    setCurrentTurn(-1);
    
    toast({
      title: "Combate finalizado",
      description: "El orden de iniciativa ha sido reiniciado."
    });
  };

  // Realizar tirada para un enemigo
  const handleEnemyRoll = (enemyId: string, diceType: DiceType = 'd20') => {
    const enemy = enemies.find(e => e.id === enemyId);
    if (!enemy) return;
    
    const roll = performDiceRoll(diceType, 1, 0, 'normal', enemy.name);
    setRollHistory([roll, ...rollHistory]);
    
    toast({
      title: `Tirada de ${enemy.name}`,
      description: formatRollResult(roll)
    });
  };

  // Interfaz de creación de enemigos
  if (isCreatingEnemy && currentEnemy) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-accent bg-white/90 dark:bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-medieval text-center">
              Crear Enemigo
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={currentEnemy.name}
                  onChange={(e) => handleEnemyChange("name", e.target.value)}
                  placeholder="Nombre del enemigo"
                  className="font-fantasy"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={currentEnemy.type} 
                  onValueChange={(value) => handleEnemyChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de criatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENEMY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="challenge">Nivel de Desafío</Label>
                <Input
                  id="challenge"
                  type="number"
                  min="0"
                  max="30"
                  step="0.25"
                  value={currentEnemy.challenge}
                  onChange={(e) => handleEnemyChange("challenge", parseFloat(e.target.value) || 0)}
                  className="font-fantasy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isNPC">Tipo de PNJ</Label>
                <Select
                  value={currentEnemy.isNPC ? "npc" : "enemy"}
                  onValueChange={(value) => handleEnemyChange("isNPC", value === "npc")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enemy">Enemigo</SelectItem>
                    <SelectItem value="npc">PNJ Amistoso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hitPoints">Puntos de vida</Label>
                <div className="flex gap-2">
                  <Input
                    id="currentHP"
                    type="number"
                    value={currentEnemy.hitPoints.current}
                    onChange={(e) => 
                      setCurrentEnemy({
                        ...currentEnemy,
                        hitPoints: {
                          ...currentEnemy.hitPoints,
                          current: parseInt(e.target.value) || 0
                        }
                      })
                    }
                    className="font-fantasy w-1/2"
                    placeholder="Actual"
                  />
                  <span className="flex items-center">/</span>
                  <Input
                    id="maxHP"
                    type="number"
                    value={currentEnemy.hitPoints.max}
                    onChange={(e) => 
                      setCurrentEnemy({
                        ...currentEnemy,
                        hitPoints: {
                          ...currentEnemy.hitPoints,
                          max: parseInt(e.target.value) || 0,
                          current: Math.min(currentEnemy.hitPoints.current, parseInt(e.target.value) || 0)
                        }
                      })
                    }
                    className="font-fantasy w-1/2"
                    placeholder="Máximo"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="armorClass">Clase de Armadura</Label>
                <Input
                  id="armorClass"
                  type="number"
                  min="0"
                  value={currentEnemy.armorClass}
                  onChange={(e) => handleEnemyChange("armorClass", parseInt(e.target.value) || 10)}
                  className="font-fantasy"
                />
              </div>
            </div>
            
            {/* Habilidades */}
            <div className="space-y-4">
              <h3 className="font-medieval text-lg">Habilidades</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map((ability) => {
                  const abilityKey = ability as keyof typeof currentEnemy.abilities;
                  const modifierKey = ability as keyof typeof currentEnemy.modifiers;
                  const value = currentEnemy.abilities[abilityKey];
                  const modifier = currentEnemy.modifiers[modifierKey];
                  const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
                  
                  return (
                    <div key={ability} className="bg-white/40 dark:bg-black/40 p-3 rounded-md shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor={ability} className="capitalize font-bold">
                          {ability}
                        </Label>
                        <div className="text-lg font-medieval">
                          {value} <span className="text-primary">({modifierText})</span>
                        </div>
                      </div>
                      <Slider
                        id={ability}
                        min={1}
                        max={30}
                        step={1}
                        value={[value]}
                        onValueChange={(values) => handleEnemyAbilityChange(ability, values[0])}
                        className="my-2"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreatingEnemy(false);
                setCurrentEnemy(null);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEnemy}
              className="font-medieval bg-accent text-black hover:bg-accent/90"
            >
              Añadir Enemigo
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <Tabs defaultValue="enemies" className="w-full">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="enemies" className="flex-1">Enemigos</TabsTrigger>
        <TabsTrigger value="combat" className="flex-1">Combate</TabsTrigger>
        <TabsTrigger value="rolls" className="flex-1">Tiradas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="enemies" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-medieval">
            Enemigos y PNJs
          </h3>
          <Button 
            onClick={handleCreateEnemy}
            className="font-medieval bg-accent text-black hover:bg-accent/90"
          >
            Crear Enemigo
          </Button>
        </div>
        
        {enemies.length === 0 ? (
          <Card className="border border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-fantasy">
                No hay enemigos creados. ¡Crea un enemigo para el encuentro!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enemies.map((enemy) => (
              <motion.div
                key={enemy.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={`border ${enemy.isNPC ? 'border-blue-300' : 'border-red-300'} bg-white/70 dark:bg-black/20 backdrop-blur-sm`}>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="flex justify-between items-center">
                      <span className="font-medieval">{enemy.name}</span>
                      <span className="text-sm font-normal bg-primary/10 px-2 py-1 rounded-full">
                        {enemy.isNPC ? 'PNJ' : 'Enemigo'} • ND {enemy.challenge}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-3 text-sm">
                      <span className="font-bold">{enemy.type}</span>
                    </div>

                    {/* Estadísticas principales */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex flex-col items-center bg-secondary/30 p-2 rounded">
                        <span className="text-xs">PV</span>
                        <span className="font-bold">
                          {enemy.hitPoints.current}/{enemy.hitPoints.max}
                        </span>
                      </div>
                      <div className="flex flex-col items-center bg-secondary/30 p-2 rounded">
                        <span className="text-xs">CA</span>
                        <span className="font-bold">{enemy.armorClass}</span>
                      </div>
                    </div>

                    {/* Habilidades */}
                    <div className="grid grid-cols-3 gap-1 mb-3">
                      {Object.entries(enemy.abilities).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-xs uppercase">{key.substring(0, 3)}</div>
                          <div className="font-bold">{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEnemyRoll(enemy.id, 'd20')}
                      >
                        d20
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEnemyRoll(enemy.id, 'd6')}
                      >
                        d6
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDeleteEnemy(enemy.id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="combat" className="space-y-4">
        <Card className="border border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-medieval">Gestión de Combate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
              <div>
                <h3 className="font-bold mb-2">Participantes:</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {enemies.map((enemy) => (
                    <div key={enemy.id} className="bg-secondary/30 px-2 py-1 rounded-md text-sm">
                      {enemy.name}
                    </div>
                  ))}
                  {connectedPlayers.map((player, i) => (
                    <div key={i} className="bg-primary/20 px-2 py-1 rounded-md text-sm">
                      {player}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {!isCombatActive ? (
                  <Button onClick={handleStartCombat} className="font-medieval bg-accent text-black hover:bg-accent/90">
                    Iniciar Combate
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleNextTurn}>
                      Siguiente Turno
                    </Button>
                    <Button variant="destructive" onClick={handleEndCombat}>
                      Finalizar Combate
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {isCombatActive && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-primary/10 p-2 font-bold text-center">
                  Orden de Iniciativa
                </div>
                <ul className="divide-y">
                  {initiativeOrder.map((entry, index) => (
                    <li 
                      key={entry.id} 
                      className={`p-3 flex justify-between items-center ${index === currentTurn ? 'bg-accent/30' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{index + 1}.</span>
                        <span className={entry.isPlayer ? "text-primary font-bold" : ""}>
                          {entry.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-secondary/30 px-2 py-1 rounded text-sm font-bold">
                          {entry.initiative}
                        </span>
                        {index === currentTurn && (
                          <span className="animate-pulse text-primary font-bold text-sm">
                            Turno actual
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="rolls" className="space-y-4">
        <Card className="border border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-medieval">Historial de Tiradas</CardTitle>
          </CardHeader>
          <CardContent>
            {rollHistory.length === 0 ? (
              <p className="text-center italic text-muted-foreground p-4">
                No hay tiradas registradas. Las tiradas de los jugadores y enemigos aparecerán aquí.
              </p>
            ) : (
              <ul className="divide-y max-h-60 overflow-y-auto">
                {rollHistory.map((roll, index) => (
                  <li key={index} className="py-2">
                    {formatRollResult(roll)}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default NarratorPanel;
