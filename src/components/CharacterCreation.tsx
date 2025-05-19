
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Character,
  CHARACTER_RACES,
  CHARACTER_CLASSES,
  ABILITY_NAMES,
  createDefaultCharacter,
  calculateModifier,
  saveCharacter,
  getDefaultAvatarByClass
} from "@/lib/character-utils";
import CharacterAvatar from "./CharacterAvatar";
import SkillSelector from "./SkillSelector";

interface CharacterCreationProps {
  onSave?: (character: Character) => void;
  onCancel?: () => void;
  initialCharacter?: Character | null;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onSave,
  onCancel,
  initialCharacter = null,
}) => {
  const [character, setCharacter] = useState<Character>(
    initialCharacter || createDefaultCharacter()
  );
  const { toast } = useToast();
  const [availablePoints, setAvailablePoints] = useState(27); // Sistema de puntos para habilidades
  const [initialTotal, setInitialTotal] = useState(0);
  const [activeTab, setActiveTab] = useState("basics");

  // Calcular puntos iniciales si estamos editando
  useEffect(() => {
    if (initialCharacter) {
      const totalPoints = Object.values(initialCharacter.abilities).reduce(
        (sum, value) => sum + getPointCost(value),
        0
      );
      setInitialTotal(totalPoints);
    } else {
      setInitialTotal(0);
    }
  }, [initialCharacter]);

  // Función para calcular el costo de puntos por valor de habilidad
  const getPointCost = (value: number): number => {
    if (value <= 13) return value - 8;
    if (value === 14) return 7;
    if (value === 15) return 9;
    return 0; // No debería alcanzarse
  };

  // Actualizar un campo básico del personaje
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Character
  ) => {
    setCharacter({ ...character, [field]: e.target.value });
  };

  // Actualizar raza o clase
  const handleSelectChange = (value: string, field: 'race' | 'class') => {
    // Si cambia la clase, también actualizar el avatar predeterminado
    if (field === 'class') {
      setCharacter({ 
        ...character, 
        [field]: value,
        avatarUrl: getDefaultAvatarByClass(value)
      });
    } else {
      setCharacter({ ...character, [field]: value });
    }
  };

  // Actualizar puntuación de habilidad
  const handleAbilityChange = (ability: string, newValue: number) => {
    const oldValue = character.abilities[ability as keyof typeof character.abilities];
    const oldCost = getPointCost(oldValue);
    const newCost = getPointCost(newValue);
    const costDiff = newCost - oldCost;

    // Verificar si hay puntos suficientes
    if (initialCharacter || availablePoints >= costDiff) {
      // Actualizar la habilidad y su modificador
      const updatedAbilities = {
        ...character.abilities,
        [ability]: newValue
      };

      const updatedModifiers = {
        ...character.modifiers
      };
      
      updatedModifiers[ability as keyof typeof updatedModifiers] = calculateModifier(newValue);

      // Si hay un cambio en destreza, actualizar iniciativa
      let updatedInitiative = character.initiative;
      if (ability === 'dexterity') {
        updatedInitiative = calculateModifier(newValue);
      }

      setCharacter({
        ...character,
        abilities: updatedAbilities,
        modifiers: updatedModifiers,
        initiative: updatedInitiative
      });

      // Actualizar puntos disponibles si no estamos editando
      if (!initialCharacter) {
        setAvailablePoints(availablePoints - costDiff);
      }
    }
  };

  // Manejar cambio de avatar
  const handleAvatarChange = (avatarUrl: string) => {
    setCharacter({ ...character, avatarUrl });
  };

  // Manejar cambio de habilidades proficientes
  const handleSkillChange = (skillName: string, isChecked: boolean) => {
    setCharacter({
      ...character,
      skills: {
        ...character.skills,
        [skillName]: isChecked
      }
    });
  };

  const handleSave = () => {
    try {
      // Actualizar fecha de modificación
      const updatedCharacter = {
        ...character,
        updatedAt: new Date()
      };

      // Guardar en localStorage
      saveCharacter(updatedCharacter);
      
      toast({
        title: "Personaje guardado",
        description: `${character.name} ha sido guardado exitosamente.`
      });

      // Llamar al callback si existe
      if (onSave) {
        onSave(updatedCharacter);
      }
    } catch (error) {
      console.error("Error al guardar el personaje:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el personaje."
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-4xl mx-auto border-2 border-accent bg-white/90 dark:bg-black/20 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl font-medieval text-center">
            {initialCharacter ? "Editar Personaje" : "Crear Personaje"}
          </CardTitle>
          <CharacterAvatar 
            currentAvatar={character.avatarUrl}
            onSelect={handleAvatarChange}
          />
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="basics" className="font-medieval">Básico</TabsTrigger>
              <TabsTrigger value="abilities" className="font-medieval">Atributos</TabsTrigger>
              <TabsTrigger value="skills" className="font-medieval">Habilidades</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basics" className="space-y-4">
              {/* Nombre y nivel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={character.name}
                    onChange={(e) => handleChange(e, "name")}
                    placeholder="Nombre del personaje"
                    className="font-fantasy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Nivel</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="20"
                    value={character.level}
                    onChange={(e) => 
                      setCharacter({
                        ...character,
                        level: parseInt(e.target.value) || 1,
                        proficiencyBonus: Math.ceil((parseInt(e.target.value) || 1) / 4) + 1
                      })
                    }
                    className="font-fantasy"
                  />
                </div>
              </div>

              {/* Raza y clase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Raza</Label>
                  <Select 
                    value={character.race} 
                    onValueChange={(value) => handleSelectChange(value, 'race')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una raza" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHARACTER_RACES.map((race) => (
                        <SelectItem key={race} value={race}>
                          {race}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Clase</Label>
                  <Select 
                    value={character.class} 
                    onValueChange={(value) => handleSelectChange(value, 'class')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una clase" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHARACTER_CLASSES.map((charClass) => (
                        <SelectItem key={charClass} value={charClass}>
                          {charClass}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Puntos de vida y CA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hitPoints">Puntos de vida</Label>
                  <div className="flex gap-2">
                    <Input
                      id="currentHP"
                      type="number"
                      value={character.hitPoints.current}
                      onChange={(e) => 
                        setCharacter({
                          ...character,
                          hitPoints: {
                            ...character.hitPoints,
                            current: parseInt(e.target.value) || 0
                          }
                        })
                      }
                      className="font-fantasy w-1/2"
                      placeholder="Actual"
                    />
                    <span className="flex items-center">/</span>
                    <Input
                      id="maxHP"
                      type="number"
                      value={character.hitPoints.max}
                      onChange={(e) => 
                        setCharacter({
                          ...character,
                          hitPoints: {
                            ...character.hitPoints,
                            max: parseInt(e.target.value) || 0,
                            current: Math.min(character.hitPoints.current, parseInt(e.target.value) || 0)
                          }
                        })
                      }
                      className="font-fantasy w-1/2"
                      placeholder="Máximo"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="armorClass">Clase de Armadura</Label>
                  <Input
                    id="armorClass"
                    type="number"
                    min="0"
                    value={character.armorClass}
                    onChange={(e) => 
                      setCharacter({
                        ...character,
                        armorClass: parseInt(e.target.value) || 10
                      })
                    }
                    className="font-fantasy"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="abilities">
              {/* Puntos disponibles */}
              {!initialCharacter && (
                <div className="bg-secondary/40 p-3 rounded-md text-center mb-6">
                  <span className="font-medieval">Puntos disponibles: </span>
                  <span className="font-bold">{availablePoints}</span>
                </div>
              )}

              {/* Habilidades */}
              <div className="space-y-4">
                <h3 className="font-medieval text-lg">Atributos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {ABILITY_NAMES.map((ability) => {
                    const abilityKey = ability as keyof typeof character.abilities;
                    const modifierKey = ability as keyof typeof character.modifiers;
                    const value = character.abilities[abilityKey];
                    const modifier = character.modifiers[modifierKey];
                    const modifierText = modifier >= 0 ? `+${modifier}` : modifier;
                    
                    return (
                      <div key={ability} className="bg-white/40 dark:bg-black/40 p-3 rounded-md shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor={ability} className="capitalize font-bold">
                            {ability}
                          </Label>
                          <div className="text-lg font-medieval">
                            {value} <span className="text-primary">({modifierText})</span>
                          </div>
                        </div>
                        <Slider
                          id={ability}
                          min={8}
                          max={15}
                          step={1}
                          value={[value]}
                          onValueChange={(values) => handleAbilityChange(ability, values[0])}
                          className="my-2"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="skills">
              <SkillSelector 
                character={character}
                onChange={handleSkillChange}
              />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="font-medieval bg-accent text-black hover:bg-accent/90"
          >
            Guardar Personaje
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CharacterCreation;
