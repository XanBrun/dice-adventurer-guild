
import React from "react";
import { Button } from "@/components/ui/button";
import { DiceSet, DiceType, DICE_SETS } from "@/lib/dice-utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DiceSelectorProps {
  selectedDice: DiceType;
  onChange: (diceType: DiceType) => void;
}

const DiceSelector: React.FC<DiceSelectorProps> = ({
  selectedDice,
  onChange,
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
      {DICE_SETS.map((dice) => (
        <Button
          key={dice.type}
          onClick={() => onChange(dice.type)}
          variant={selectedDice === dice.type ? "default" : "outline"}
          className={`font-medieval relative ${
            selectedDice === dice.type ? "ring-2 ring-accent" : ""
          } h-10 w-10 xs:h-12 xs:w-12 sm:h-14 sm:w-14 text-xs sm:text-sm md:text-base`}
        >
          <div className="flex flex-col items-center justify-center">
            <span className="text-sm sm:text-lg">{dice.type}</span>
          </div>
        </Button>
      ))}
    </div>
  );
};

export default DiceSelector;
