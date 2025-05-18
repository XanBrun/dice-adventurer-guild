
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DiceSelector from "@/components/DiceSelector";
import DiceControls from "@/components/DiceControls";
import RollHistory from "@/components/RollHistory";
import DiceResult from "@/components/DiceResult";
import CharacterList from "@/components/CharacterList";
import NarratorPanel from "@/components/NarratorPanel";
import BluetoothStatus from "@/components/BluetoothStatus";
import { DiceType, DiceRoll, RollType, performDiceRoll } from "@/lib/dice-utils";
import { Character } from "@/lib/character-utils";
import { BluetoothRole, bluetoothManager } from "@/lib/bluetooth-utils";
import { motion } from "framer-motion";

const Index = () => {
  const [selectedDice, setSelectedDice] = useState<DiceType>("d20");
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollType, setRollType] = useState<RollType>("normal");
  const [playerName, setPlayerName] = useState<string>("Aventurero");
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dice");
  const [bluetoothRole, setBluetoothRole] = useState<BluetoothRole>('none');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Cargar datos guardados
  useEffect(() => {
    try {
      const savedRolls = localStorage.getItem("diceRollHistory");
      if (savedRolls) {
        const parsedRolls = JSON.parse(savedRolls);
        // Convertir string dates back to Date objects
        const hydratedRolls = parsedRolls.map((roll: any) => ({
          ...roll,
          timestamp: new Date(roll.timestamp)
        }));
        setRollHistory(hydratedRolls);
      }
      
      const savedName = localStorage.getItem("playerName");
      if (savedName) {
        setPlayerName(savedName);
      }
    } catch (error) {
      console.error("Error loading saved rolls:", error);
    }
  }, []);

  // Guardar tiradas cuando cambian
  useEffect(() => {
    try {
      localStorage.setItem("diceRollHistory", JSON.stringify(rollHistory));
    } catch (error) {
      console.error("Error saving rolls:", error);
    }
  }, [rollHistory]);

  // Guardar nombre de jugador
  useEffect(() => {
    localStorage.setItem("playerName", playerName);
  }, [playerName]);

  // Al seleccionar un personaje
  useEffect(() => {
    if (selectedCharacter) {
      setPlayerName(selectedCharacter.name);
      // Actualizar modificadores desde el personaje si es necesario
    }
  }, [selectedCharacter]);

  const handleDiceRoll = () => {
    try {
      setIsRolling(true);
      
      // Reproducir efecto de sonido
      const audio = new Audio('/dice-roll.mp3');
      audio.volume = 0.6;
      audio.play().catch(e => console.log("Audio play failed:", e));

      setTimeout(() => {
        // Calcular modificador según el personaje seleccionado si es necesario
        let finalModifier = modifier;
        
        // Si tenemos un personaje seleccionado, podríamos ajustar el modificador
        if (selectedCharacter && selectedDice === "d20") {
          // Ejemplo: añadir el modificador de habilidad según el contexto
          // finalModifier += selectedCharacter.modifiers.strength;
        }

        const roll = performDiceRoll(
          selectedDice,
          diceCount,
          finalModifier,
          rollType,
          playerName || "Aventurero"
        );
        
        setCurrentRoll(roll);
        setRollHistory((prev) => [roll, ...prev]);
        
        // Mostrar notificaciones de crítico
        if (selectedDice === "d20" && diceCount === 1) {
          if (roll.results[0] === 20) {
            toast.success("¡Crítico!", {
              description: "¡Los dioses del dado sonríen sobre ti!",
              duration: 3000,
            });
          } else if (roll.results[0] === 1) {
            toast.error("¡Pifia!", {
              description: "Los dioses del dado te han abandonado...",
              duration: 3000,
            });
          }
        }
        
        // Si está conectado por Bluetooth, enviar la tirada
        if (bluetoothManager.isConnected) {
          bluetoothManager.sendMessage({
            type: 'ROLL',
            playerId: 'local-player',
            playerName: playerName,
            data: { roll }
          });
        }
        
        setIsRolling(false);
      }, 700);
    } catch (error) {
      console.error("Error rolling dice:", error);
      toast.error("Error al tirar los dados", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
      setIsRolling(false);
    }
  };

  const handleReroll = (roll: DiceRoll) => {
    setSelectedDice(roll.diceType);
    setDiceCount(roll.count);
    setModifier(roll.modifier);
    setRollType(roll.rollType);
    handleDiceRoll();
  };

  const handleClearHistory = () => {
    setRollHistory([]);
    setCurrentRoll(null);
    localStorage.removeItem("diceRollHistory");
    toast.info("Historial de tiradas borrado");
  };

  const handleBluetoothRoleChange = (role: BluetoothRole) => {
    setBluetoothRole(role);
    if (role === 'narrator') {
      setActiveTab('narrator');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <h1 className="text-4xl md:text-5xl font-medieval text-center md:text-left text-primary">
            Dados del Aventurero Guild
          </h1>
          <BluetoothStatus onRoleChange={handleBluetoothRoleChange} />
        </motion.div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 w-full mb-6">
            <TabsTrigger value="dice" className="font-medieval">Dados</TabsTrigger>
            <TabsTrigger value="characters" className="font-medieval">Personajes</TabsTrigger>
            <TabsTrigger value="narrator" className="font-medieval">Narrador</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dice">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-center font-medieval">Elige tus Dados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DiceSelector
                      selectedDice={selectedDice}
                      onChange={setSelectedDice}
                    />

                    <div className="mt-6">
                      <DiceControls
                        count={diceCount}
                        setCount={setDiceCount}
                        modifier={modifier}
                        setModifier={setModifier}
                        rollType={rollType}
                        setRollType={setRollType}
                        playerName={playerName}
                        setPlayerName={setPlayerName}
                        onRoll={handleDiceRoll}
                      />
                    </div>

                    <motion.div 
                      className="dice-container mt-6" 
                      animate={{ rotate: isRolling ? [0, 15, -15, 10, -5, 0] : 0 }}
                      transition={{ duration: 0.7 }}
                    >
                      {currentRoll && (
                        <DiceResult roll={currentRoll} />
                      )}
                    </motion.div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-1">
                <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="font-medieval">Tus Tiradas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RollHistory
                      rolls={rollHistory}
                      onReroll={handleReroll}
                      onClearHistory={handleClearHistory}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="characters">
            <CharacterList onSelectCharacter={setSelectedCharacter} />
          </TabsContent>
          
          <TabsContent value="narrator">
            {bluetoothRole === 'narrator' ? (
              <NarratorPanel />
            ) : (
              <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-xl font-medieval mb-4">
                    Necesitas ser Narrador para acceder a este panel
                  </p>
                  <p className="mb-6">
                    Para convertirte en Narrador, presiona el botón "Narrador" en las opciones de Bluetooth.
                  </p>
                  <BluetoothStatus onRoleChange={handleBluetoothRoleChange} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
