
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MinusIcon, PlusIcon, Dices } from "lucide-react";
import { DiceType, DICE_SETS, DiceCombination } from "@/lib/dice-utils";

interface MultiDiceSelectorProps {
  selectedDiceCombination: DiceCombination[];
  onChange: (combination: DiceCombination[]) => void;
}

const MultiDiceSelector: React.FC<MultiDiceSelectorProps> = ({
  selectedDiceCombination,
  onChange
}) => {
  const updateDiceCount = (diceType: DiceType, increment: boolean) => {
    const newCombination = [...selectedDiceCombination];
    const existingIndex = newCombination.findIndex(d => d.diceType === diceType);
    
    if (existingIndex >= 0) {
      // Update existing dice count
      const newCount = increment 
        ? Math.min(newCombination[existingIndex].count + 1, 10) 
        : Math.max(newCombination[existingIndex].count - 1, 0);
      
      if (newCount === 0) {
        // Remove if count is 0
        newCombination.splice(existingIndex, 1);
      } else {
        newCombination[existingIndex].count = newCount;
      }
    } else if (increment) {
      // Add new dice type
      newCombination.push({ diceType, count: 1 });
    }
    
    onChange(newCombination);
  };
  
  const getDiceCount = (diceType: DiceType): number => {
    const diceItem = selectedDiceCombination.find(d => d.diceType === diceType);
    return diceItem?.count || 0;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medieval text-center">Combine Different Dice</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {DICE_SETS.map((dice) => (
          <div 
            key={dice.type} 
            className={`p-2 border rounded-md flex flex-col items-center ${
              getDiceCount(dice.type as DiceType) > 0 ? 'border-accent bg-accent/10' : 'border-gray-300'
            }`}
          >
            <div className="text-lg font-bold">{dice.type}</div>
            
            <div className="flex items-center justify-between w-full mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => updateDiceCount(dice.type as DiceType, false)}
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              
              <span className="font-bold text-lg">{getDiceCount(dice.type as DiceType)}</span>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => updateDiceCount(dice.type as DiceType, true)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {selectedDiceCombination.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medieval text-sm mb-2">Selected Dice:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedDiceCombination.map((dice, index) => (
              <Badge key={index} variant="secondary">
                {dice.count}x {dice.diceType}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiDiceSelector;
