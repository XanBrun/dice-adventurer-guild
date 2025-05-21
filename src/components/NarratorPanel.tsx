import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { DiceRoll, formatRollResult, performDiceRoll, DiceType, CombinedDiceRoll, formatCombinedRollResult } from "@/lib/dice-utils";
import { Enemy, ENEMY_TYPES, createDefaultEnemy, calculateModifier } from "@/lib/character-utils";
import { bluetoothManager, BluetoothMessage } from "@/lib/bluetooth-utils";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Trash2Icon } from "lucide-react";
import CombatTracker from "./CombatTracker";

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
  const [rollHistory, setRollHistory] = useState<Array<DiceRoll | CombinedDiceRoll>>([]);
  const { toast } = useToast();

  // Set up the Bluetooth message callback
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

  // Handle received Bluetooth messages
  const handleBluetoothMessage = (message: BluetoothMessage) => {
    switch (message.type) {
      case 'ROLL':
        // Add roll to history
        if (message.data.roll) {
          setRollHistory((prev) => [message.data.roll, ...prev]);
          toast({
            title: `Roll from ${message.playerName}`,
            description: formatRollResult(message.data.roll)
          });
        }
        break;
      case 'COMBINED_ROLL':
        // Add combined roll to history
        if (message.data.roll) {
          setRollHistory((prev) => [message.data.roll, ...prev]);
          toast({
            title: `Combined roll from ${message.playerName}`,
            description: formatCombinedRollResult(message.data.roll)
          });
        }
        break;
      case 'CHARACTER':
        // Update connected players list
        if (!connectedPlayers.includes(message.playerName)) {
          setConnectedPlayers([...connectedPlayers, message.playerName]);
        }
        break;
      default:
        console.log("Message received:", message);
    }
  };

  // Create a new enemy
  const handleCreateEnemy = () => {
    setCurrentEnemy(createDefaultEnemy());
    setIsCreatingEnemy(true);
  };

  // Save the current enemy
  const handleSaveEnemy = () => {
    if (currentEnemy) {
      setEnemies([...enemies, currentEnemy]);
      toast({
        title: "Enemy created",
        description: `${currentEnemy.name} has been added to the encounter.`
      });
      setCurrentEnemy(null);
      setIsCreatingEnemy(false);
    }
  };

  // Update an enemy field
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

  // Update an enemy ability
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

    // If there's a change in dexterity, update initiative
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

  // Delete an enemy
  const handleDeleteEnemy = (enemyId: string) => {
    const updatedEnemies = enemies.filter(enemy => enemy.id !== enemyId);
    setEnemies(updatedEnemies);
  };

  // Handle damage applied to an enemy
  const handleEnemyDamage = (enemyId: string, damage: number) => {
    setEnemies(prevEnemies => 
      prevEnemies.map(enemy => {
        if (enemy.id === enemyId) {
          const newCurrentHP = Math.max(0, enemy.hitPoints.current - damage);
          return {
            ...enemy,
            hitPoints: {
              ...enemy.hitPoints,
              current: newCurrentHP
            }
          };
        }
        return enemy;
      })
    );
  };

  // Roll dice for an enemy
  const handleEnemyRoll = (enemyId: string, diceType: DiceType = 'd20') => {
    const enemy = enemies.find(e => e.id === enemyId);
    if (!enemy) return;
    
    const roll = performDiceRoll(diceType, 1, 0, 'normal', enemy.name);
    setRollHistory([roll, ...rollHistory]);
    
    toast({
      title: `Roll from ${enemy.name}`,
      description: formatRollResult(roll)
    });
  };

  // Create/edit enemy form
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
              Create Enemy
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={currentEnemy.name}
                  onChange={(e) => handleEnemyChange("name", e.target.value)}
                  placeholder="Name of the enemy"
                  className="font-fantasy"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={currentEnemy.type} 
                  onValueChange={(value) => handleEnemyChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type of creature" />
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
                <Label htmlFor="challenge">Challenge Rating</Label>
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
                <Label htmlFor="isNPC">NPC Type</Label>
                <Select
                  value={currentEnemy.isNPC ? "npc" : "enemy"}
                  onValueChange={(value) => handleEnemyChange("isNPC", value === "npc")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enemy">Enemy</SelectItem>
                    <SelectItem value="npc">Friendly NPC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hitPoints">Hit Points</Label>
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
                    placeholder="Current"
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
                    placeholder="Max"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="armorClass">Armor Class</Label>
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
              <h3 className="font-medieval text-lg">Abilities</h3>
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
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEnemy}
              className="font-medieval bg-accent text-black hover:bg-accent/90"
            >
              Add Enemy
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <Tabs defaultValue="enemies" className="w-full">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="enemies" className="flex-1">Enemies</TabsTrigger>
        <TabsTrigger value="combat" className="flex-1">Combat</TabsTrigger>
        <TabsTrigger value="rolls" className="flex-1">Rolls</TabsTrigger>
      </TabsList>
      
      <TabsContent value="enemies" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-medieval">
            Enemies and NPCs
          </h3>
          <Button 
            onClick={handleCreateEnemy}
            className="font-medieval bg-accent text-black hover:bg-accent/90"
          >
            Create Enemy
          </Button>
        </div>
        
        {enemies.length === 0 ? (
          <Card className="border border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-fantasy">
                No enemies created. Create an enemy for the encounter!
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
                        {enemy.isNPC ? 'NPC' : 'Enemy'} • CR {enemy.challenge}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-3 text-sm">
                      <span className="font-bold">{enemy.type}</span>
                    </div>

                    {/* Main stats */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex flex-col items-center bg-secondary/30 p-2 rounded">
                        <span className="text-xs">HP</span>
                        <span className="font-bold">
                          {enemy.hitPoints.current}/{enemy.hitPoints.max}
                        </span>
                      </div>
                      <div className="flex flex-col items-center bg-secondary/30 p-2 rounded">
                        <span className="text-xs">AC</span>
                        <span className="font-bold">{enemy.armorClass}</span>
                      </div>
                    </div>

                    {/* Abilities */}
                    <div className="grid grid-cols-3 gap-1 mb-3">
                      {Object.entries(enemy.abilities).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-xs uppercase">{key.substring(0, 3)}</div>
                          <div className="font-bold">{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
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
        <CombatTracker 
          enemies={enemies} 
          connectedPlayers={connectedPlayers} 
          onEnemyDamage={handleEnemyDamage}
        />
      </TabsContent>
      
      <TabsContent value="rolls" className="space-y-4">
        <Card className="border border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="font-medieval">Roll History</CardTitle>
          </CardHeader>
          <CardContent>
            {rollHistory.length === 0 ? (
              <p className="text-center italic text-muted-foreground p-4">
                No rolls recorded. Player and enemy rolls will appear here.
              </p>
            ) : (
              <ul className="divide-y max-h-60 overflow-y-auto">
                {rollHistory.map((roll, index) => (
                  <li key={index} className="py-2">
                    {'diceType' in roll ? formatRollResult(roll) : formatCombinedRollResult(roll)}
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
