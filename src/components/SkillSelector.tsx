
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { 
  SKILL_NAMES_SPANISH, 
  SKILL_ABILITY_MAP, 
  ABILITY_NAMES_SPANISH,
  calculateSkillValue,
  Character
} from '@/lib/character-utils';

interface SkillSelectorProps {
  character: Character;
  onChange: (skillName: string, isChecked: boolean) => void;
  className?: string;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({
  character,
  onChange,
  className = ""
}) => {
  // Agrupar habilidades por atributo
  const skillsByAbility: Record<string, string[]> = {};
  
  Object.entries(SKILL_ABILITY_MAP).forEach(([skill, ability]) => {
    if (!skillsByAbility[ability]) {
      skillsByAbility[ability] = [];
    }
    skillsByAbility[ability].push(skill);
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medieval">Habilidades</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        {Object.entries(skillsByAbility).map(([ability, skills]) => (
          <div key={ability} className="mb-4">
            <h4 className="font-medieval text-sm text-primary mb-1">
              {ABILITY_NAMES_SPANISH[ability as keyof typeof ABILITY_NAMES_SPANISH]}
            </h4>
            {skills.map((skillName) => {
              const isChecked = character.skills[skillName] || false;
              const skillValue = calculateSkillValue(character, skillName);
              const modifier = skillValue >= 0 ? `+${skillValue}` : skillValue;
              
              return (
                <div key={skillName} className="flex items-center space-x-2 my-1">
                  <Checkbox
                    id={`skill-${skillName}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      onChange(skillName, checked === true);
                    }}
                  />
                  <label
                    htmlFor={`skill-${skillName}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between w-full"
                  >
                    <span>
                      {SKILL_NAMES_SPANISH[skillName as keyof typeof SKILL_NAMES_SPANISH]}
                    </span>
                    <span className={isChecked ? "font-bold text-primary" : ""}>
                      {modifier}
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillSelector;
