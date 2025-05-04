
import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DiceSelector from "@/components/DiceSelector";
import DiceControls from "@/components/DiceControls";
import RollHistory from "@/components/RollHistory";
import DiceResult from "@/components/DiceResult";
import { DiceType, DiceRoll, RollType, performDiceRoll } from "@/lib/dice-utils";
import { motion } from "framer-motion";

const Index = () => {
  const [selectedDice, setSelectedDice] = useState<DiceType>("d20");
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollType, setRollType] = useState<RollType>("normal");
  const [playerName, setPlayerName] = useState<string>("Adventurer");
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [rollHistory, setRollHistory] = useState<DiceRoll[]>([]);
  const [isRolling, setIsRolling] = useState(false);

  // Load saved rolls from localStorage
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

  // Save rolls to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("diceRollHistory", JSON.stringify(rollHistory));
    } catch (error) {
      console.error("Error saving rolls:", error);
    }
  }, [rollHistory]);

  // Save player name when it changes
  useEffect(() => {
    localStorage.setItem("playerName", playerName);
  }, [playerName]);

  const handleDiceRoll = () => {
    try {
      setIsRolling(true);
      
      // Play rolling sound effect
      const audio = new Audio('/dice-roll.mp3');
      audio.volume = 0.6;
      audio.play().catch(e => console.log("Audio play failed:", e));

      setTimeout(() => {
        const roll = performDiceRoll(
          selectedDice,
          diceCount,
          modifier,
          rollType,
          playerName || "Adventurer"
        );
        
        setCurrentRoll(roll);
        setRollHistory((prev) => [roll, ...prev]);
        
        // Show critical hit/miss notifications for d20
        if (selectedDice === "d20" && diceCount === 1) {
          if (roll.results[0] === 20) {
            toast.success("Critical Hit!", {
              description: "The dice gods smile upon you!",
              duration: 3000,
            });
          } else if (roll.results[0] === 1) {
            toast.error("Critical Miss!", {
              description: "The dice gods are displeased...",
              duration: 3000,
            });
          }
        }
        
        setIsRolling(false);
      }, 700);
    } catch (error) {
      console.error("Error rolling dice:", error);
      toast.error("Error rolling dice", {
        description: error instanceof Error ? error.message : "Unknown error",
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
    toast.info("Roll history cleared");
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-medieval text-center mb-6 text-primary">
            Dice Adventurer Guild
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center font-medieval">Choose Your Dice</CardTitle>
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
                <CardTitle className="font-medieval">Your Rolls</CardTitle>
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
      </div>
    </div>
  );
};

export default Index;
