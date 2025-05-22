import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dices, Users, Crown, Map } from "lucide-react";
import { motion } from "framer-motion";
import DiceSelector from "@/components/DiceSelector";
import DiceControls from "@/components/DiceControls";
import DiceResult from "@/components/DiceResult";
import RollHistory from "@/components/RollHistory";
import MultiDiceSelector from "@/components/MultiDiceSelector";
import CharacterList from "@/components/CharacterList";
import NarratorPanel from "@/components/NarratorPanel";
import CombatRules from "@/components/CombatRules";
import CombatTracker from "@/components/CombatTracker";
import { useRollSounds } from "@/hooks/useRollSounds";
import { Character, loadCharacters } from "@/lib/character-utils";
import { DiceType, RollType, DiceCombination, performDiceRoll, performCombinedDiceRoll } from "@/lib/dice-utils";

const Index = () => {
  const navigate = useNavigate();
  const [selectedDice, setSelectedDice] = useState<DiceType>('d20');
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollType, setRollType] = useState<RollType>("normal");
  const [playerName, setPlayerName] = useState("Aventurero");
  const [rollHistory, setRollHistory] = useState<any[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [diceCombination, setDiceCombination] = useState<DiceCombination[]>([]);
  const { playSound, playSoundForRoll, isSoundEnabled, toggleSound } = useRollSounds();

  useEffect(() => {
    const characters = loadCharacters();
    if (characters.length > 0) {
      setSelectedCharacter(characters[0]);
      setPlayerName(characters[0].name);
    }
  }, []);

  const handleRoll = () => {
    const roll = performDiceRoll(selectedDice, diceCount, modifier, rollType, playerName);
    playSoundForRoll(roll);
    setRollHistory(prev => [roll, ...prev]);
  };

  const handleCombinedRoll = () => {
    if (diceCombination.length === 0) return;
    
    const roll = performCombinedDiceRoll(diceCombination, modifier, rollType, playerName);
    diceCombination.forEach(dice => playSound(dice.diceType));
    setRollHistory(prev => [roll, ...prev]);
  };

  const handleReroll = (roll: any) => {
    if ('diceType' in roll) {
      // Single dice roll
      const newRoll = performDiceRoll(roll.diceType, roll.count, roll.modifier, roll.rollType, roll.playerName);
      playSoundForRoll(newRoll);
      setRollHistory(prev => [newRoll, ...prev]);
    } else {
      // Combined roll
      const newRoll = performCombinedDiceRoll(roll.dice, roll.modifier, roll.rollType, roll.playerName);
      roll.dice.forEach((dice: DiceCombination) => playSound(dice.diceType));
      setRollHistory(prev => [newRoll, ...prev]);
    }
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    setPlayerName(character.name);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-medieval text-primary">
              Dados del Aventurero
            </h1>
            <Button onClick={() => navigate('/campaigns')} className="font-medieval">
              <Map className="h-4 w-4 mr-2" />
              Campañas
            </Button>
          </div>

          <Tabs defaultValue="dice" className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="dice" className="w-1/3">
                <Dices className="h-4 w-4 mr-2" />
                Dados
              </TabsTrigger>
              <TabsTrigger value="characters" className="w-1/3">
                <Users className="h-4 w-4 mr-2" />
                Personajes
              </TabsTrigger>
              <TabsTrigger value="narrator" className="w-1/3">
                <Crown className="h-4 w-4 mr-2" />
                Narrador
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dice" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="font-medieval">Lanzar Dados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Tabs defaultValue="single">
                        <TabsList className="w-full">
                          <TabsTrigger value="single" className="w-1/2">
                            Dado Individual
                          </TabsTrigger>
                          <TabsTrigger value="multiple" className="w-1/2">
                            Dados Múltiples
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="single" className="space-y-4">
                          <DiceSelector
                            selectedDice={selectedDice}
                            onChange={setSelectedDice}
                          />
                          <DiceControls
                            count={diceCount}
                            setCount={setDiceCount}
                            modifier={modifier}
                            setModifier={setModifier}
                            rollType={rollType}
                            setRollType={setRollType}
                            playerName={playerName}
                            setPlayerName={setPlayerName}
                            onRoll={handleRoll}
                          />
                        </TabsContent>

                        <TabsContent value="multiple" className="space-y-4">
                          <MultiDiceSelector
                            selectedDiceCombination={diceCombination}
                            onChange={setDiceCombination}
                          />
                          <Button 
                            onClick={handleCombinedRoll}
                            className="w-full font-medieval bg-accent text-black hover:bg-accent/90"
                            disabled={diceCombination.length === 0}
                          >
                            ¡Lanzar Dados!
                          </Button>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>

                  {rollHistory.length > 0 && rollHistory[0] && (
                    <DiceResult roll={rollHistory[0]} />
                  )}
                </div>

                <div>
                  <RollHistory
                    rolls={rollHistory}
                    onReroll={handleReroll}
                    onClearHistory={() => setRollHistory([])}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="characters">
              <CharacterList onSelectCharacter={handleCharacterSelect} />
            </TabsContent>

            <TabsContent value="narrator" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <NarratorPanel
                  players={selectedCharacter ? [selectedCharacter] : []}
                  onRollDice={(diceType, count, modifier) => {
                    const roll = performDiceRoll(diceType as DiceType, count, modifier || 0, "normal", "Narrador");
                    playSoundForRoll(roll);
                    setRollHistory(prev => [roll, ...prev]);
                  }}
                />
                <CombatRules />
              </div>
              
              <Separator />
              
              <CombatTracker
                players={selectedCharacter ? [selectedCharacter] : []}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;