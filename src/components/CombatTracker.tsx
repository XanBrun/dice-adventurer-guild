
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Enemy } from "@/lib/character-utils";
import { performDiceRoll } from "@/lib/dice-utils";
import { toast } from "@/components/ui/sonner";
import { STANDARD_ACTIONS } from "@/lib/combat-utils";
import { Sword, Shield, Circle, User, UserRound } from "lucide-react";
import { motion } from "framer-motion";

interface InitiativeEntry {
  id: string;
  name: string;
  initiative: number;
  isPlayer: boolean;
  hitPoints?: {
    current: number;
    max: number;
  };
  armorClass?: number;
  temporaryHP?: number;
  conditions?: string[];
  enemyRef?: Enemy;
}

interface CombatTrackerProps {
  enemies: Enemy[];
  connectedPlayers: string[];
  onEnemyDamage?: (enemyId: string, damage: number) => void;
}

const CombatTracker: React.FC<CombatTrackerProps> = ({ 
  enemies, 
  connectedPlayers,
  onEnemyDamage
}) => {
  const [initiativeOrder, setInitiativeOrder] = useState<InitiativeEntry[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(-1);
  const [isCombatActive, setIsCombatActive] = useState(false);
  const [damageAmount, setDamageAmount] = useState<string>("");
  const [round, setRound] = useState(1);
  const [elapsedTurns, setElapsedTurns] = useState(0);

  // Start combat and calculate initiative
  const handleStartCombat = () => {
    const initiativeEntries: InitiativeEntry[] = [];
    
    // Add enemies
    enemies.forEach(enemy => {
      // Roll initiative (d20 + modifier)
      const initiativeRoll = Math.floor(Math.random() * 20) + 1 + enemy.initiative;
      
      initiativeEntries.push({
        id: enemy.id,
        name: enemy.name,
        initiative: initiativeRoll,
        isPlayer: false,
        hitPoints: { ...enemy.hitPoints },
        armorClass: enemy.armorClass,
        conditions: [],
        enemyRef: enemy
      });
    });
    
    // Add connected players
    connectedPlayers.forEach((playerName, index) => {
      // Roll initiative for players
      const initiativeRoll = Math.floor(Math.random() * 20) + 1;
      
      initiativeEntries.push({
        id: `player_${index}`,
        name: playerName,
        initiative: initiativeRoll,
        isPlayer: true,
        conditions: []
      });
    });
    
    // Sort by initiative (higher to lower)
    const orderedInitiative = initiativeEntries.sort((a, b) => b.initiative - a.initiative);
    setInitiativeOrder(orderedInitiative);
    setCurrentTurn(0);
    setIsCombatActive(true);
    setRound(1);
    setElapsedTurns(0);
    
    toast.success("¡Combate iniciado!", {
      description: `Orden de iniciativa calculado. ${orderedInitiative[0]?.name} comienza.`
    });
  };

  // Move to the next turn
  const handleNextTurn = () => {
    if (initiativeOrder.length === 0) return;
    
    const nextTurn = (currentTurn + 1) % initiativeOrder.length;
    
    // If we've gone through all participants, increase the round counter
    if (nextTurn === 0) {
      setRound(prevRound => prevRound + 1);
    }
    
    setCurrentTurn(nextTurn);
    setElapsedTurns(prev => prev + 1);
    
    toast({
      title: "Siguiente turno",
      description: `Es el turno de ${initiativeOrder[nextTurn].name}.`
    });
  };

  // End combat
  const handleEndCombat = () => {
    setIsCombatActive(false);
    setInitiativeOrder([]);
    setCurrentTurn(-1);
    setRound(1);
    setElapsedTurns(0);
    
    toast({
      title: "Combate finalizado",
      description: "El orden de iniciativa ha sido reiniciado."
    });
  };

  // Apply damage to a participant
  const handleApplyDamage = (participantId: string) => {
    const damage = parseInt(damageAmount);
    if (isNaN(damage)) {
      toast.error("Cantidad inválida", {
        description: "Ingresa un número válido para aplicar daño."
      });
      return;
    }

    setInitiativeOrder(prevOrder => 
      prevOrder.map(participant => {
        if (participant.id === participantId && participant.hitPoints) {
          const newHP = Math.max(0, participant.hitPoints.current - damage);
          
          // If enemy has died
          if (newHP === 0 && !participant.isPlayer) {
            toast({
              title: `${participant.name} ha caído`,
              description: "0 puntos de vida restantes."
            });
          }
          
          // Call parent handler if provided
          if (onEnemyDamage && !participant.isPlayer) {
            onEnemyDamage(participantId, damage);
          }
          
          return {
            ...participant,
            hitPoints: {
              ...participant.hitPoints,
              current: newHP
            }
          };
        }
        return participant;
      })
    );
    
    setDamageAmount("");
  };

  // Apply healing to a participant
  const handleApplyHealing = (participantId: string) => {
    const healing = parseInt(damageAmount);
    if (isNaN(healing)) {
      toast.error("Cantidad inválida", {
        description: "Ingresa un número válido para aplicar curación."
      });
      return;
    }

    setInitiativeOrder(prevOrder => 
      prevOrder.map(participant => {
        if (participant.id === participantId && participant.hitPoints) {
          const newHP = Math.min(participant.hitPoints.max, participant.hitPoints.current + healing);
          return {
            ...participant,
            hitPoints: {
              ...participant.hitPoints,
              current: newHP
            }
          };
        }
        return participant;
      })
    );
    
    setDamageAmount("");
  };

  // Toggle a condition on a participant
  const handleToggleCondition = (participantId: string, condition: string) => {
    setInitiativeOrder(prevOrder => 
      prevOrder.map(participant => {
        if (participant.id === participantId) {
          const conditions = participant.conditions || [];
          const hasCondition = conditions.includes(condition);
          
          return {
            ...participant,
            conditions: hasCondition 
              ? conditions.filter(c => c !== condition)
              : [...conditions, condition]
          };
        }
        return participant;
      })
    );
  };

  // Roll a check for a participant
  const handleRollCheck = (participantId: string, checkType: string) => {
    const participant = initiativeOrder.find(p => p.id === participantId);
    if (!participant) return;
    
    const roll = performDiceRoll('d20', 1, 0, 'normal', participant.name);
    
    toast({
      title: `Tirada de ${participant.name}`,
      description: `${checkType}: ${roll.total}`
    });
  };

  // Calculate health percentage for displaying health bars
  const getHealthPercentage = (current: number, max: number) => {
    return Math.max(0, Math.min(100, (current / max) * 100));
  };

  // Get health status color
  const getHealthColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage <= 25) return "bg-red-500";
    if (percentage <= 50) return "bg-orange-500";
    if (percentage <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="border border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-medieval">Tablero de Combate</CardTitle>
        <div className="space-x-2">
          {isCombatActive ? (
            <>
              <Button variant="outline" onClick={handleNextTurn}>
                Siguiente Turno
              </Button>
              <Button variant="destructive" onClick={handleEndCombat}>
                Finalizar Combate
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleStartCombat} 
              className="font-medieval bg-accent text-black hover:bg-accent/90"
              disabled={enemies.length === 0 && connectedPlayers.length === 0}
            >
              Iniciar Combate
            </Button>
          )}
        </div>
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
          
          {isCombatActive && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                Ronda {round}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                Turnos: {elapsedTurns}
              </Badge>
            </div>
          )}
        </div>
        
        {isCombatActive && (
          <div className="space-y-4">
            <div className="flex gap-2 items-center mb-4">
              <Input
                type="number"
                value={damageAmount}
                onChange={(e) => setDamageAmount(e.target.value)}
                placeholder="Cantidad de daño/curación"
                className="max-w-[150px]"
              />
              <span className="text-sm text-muted-foreground">
                (Usa este valor para daño o curación)
              </span>
            </div>
            
            <ScrollArea className="h-[400px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Turno</TableHead>
                    <TableHead>Participante</TableHead>
                    <TableHead>Iniciativa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initiativeOrder.map((entry, index) => (
                    <TableRow 
                      key={entry.id} 
                      className={`${index === currentTurn ? 'bg-accent/20' : ''}`}
                    >
                      <TableCell>
                        {index === currentTurn ? (
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1] }} 
                            transition={{ repeat: Infinity, repeatDelay: 1 }}
                          >
                            <Badge variant="default" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                          </motion.div>
                        ) : (
                          <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.isPlayer ? (
                            <UserRound className="h-4 w-4 text-primary" />
                          ) : (
                            <Sword className="h-4 w-4 text-destructive" />
                          )}
                          <span className={`font-bold ${entry.isPlayer ? 'text-primary' : ''}`}>
                            {entry.name}
                          </span>
                        </div>
                        
                        {entry.hitPoints && (
                          <div className="mt-1 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getHealthColor(entry.hitPoints.current, entry.hitPoints.max)}`}
                              style={{ width: `${getHealthPercentage(entry.hitPoints.current, entry.hitPoints.max)}%` }}
                            ></div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{entry.initiative}</TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          {entry.hitPoints && (
                            <span className="text-sm">
                              PV: {entry.hitPoints.current}/{entry.hitPoints.max}
                            </span>
                          )}
                          {entry.armorClass && (
                            <span className="text-sm">
                              CA: {entry.armorClass}
                            </span>
                          )}
                          {entry.conditions && entry.conditions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entry.conditions.map((condition, i) => (
                                <Badge key={i} variant="destructive" className="text-xs">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-x-1">
                          {entry.hitPoints && (
                            <>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleApplyDamage(entry.id)}
                                disabled={!damageAmount}
                              >
                                Daño
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-7 text-xs bg-green-100 hover:bg-green-200 border-green-200"
                                onClick={() => handleApplyHealing(entry.id)}
                                disabled={!damageAmount}
                              >
                                Curar
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleRollCheck(entry.id, 'Iniciativa')}
                          >
                            d20
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleToggleCondition(entry.id, 'Aturdido')}
                          >
                            Estado
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            
            {currentTurn >= 0 && initiativeOrder[currentTurn] && (
              <div className="mt-4 p-3 bg-accent/10 rounded-md">
                <h3 className="font-bold mb-2">Turno actual: {initiativeOrder[currentTurn].name}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {STANDARD_ACTIONS.slice(0, 8).map((action, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 justify-start"
                      onClick={() => {
                        toast({
                          title: `${initiativeOrder[currentTurn].name} usa ${action.name}`,
                          description: action.description
                        });
                      }}
                    >
                      {action.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {!isCombatActive && (enemies.length === 0 && connectedPlayers.length === 0) && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No hay participantes para iniciar un combate. Añade enemigos o conecta jugadores.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CombatTracker;
