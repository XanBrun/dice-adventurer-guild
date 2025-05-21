
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sword, Shield, Activity, SkipForward, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Character } from "@/lib/character-utils";
import { Enemy, CombatTurn, CombatAction, CombatActionType, rollInitiative, createEnemy } from "@/lib/combat-utils";
import { toast } from "@/components/ui/sonner";
import { generateRandomId } from "@/lib/dice-utils";

interface CombatTrackerProps {
  players: Character[];
  enemies?: Enemy[];
}

const CombatTracker: React.FC<CombatTrackerProps> = ({ players, enemies = [] }) => {
  const [combatants, setCombatants] = useState<(Character | Enemy)[]>([]);
  const [turns, setTurns] = useState<CombatTurn[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [customEnemies, setCustomEnemies] = useState<Enemy[]>([]);
  const [newEnemyName, setNewEnemyName] = useState<string>('');
  const [newEnemyHP, setNewEnemyHP] = useState<string>('10');
  const [activeTab, setActiveTab] = useState<string>("setup");

  // Initialize combat with players and enemies
  useEffect(() => {
    if (players.length > 0) {
      const initialCombatants = [
        ...players,
        ...enemies,
        ...customEnemies
      ];
      setCombatants(initialCombatants);
    }
  }, [players, enemies, customEnemies]);

  const handleStartCombat = () => {
    if (combatants.length < 2) {
      toast.error("Se necesitan al menos dos combatientes para iniciar el combate");
      return;
    }

    // Roll initiative for all combatants
    const combatantsWithInitiative = combatants.map(combatant => {
      const initiativeRoll = rollInitiative(combatant);
      return {
        ...combatant,
        initiativeRoll
      };
    });

    // Sort by initiative (higher first)
    const sortedCombatants = [...combatantsWithInitiative].sort(
      (a, b) => b.initiativeRoll - a.initiativeRoll
    );

    // Create initial turns
    const initialTurns: CombatTurn[] = sortedCombatants.map(combatant => ({
      id: generateRandomId(),
      combatantId: combatant.id,
      combatantName: combatant.name,
      initiative: combatant.initiativeRoll,
      isPlayer: 'class' in combatant,
      actions: []
    }));

    setTurns(initialTurns);
    setCurrentTurnIndex(0);
    setCurrentRound(1);
    setIsActive(true);
    setActiveTab("combat");

    toast.success("¡Combate iniciado!", { 
      description: "Los combatientes han rodado iniciativa y el combate ha comenzado"
    });
  };

  const handleAddAction = (action: CombatAction) => {
    if (!isActive || currentTurnIndex >= turns.length) return;

    setTurns(prevTurns => {
      const newTurns = [...prevTurns];
      newTurns[currentTurnIndex].actions.push(action);
      return newTurns;
    });

    toast.info(`${action.type} registrado`);
  };

  const handleNextTurn = () => {
    if (currentTurnIndex >= turns.length - 1) {
      // End of round, go back to first combatant and increase round counter
      setCurrentTurnIndex(0);
      setCurrentRound(prev => prev + 1);
      toast.success(`¡Comienza la ronda ${currentRound + 1}!`);
    } else {
      // Move to next combatant
      setCurrentTurnIndex(prev => prev + 1);
    }
  };

  const handleEndCombat = () => {
    setIsActive(false);
    setTurns([]);
    setCurrentTurnIndex(0);
    setCurrentRound(1);
    setActiveTab("setup");
    toast.info("Combate finalizado");
  };

  const addCustomEnemy = () => {
    if (!newEnemyName.trim()) {
      toast.error("Ingresa un nombre para el enemigo");
      return;
    }

    const hp = parseInt(newEnemyHP) || 10;
    
    const newEnemy = createEnemy(newEnemyName.trim(), hp);

    setCustomEnemies(prev => [...prev, newEnemy]);
    setCombatants(prev => [...prev, newEnemy]);
    setNewEnemyName('');
    setNewEnemyHP('10');
    
    toast.success("Enemigo añadido", { 
      description: `${newEnemyName} ha sido añadido al combate` 
    });
  };

  const removeCustomEnemy = (id: string) => {
    setCustomEnemies(prev => prev.filter(enemy => enemy.id !== id));
    setCombatants(prev => prev.filter(c => c.id !== id));
  };

  // Get current combatant info
  const currentCombatant = isActive && turns.length > 0 ? turns[currentTurnIndex] : null;

  return (
    <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-medieval flex items-center gap-2">
          <Sword className="h-5 w-5 text-primary" />
          Sistema de Combate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="setup" className="w-1/2">
              Preparación
            </TabsTrigger>
            <TabsTrigger value="combat" className="w-1/2" disabled={!isActive}>
              Combate
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup">
            <div className="space-y-4">
              <div>
                <h3 className="font-medieval mb-2 text-lg">Jugadores ({players.length})</h3>
                <ScrollArea className="h-[120px]">
                  {players.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {players.map(player => (
                        <div key={player.id} className="flex items-center gap-2 p-2 border rounded-md">
                          <div className="flex-1">
                            <div className="font-bold">{player.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Iniciativa: {Math.floor((player.attributes.dexterity - 10) / 2)}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {player.class}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No hay jugadores disponibles
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medieval mb-2 text-lg">Enemigos de la Campaña ({enemies.length})</h3>
                <ScrollArea className="h-[120px]">
                  {enemies.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {enemies.map(enemy => (
                        <div key={enemy.id} className="flex items-center gap-2 p-2 border rounded-md">
                          <div className="flex-1">
                            <div className="font-bold">{enemy.name}</div>
                            <div className="text-xs">HP: {enemy.stats.hp}/{enemy.stats.maxHp}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No hay enemigos de campaña
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medieval mb-2 text-lg">Añadir Enemigos Personalizados</h3>
                <div className="flex gap-2 mb-2">
                  <Input 
                    placeholder="Nombre del enemigo"
                    value={newEnemyName}
                    onChange={e => setNewEnemyName(e.target.value)}
                    className="flex-1"
                  />
                  <Input 
                    placeholder="HP"
                    value={newEnemyHP}
                    onChange={e => setNewEnemyHP(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-20"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={addCustomEnemy}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <ScrollArea className="h-[120px]">
                  {customEnemies.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {customEnemies.map(enemy => (
                        <div key={enemy.id} className="flex items-center gap-2 p-2 border rounded-md">
                          <div className="flex-1">
                            <div className="font-bold">{enemy.name}</div>
                            <div className="text-xs">HP: {enemy.stats.hp}</div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeCustomEnemy(enemy.id)}
                            className="h-7 w-7 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-4">
                      No hay enemigos personalizados
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={handleStartCombat}
                  disabled={combatants.length < 2}
                  className="w-full max-w-xs"
                >
                  <Sword className="mr-2 h-4 w-4" />
                  Iniciar Combate
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="combat">
            {isActive && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      Ronda {currentRound}
                    </Badge>
                    <h3 className="text-lg font-medieval">
                      Turno: {currentCombatant?.combatantName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Iniciativa: {currentCombatant?.initiative}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleNextTurn}
                    >
                      <SkipForward className="mr-1 h-4 w-4" />
                      Siguiente turno
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleEndCombat}
                    >
                      Finalizar combate
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Button
                    variant="secondary"
                    onClick={() => handleAddAction({
                      type: "attack" as CombatActionType,
                      description: 'Realizó un ataque',
                      timestamp: new Date()
                    })}
                    className="flex items-center gap-2"
                  >
                    <Sword className="h-4 w-4" />
                    Atacar
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => handleAddAction({
                      type: "defend" as CombatActionType,
                      description: 'Tomó posición defensiva',
                      timestamp: new Date()
                    })}
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Defender
                  </Button>
                  
                  <Button
                    variant="secondary"
                    onClick={() => handleAddAction({
                      type: "skill" as CombatActionType,
                      description: 'Usó una habilidad especial',
                      timestamp: new Date()
                    })}
                    className="flex items-center gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    Habilidad
                  </Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medieval mb-2">Orden de Iniciativa</h3>
                  <ScrollArea className="h-[150px] border rounded-md p-2">
                    {turns.map((turn, index) => (
                      <div 
                        key={turn.id}
                        className={`flex items-center justify-between p-2 rounded-md mb-1 ${
                          index === currentTurnIndex ? 'bg-primary/10 border border-primary' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                            {turn.initiative}
                          </Badge>
                          <div>
                            <div className="font-medium">{turn.combatantName}</div>
                            <div className="text-xs text-muted-foreground">
                              {turn.isPlayer ? 'Jugador' : 'Enemigo'}
                            </div>
                          </div>
                        </div>
                        {turn.actions.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {turn.actions.length} {turn.actions.length === 1 ? 'acción' : 'acciones'}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
                
                <div>
                  <h3 className="font-medieval mb-2">Registro de Acciones</h3>
                  <ScrollArea className="h-[150px] border rounded-md p-2">
                    {turns.flatMap(turn => 
                      turn.actions.map((action, i) => (
                        <div key={`${turn.id}-${i}`} className="mb-1 border-b pb-1 last:border-0">
                          <div className="flex justify-between">
                            <span className="font-medium">{turn.combatantName}</span>
                            <Badge variant="outline" className="text-xs">
                              {action.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                          <div className="text-xs text-muted-foreground">
                            {new Date(action.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      ))
                    )}
                    {turns.flatMap(turn => turn.actions).length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        No hay acciones registradas
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CombatTracker;
