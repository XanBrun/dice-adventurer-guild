
import React from "react";
import { CombinedDiceRoll, DICE_SETS } from "@/lib/dice-utils";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface CombinedDiceResultProps {
  roll: CombinedDiceRoll;
}

const CombinedDiceResult: React.FC<CombinedDiceResultProps> = ({ roll }) => {
  return (
    <Card className="overflow-hidden bg-white/70 dark:bg-black/20 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="text-center mb-2">
          <span className="font-bold">{roll.playerName}'s Roll:</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {roll.results.map((diceResult, index) => {
            const diceSet = DICE_SETS.find(d => d.type === diceResult.diceType);
            
            return (
              <div key={index} className="flex flex-wrap gap-1 justify-center">
                {diceResult.values.map((value, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + i * 0.05 }}
                    className={`${diceSet?.color || 'bg-gray-500'} h-10 w-10 flex items-center justify-center rounded-md text-white font-bold`}
                  >
                    {value}
                  </motion.div>
                ))}
                <div className="flex items-center ml-2 text-sm font-medieval">
                  {diceResult.diceType}
                </div>
              </div>
            );
          })}
        </div>

        {roll.modifier !== 0 && (
          <div className="text-center mt-2">
            <span className="text-primary font-bold">
              {roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier}
            </span>
          </div>
        )}

        <div className="text-center mt-3 text-xl font-bold border-t pt-2">
          Total: {roll.total}
        </div>
      </CardContent>
    </Card>
  );
};

export default CombinedDiceResult;
