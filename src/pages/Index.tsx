
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DiceSelector from "@/components/DiceSelector";
import MultiDiceSelector from "@/components/MultiDiceSelector";
import DiceControls from "@/components/DiceControls";
import RollHistory from "@/components/RollHistory";
import DiceResult from "@/components/DiceResult";
import CombinedDiceResult from "@/components/CombinedDiceResult";
import CharacterList from "@/components/CharacterList";
import NarratorPanel from "@/components/NarratorPanel";
import BluetoothStatus from "@/components/BluetoothStatus";
import CombatRules from "@/components/CombatRules";
import QRCodeShare from "@/components/QRCodeShare";
import { 
  DiceType, 
  DiceRoll, 
  RollType, 
  performDiceRoll,
  CombinedDiceRoll,
  performCombinedDiceRoll,
  DiceCombination,
  formatRollResult,
  formatCombinedRollResult,
  rollCombinedDice
} from "@/lib/dice-utils";
import { Character } from "@/lib/character-utils";
import { BluetoothRole, bluetoothManager } from "@/lib/bluetooth-utils";
import { motion } from "framer-motion";
import { MapIcon, Sword, Dices as DicesIcon, MinusIcon, PlusIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useRollSounds } from "@/hooks/useRollSounds";

function Index() {
  const { playSoundForRoll, playSound } = useRollSounds();
  const [selectedDice, setSelectedDice] = useState<DiceType>("d20");
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollType, setRollType] = useState<RollType>("normal");
  const [playerName, setPlayerName] = useState<string>("Aventurero");
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [currentCombinedRoll, setCurrentCombinedRoll] = useState<CombinedDiceRoll | null>(null);
  const [rollHistory, setRollHistory] = useState<Array<DiceRoll | CombinedDiceRoll>>([]); 
  const [isRolling, setIsRolling] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dice");
  const [diceSubTab, setDiceSubTab] = useState<string>("simple");
  const [bluetoothRole, setBluetoothRole] = useState<BluetoothRole>('none');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [diceCombination, setDiceCombination] = useState<DiceCombination[]>([]);

  // Load saved data
  useEffect(() => {
    try {
      const savedRolls = localStorage.getItem("diceRollHistory");
      if (savedRolls) {
        const parsedRolls = JSON.parse(savedRolls);
        // Convert string dates back to Date objects
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

  // Save rolls when they change
  useEffect(() => {
    try {
      localStorage.setItem("diceRollHistory", JSON.stringify(rollHistory));
    } catch (error) {
      console.error("Error saving rolls:", error);
    }
  }, [rollHistory]);

  // Save player name
  useEffect(() => {
    localStorage.setItem("playerName", playerName);
  }, [playerName]);

  // When selecting a character
  useEffect(() => {
    if (selectedCharacter) {
      setPlayerName(selectedCharacter.name);
    }
  }, [selectedCharacter]);

  const handleDiceRoll = () => {
    try {
      setIsRolling(true);
      
      // Play sound effect
      playSoundForRoll({
        id: 'temp-roll',
        diceType: selectedDice,
        count: diceCount,
        modifier: modifier,
        rollType: rollType,
        results: [],
        total: 0,
        timestamp: new Date(),
        playerName: playerName
      });

      setTimeout(() => {
        let finalModifier = modifier;
        
        const roll = performDiceRoll(
          selectedDice,
          diceCount,
          finalModifier,
          rollType,
          playerName || "Aventurero"
        );
        
        setCurrentRoll(roll);
        setCurrentCombinedRoll(null);
        setRollHistory((prev) => [roll, ...prev]);
        
        // Show notifications for critical hits
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
        
        // If connected via Bluetooth, send the roll
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

  const handleCombinedRoll = (
    diceCombination: DiceCombination[], 
    modifier: number = 0, 
    reason?: string
  ) => {
    const roll = rollCombinedDice(diceCombination, modifier, selectedCharacter?.name || "Jugador");
    
    // Properly cast the roll type to match the history item type
    setRollHistory(prev => [roll, ...prev]);
    
    // Play a sound based on one of the dice used, defaulting to d20 if no dice
    if (diceCombination.length > 0) {
      playSound(diceCombination[0].diceType);
    } else {
      playSound('d20');
    }
  };

  const handleCombinedDiceRoll = () => {
    try {
      // Check if any dice are selected
      if (diceCombination.length === 0 || diceCombination.every(d => d.count === 0)) {
        toast.error("Selecciona al menos un dado", {
          description: "Debes seleccionar al menos un dado para realizar una tirada combinada"
        });
        return;
      }

      setIsRolling(true);
      
      // Play sound effect - use the first dice type for now
      const firstDice = diceCombination[0];
      if (firstDice) {
        playSoundForRoll({
          id: 'temp-roll',
          diceType: firstDice.diceType,
          count: firstDice.count,
          modifier: modifier,
          rollType: 'normal',
          results: [],
          total: 0,
          timestamp: new Date(),
          playerName: playerName
        });
      }

      setTimeout(() => {
        const roll = performCombinedDiceRoll(
          diceCombination,
          modifier,
          'normal',
          playerName || "Aventurero"
        );
        
        setCurrentCombinedRoll(roll);
        setCurrentRoll(null);
        setRollHistory((prev) => [roll, ...prev]);
        
        // If connected via Bluetooth, send the roll
        if (bluetoothManager.isConnected) {
          bluetoothManager.sendMessage({
            type: 'COMBINED_ROLL',
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

  const handleReroll = (roll: DiceRoll | CombinedDiceRoll) => {
    if ('diceType' in roll) {
      // Regular dice roll
      setSelectedDice(roll.diceType);
      setDiceCount(roll.count);
      setModifier(roll.modifier);
      setRollType(roll.rollType);
      setDiceSubTab("simple");
      handleDiceRoll();
    } else {
      // Combined dice roll
      setDiceCombination(roll.dice);
      setModifier(roll.modifier);
      setDiceSubTab("combined");
      handleCombinedDiceRoll();
    }
  };

  const handleClearHistory = () => {
    setRollHistory([]);
    setCurrentRoll(null);
    setCurrentCombinedRoll(null);
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
          <div className="flex items-center gap-2">
            <Link to="/campaigns">
              <Button variant="outline" className="flex items-center gap-2">
                <MapIcon className="h-4 w-4" />
                <span className="font-medieval">Campañas</span>
              </Button>
            </Link>
            <BluetoothStatus onRoleChange={handleBluetoothRoleChange} />
          </div>
        </motion.div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-5 w-full mb-6">
            <TabsTrigger value="dice" className="font-medieval">Dados</TabsTrigger>
            <TabsTrigger value="characters" className="font-medieval">Personajes</TabsTrigger>
            <TabsTrigger value="narrator" className="font-medieval">Narrador</TabsTrigger>
            <TabsTrigger value="combat" className="font-medieval">Combate</TabsTrigger>
            <TabsTrigger value="share" className="font-medieval">Compartir</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dice">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-center font-medieval">Elige tus Dados</CardTitle>
                    
                    <Tabs value={diceSubTab} onValueChange={setDiceSubTab} className="mt-4">
                      <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="simple" className="flex items-center gap-2">
                          <DicesIcon className="h-4 w-4" />
                          <span>Dados Simples</span>
                        </TabsTrigger>
                        <TabsTrigger value="combined" className="flex items-center gap-2">
                          <DicesIcon className="h-4 w-4" />
                          <span>Dados Combinados</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardHeader>
                  <CardContent>
                    {diceSubTab === "simple" ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <MultiDiceSelector
                          selectedDiceCombination={diceCombination}
                          onChange={setDiceCombination}
                        />
                        
                        <div className="mt-6 flex flex-col space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="text-sm font-medieval">Nombre del Jugador</label>
                              <input
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medieval">Modificador</label>
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setModifier(modifier - 1)}
                                >
                                  <MinusIcon className="h-4 w-4" />
                                </Button>
                                <div className="w-10 text-center font-bold">
                                  {modifier >= 0 ? `+${modifier}` : modifier}
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setModifier(modifier + 1)}
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            onClick={handleCombinedDiceRoll} 
                            className="w-full font-medieval bg-accent text-black hover:bg-accent/90 text-lg"
                            disabled={diceCombination.length === 0 || diceCombination.every(d => d.count === 0)}
                          >
                            Roll Combined Dice!
                          </Button>
                        </div>
                        
                        <motion.div 
                          className="dice-container mt-6" 
                          animate={{ rotate: isRolling ? [0, 15, -15, 10, -5, 0] : 0 }}
                          transition={{ duration: 0.7 }}
                        >
                          {currentCombinedRoll && (
                            <CombinedDiceResult roll={currentCombinedRoll} />
                          )}
                        </motion.div>
                      </>
                    )}
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
              <NarratorPanel players={[]} />
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
          
          <TabsContent value="combat">
            <CombatRules />
          </TabsContent>
          
          <TabsContent value="share">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QRCodeShare />
              
              <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-medieval flex items-center gap-2">
                    <Sword className="h-5 w-5" />
                    Aplicación Offline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>Esta aplicación funciona completamente offline. Una vez cargada, puedes:</p>
                    
                    <ul className="list-disc list-inside space-y-2">
                      <li>Usar la aplicación sin conexión a internet</li>
                      <li>Añadirla a tu pantalla de inicio en Android/iOS para acceso rápido</li>
                      <li>Todos los datos se guardan localmente en tu dispositivo</li>
                      <li>Compartir el enlace o código QR con otros jugadores</li>
                    </ul>
                    
                    <div className="bg-accent/20 p-4 rounded-md mt-4">
                      <h4 className="font-medieval mb-2">Para añadir a la pantalla de inicio:</h4>
                      <p className="text-sm">
                        En Chrome para Android: Menu → Añadir a la pantalla de inicio<br />
                        En Safari para iOS: Compartir → Añadir a la pantalla de inicio
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Index;
