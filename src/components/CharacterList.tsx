import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character, loadCharacters, deleteCharacter } from "@/lib/character-utils";
import { Trash2Icon, PencilIcon, Dice1Icon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import CharacterCreation from "./CharacterCreation";

interface CharacterListProps {
  onSelectCharacter?: (character: Character) => void;
}

const CharacterList: React.FC<CharacterListProps> = ({ onSelectCharacter }) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const { toast } = useToast();

  // Cargar personajes al montar el componente
  useEffect(() => {
    loadCharactersFromStorage();
  }, []);

  // Cargar personajes desde localStorage
  const loadCharactersFromStorage = () => {
    const loadedCharacters = loadCharacters();
    setCharacters(loadedCharacters);
  };

  // Eliminar un personaje
  const handleDelete = (characterId: string) => {
    deleteCharacter(characterId);
    toast({
      title: "Personaje eliminado",
      description: "El personaje ha sido eliminado exitosamente."
    });
    loadCharactersFromStorage();
  };

  // Seleccionar un personaje
  const handleSelect = (character: Character) => {
    if (onSelectCharacter) {
      onSelectCharacter(character);
    }
  };

  // Editar un personaje
  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setIsCreating(true);
  };

  // Guardar un personaje nuevo o editado
  const handleSave = () => {
    loadCharactersFromStorage();
    setIsCreating(false);
    setEditingCharacter(null);
  };

  // Cancelar la creación o edición
  const handleCancel = () => {
    setIsCreating(false);
    setEditingCharacter(null);
  };

  // Si estamos creando o editando, mostrar el formulario
  if (isCreating) {
    return (
      <CharacterCreation
        initialCharacter={editingCharacter}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medieval">Tus Personajes</h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="font-medieval bg-accent text-black hover:bg-accent/90"
        >
          Crear Personaje
        </Button>
      </div>

      {characters.length === 0 ? (
        <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <p className="text-lg font-fantasy">
              No tienes personajes creados. ¡Crea tu primer aventurero!
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((character) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="flex justify-between items-center">
                      <span className="font-medieval">{character.name}</span>
                      <span className="text-sm font-normal bg-primary/10 px-2 py-1 rounded-full">
                        Nivel {character.level}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-3 text-sm">
                      <span className="font-bold">{character.race}</span> • {character.class}
                    </div>

                    {/* Estadísticas principales */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="flex flex-col items-center bg-secondary/30 p-2 rounded">
                        <span className="text-xs">PV</span>
                        <span className="font-bold">
                          {character.hitPoints.current}/{character.hitPoints.max}
                        </span>
                      </div>
                      <div className="flex flex-col items-center bg-secondary/30 p-2 rounded">
                        <span className="text-xs">CA</span>
                        <span className="font-bold">{character.armorClass}</span>
                      </div>
                    </div>

                    {/* Habilidades */}
                    <div className="grid grid-cols-3 gap-1 mb-3">
                      {Object.entries(character.abilities).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <div className="text-xs uppercase">{key.substring(0, 3)}</div>
                          <div className="font-bold">{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Acciones */}
                    <div className="flex justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(character)}
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-accent text-black hover:bg-accent/90"
                        onClick={() => handleSelect(character)}
                      >
                        <Dice1Icon className="h-4 w-4 mr-1" />
                        Usar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDelete(character.id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default CharacterList;
