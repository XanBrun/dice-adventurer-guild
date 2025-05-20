
import React from "react";
import { DiceRoll, formatRollResult } from "@/lib/dice-utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2Icon, VolumeIcon, Volume2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRollSounds } from "@/hooks/useRollSounds";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { playSoundForRoll, isSoundEnabled, toggleSound } = useRollSounds();
  
  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medieval">Historial</h3>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSound}
                  className="text-primary hover:text-primary/80"
                >
                  {isSoundEnabled ? (
                    <Volume2Icon className="h-4 w-4" />
                  ) : (
                    <VolumeIcon className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isSoundEnabled ? "Desactivar sonidos" : "Activar sonidos"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {rolls.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2Icon className="h-4 w-4 mr-2" /> Limpiar
            </Button>
          )}
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden bg-white/70 dark:bg-black/20 backdrop-blur-sm">
        <ScrollArea className="h-48 p-4">
          {rolls.length === 0 ? (
            <p className="text-center italic text-muted-foreground">¡Tira los dados para empezar!</p>
          ) : (
            <ul className="space-y-2">
              {rolls.map((roll) => {
                const isCritical = roll.diceType === 'd20' && roll.count === 1 && roll.results[0] === 20;
                const isFail = roll.diceType === 'd20' && roll.count === 1 && roll.results[0] === 1;
                
                return (
                  <li 
                    key={roll.id} 
                    className={cn(
                      "p-2 rounded flex justify-between items-center bg-white/60 dark:bg-black/20 transition-colors",
                      isCritical ? "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300" : 
                      isFail ? "bg-red-100 dark:bg-red-900/30 border border-red-300" : 
                      ""
                    )}
                  >
                    <span className={cn(
                      "font-fantasy",
                      isCritical ? "text-yellow-700 dark:text-yellow-400" : 
                      isFail ? "text-red-700 dark:text-red-400" : 
                      ""
                    )}>
                      {formatRollResult(roll)}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        onClick={() => playSoundForRoll(roll)}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-8 w-8"
                      >
                        <Volume2Icon className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => onReroll(roll)}
                        variant="outline"
                        size="sm"
                      >
                        Repetir
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default RollHistory;
