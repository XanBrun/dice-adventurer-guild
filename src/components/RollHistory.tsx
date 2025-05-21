
import React from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { RefreshCcw, Trash2 } from "lucide-react";
import { DiceRoll, CombinedDiceRoll, formatRollResult, formatCombinedRollResult } from "@/lib/dice-utils";

interface RollHistoryProps {
  rolls: Array<DiceRoll | CombinedDiceRoll>;
  onReroll?: (roll: DiceRoll | CombinedDiceRoll) => void;
  onClearHistory?: () => void;
}

const RollHistory: React.FC<RollHistoryProps> = ({
  rolls,
  onReroll,
  onClearHistory,
}) => {
  if (!rolls || rolls.length === 0) {
    return (
      <div className="text-center italic text-muted-foreground py-10">
        No hay tiradas previas
      </div>
    );
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (seconds < 60) return `Hace ${seconds} seg`;
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    return `Hace ${Math.floor(seconds / 86400)} d`;
  };

  const formatRoll = (roll: DiceRoll | CombinedDiceRoll): string => {
    if ('diceType' in roll) {
      return formatRollResult(roll);
    } else {
      return formatCombinedRollResult(roll);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-fantasy">Historial de Tiradas</h3>
        {onClearHistory && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground"
                onClick={onClearHistory}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Borrar historial</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        <div className="p-4 space-y-3">
          {rolls.map((roll, index) => {
            // Determine if this is a standard roll or combined roll
            const isStandardRoll = 'diceType' in roll;
            
            // For standard rolls
            const diceType = isStandardRoll ? (roll as DiceRoll).diceType : 'combined';
            const count = isStandardRoll ? (roll as DiceRoll).count : 'multiple';
            
            return (
              <div
                key={roll.id || index}
                className="bg-white/50 dark:bg-black/10 rounded-md p-2 text-sm hover:bg-accent/5 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{roll.playerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimeAgo(new Date(roll.timestamp))}
                    </div>
                  </div>
                  {onReroll && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onReroll(roll)}
                        >
                          <RefreshCcw className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Repetir tirada</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="mt-1">
                  {formatRoll(roll)}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RollHistory;
