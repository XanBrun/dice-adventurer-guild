
import React from 'react';
import { DiceRoll, formatRollResult } from "@/lib/dice-utils";
import { motion } from "framer-motion";
import CriticalEffects from '@/components/CriticalEffects';
import { cn } from '@/lib/utils';

interface DiceResultProps {
  roll: DiceRoll;
}

const DiceResult: React.FC<DiceResultProps> = ({ roll }) => {
  const { diceType, count, results, total, timestamp } = roll;
  const isCriticalRoll = diceType === 'd20' && count === 1;
  const isCriticalSuccess = isCriticalRoll && results[0] === 20;
  const isCriticalFailure = isCriticalRoll && results[0] === 1;
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="relative">
      <motion.div 
        className={cn(
          "rounded-lg bg-white/90 dark:bg-black/80 p-6 shadow-lg border-2 relative overflow-hidden",
          isCriticalSuccess ? "border-yellow-400" : 
          isCriticalFailure ? "border-red-600" : 
          "border-gray-200"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CriticalEffects isCritical={isCriticalSuccess} isFail={isCriticalFailure} />
        
        <div className="mb-4 flex justify-between items-center">
          <h3 className="font-medieval text-xl">
            {count}
            <span className="text-primary">{diceType}</span>
            {roll.modifier !== 0 && (
              <span className="text-muted-foreground">
                {roll.modifier > 0 ? ` +${roll.modifier}` : ` ${roll.modifier}`}
              </span>
            )}
          </h3>
          <span className="text-sm text-muted-foreground">
            {formatTime(timestamp)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {results.map((result, index) => (
            <motion.div
              key={index}
              className={cn(
                "dice-result w-10 h-10 flex items-center justify-center rounded-md text-white font-bold shadow-md",
                diceType === 'd20' && result === 20 ? "bg-yellow-500" : 
                diceType === 'd20' && result === 1 ? "bg-red-600" : 
                "bg-primary"
              )}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: index * 0.1
              }}
            >
              {result}
            </motion.div>
          ))}
        </div>

        <motion.div 
          className={cn(
            "text-center text-3xl font-medieval",
            isCriticalSuccess ? "text-yellow-600" : 
            isCriticalFailure ? "text-red-600" : 
            "text-primary"
          )}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {formatRollResult(roll)}
        </motion.div>
        
        {roll.rollType !== "normal" && (
          <div className="text-center text-xs mt-2 text-muted-foreground">
            {roll.rollType === "advantage" ? "Con ventaja" : "Con desventaja"}
          </div>
        )}
        
        {roll.playerName && (
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Tirado por </span>
            <span className="font-medieval">{roll.playerName}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DiceResult;
