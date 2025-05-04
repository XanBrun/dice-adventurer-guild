
import React from "react";
import { Button } from "@/components/ui/button";
import { DiceSet, DiceType, DICE_SETS } from "@/lib/dice-utils";

interface DiceSelectorProps {
  selectedDice: DiceType;
  onChange: (diceType: DiceType) => void;
}

const DiceSelector: React.FC<DiceSelectorProps> = ({
  selectedDice,
  onChange,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {DICE_SETS.map((dice) => (
        <Button
          key={dice.type}
          onClick={() => onChange(dice.type)}
          variant={selectedDice === dice.type ? "default" : "outline"}
          className={`font-medieval relative ${
            selectedDice === dice.type ? "ring-2 ring-accent" : ""
          } h-14 w-14`}
        >
          <div className="flex flex-col items-center justify-center">
            <span className="text-lg">{dice.type}</span>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default DiceSelector;
