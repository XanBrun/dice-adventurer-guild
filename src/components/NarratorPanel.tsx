
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { User, UserPlus, DicesIcon, MessageSquare } from "lucide-react";
import CombatTracker from "@/components/CombatTracker";
import { Character } from "@/lib/character-utils";
import { useRollSounds } from "@/hooks/useRollSounds";
import { DiceType, RollHistoryItem } from "@/lib/dice-utils";
import { motion } from "framer-motion";

interface Player extends Character {} // Type alias to match the required prop type

interface NarratorPanelProps {
  players: Player[];
  onRollDice?: (diceType: DiceType, count: number, modifier?: number, reason?: string) => void;
  onCombinedRoll?: (diceCombinations: { diceType: string; count: number }[], modifier?: number, reason?: string) => void;
  rollHistory?: RollHistoryItem[];
}

type TabType = "ROLL" | "CHARACTER" | "ENEMY" | "CHAT" | "SYSTEM";

const NarratorPanel: React.FC<NarratorPanelProps> = ({
  players = [],
  onRollDice,
  onCombinedRoll,
  rollHistory = []
}) => {
  const [selectedTab, setSelectedTab] = useState<TabType>("CHARACTER");
  const { playSound } = useRollSounds();

  const handleRoll = (type: DiceType, count: number, modifier: number = 0) => {
    playSound(type);
    if (onRollDice) {
      onRollDice(type, count, modifier, "Narrador");
    }
  };

  return (
    <Card className="border-2 border-accent">
      <CardHeader>
        <CardTitle className="font-medieval text-center">Panel del Narrador</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="CHARACTER" onValueChange={(value) => setSelectedTab(value as TabType)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="CHARACTER" className="text-xs sm:text-sm">
              <User className="h-4 w-4 mr-1 hidden sm:block" />
              Jugadores
            </TabsTrigger>
            <TabsTrigger value="ENEMY" className="text-xs sm:text-sm">
              <UserPlus className="h-4 w-4 mr-1 hidden sm:block" />
              Combate
            </TabsTrigger>
            <TabsTrigger value="ROLL" className="text-xs sm:text-sm">
              <DicesIcon className="h-4 w-4 mr-1 hidden sm:block" />
              Tiradas
            </TabsTrigger>
            <TabsTrigger value="CHAT" className="text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4 mr-1 hidden sm:block" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="CHARACTER">
            <div className="space-y-4">
              <h3 className="font-medieval text-center">Jugadores Activos ({players.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {players.map(player => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="font-bold text-lg">{player.name}</div>
                        <div className="text-sm text-muted-foreground">{player.race} {player.class}</div>
                        <div className="mt-2 text-sm">
                          <div>Nivel: {player.level}</div>
                          <div>PV: {player.hitPoints.current}/{player.hitPoints.max}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {players.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    No hay jugadores activos
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ENEMY">
            <CombatTracker players={players} />
          </TabsContent>

          <TabsContent value="ROLL">
            <div className="space-y-4">
              <h3 className="font-medieval text-center">Tiradas Rápidas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => handleRoll('d20', 1)}
                  className="h-16"
                >
                  d20
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleRoll('d12', 1)}
                  className="h-16"
                >
                  d12
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleRoll('d10', 1)}
                  className="h-16"
                >
                  d10
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleRoll('d8', 1)}
                  className="h-16"
                >
                  d8
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleRoll('d6', 1)}
                  className="h-16"
                >
                  d6
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleRoll('d4', 1)}
                  className="h-16"
                >
                  d4
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleRoll('d100', 1)}
                  className="h-16"
                >
                  d100
                </Button>
              </div>

              <div className="mt-4">
                <h4 className="font-medieval text-center mb-2">Tiradas Comunes</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => handleRoll('d20', 1)}
                    className="h-10 bg-primary"
                  >
                    Tirada de Ataque
                  </Button>
                  <Button 
                    onClick={() => handleRoll('d20', 1, 2)}
                    className="h-10"
                  >
                    Tirada de Habilidad
                  </Button>
                  <Button 
                    onClick={() => handleRoll('d6', 2)}
                    className="h-10"
                  >
                    2d6 (Daño)
                  </Button>
                  <Button 
                    onClick={() => handleRoll('d20', 1, -2)}
                    className="h-10"
                  >
                    Salvación (-2)
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="CHAT">
            <div className="h-[400px] flex items-center justify-center border rounded-md">
              <p className="text-muted-foreground">
                Funcionalidad de chat en desarrollo...
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NarratorPanel;
