
import React from "react";
import { DiceRoll, formatRollResult } from "@/lib/dice-utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2Icon } from "lucide-react";

interface RollHistoryProps {
  rolls: DiceRoll[];
  onReroll: (roll: DiceRoll) => void;
  onClearHistory: () => void;
}

const RollHistory: React.FC<RollHistoryProps> = ({
  rolls,
  onReroll,
  onClearHistory,
}) => {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medieval">Roll History</h3>
        {rolls.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearHistory}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2Icon className="h-4 w-4 mr-2" /> Clear
          </Button>
        )}
      </div>
      
      <div className="border rounded-md overflow-hidden bg-white/70 dark:bg-black/20 backdrop-blur-sm">
        <ScrollArea className="h-48 p-4">
          {rolls.length === 0 ? (
            <p className="text-center italic text-muted-foreground">No rolls yet. Roll the dice!</p>
          ) : (
            <ul className="space-y-2">
              {rolls.map((roll) => (
                <li key={roll.id} className="p-2 rounded flex justify-between items-center bg-white/60 dark:bg-black/20">
                  <span className="font-fantasy">{formatRollResult(roll)}</span>
                  <Button
                    onClick={() => onReroll(roll)}
                    variant="outline"
                    size="sm"
                    className="ml-2"
                  >
                    Re-roll
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default RollHistory;
