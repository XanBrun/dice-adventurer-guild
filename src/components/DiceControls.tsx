
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { RollType } from "@/lib/dice-utils";
import { MinusIcon, PlusIcon } from "lucide-react";

interface DiceControlsProps {
  count: number;
  setCount: (count: number) => void;
  modifier: number;
  setModifier: (modifier: number) => void;
  rollType: RollType;
  setRollType: (rollType: RollType) => void;
  playerName: string;
  setPlayerName: (name: string) => void;
  onRoll: () => void;
}

const DiceControls: React.FC<DiceControlsProps> = ({
  count,
  setCount,
  modifier,
  setModifier,
  rollType,
  setRollType,
  playerName,
  setPlayerName,
  onRoll,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 w-full items-center">
        <div className="flex flex-1 flex-col space-y-1">
          <label className="text-sm font-medieval">Player Name</label>
          <Input
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your character name"
            className="font-fantasy"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full items-center">
        <div className="flex flex-col space-y-1 w-full md:w-auto">
          <label className="text-sm font-medieval">Dice Count</label>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCount(Math.max(1, count - 1))}
              disabled={count <= 1}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            <div className="w-10 text-center font-bold">{count}</div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCount(Math.min(10, count + 1))}
              disabled={count >= 10}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-1 w-full md:w-auto">
          <label className="text-sm font-medieval">Modifier</label>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setModifier(modifier - 1)}
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            <div className="w-10 text-center font-bold">
              {modifier >= 0 ? `+${modifier}` : modifier}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setModifier(modifier + 1)}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-1 w-full md:w-auto">
          <label className="text-sm font-medieval">Roll Type</label>
          <div className="flex items-center space-x-2">
            <Toggle
              pressed={rollType === "advantage"}
              onPressedChange={() =>
                setRollType(rollType === "advantage" ? "normal" : "advantage")
              }
              className={`${rollType === "advantage" ? "bg-emerald-green text-white" : ""}`}
            >
              Advantage
            </Toggle>
            <Toggle
              pressed={rollType === "disadvantage"}
              onPressedChange={() =>
                setRollType(
                  rollType === "disadvantage" ? "normal" : "disadvantage"
                )
              }
              className={`${rollType === "disadvantage" ? "bg-dragon-red text-white" : ""}`}
            >
              Disadvantage
            </Toggle>
          </div>
        </div>
      </div>

      <Button onClick={onRoll} className="w-full font-medieval bg-accent text-black hover:bg-accent/90 text-lg">
        Roll the Dice!
      </Button>
    </div>
  );
};

export default DiceControls;
