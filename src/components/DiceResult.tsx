
import React from "react";
import { DiceRoll } from "@/lib/dice-utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

interface DiceResultProps {
  roll: DiceRoll | null;
}

const DiceResult: React.FC<DiceResultProps> = ({ roll }) => {
  if (!roll) return null;

  const modifierText = roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier < 0 ? `${roll.modifier}` : '';
  const diceText = `${roll.count}${roll.diceType}${modifierText}`;
  const rollTypeText = roll.rollType !== 'normal' ? ` with ${roll.rollType}` : '';

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      <Alert className="bg-card border-2 border-accent">
        <AlertTitle className="text-2xl font-medieval">
          {roll.playerName} rolled {diceText}{rollTypeText}
        </AlertTitle>
        <AlertDescription className="flex flex-col items-center mt-2 space-y-2">
          <div className="flex flex-wrap justify-center gap-2">
            {roll.results.map((result, index) => (
              <div
                key={index}
                className="w-12 h-12 flex items-center justify-center text-xl font-bold bg-accent rounded-md shiny-gold"
              >
                {result}
              </div>
            ))}
          </div>
          
          {roll.modifier !== 0 && (
            <div className="text-lg font-fantasy">
              {roll.results.join(' + ')} {modifierText} = {roll.total}
            </div>
          )}
          
          <div className="text-3xl font-bold font-medieval mt-2">{roll.total}</div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default DiceResult;
