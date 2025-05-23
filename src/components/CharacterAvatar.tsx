
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DEFAULT_AVATARS } from '@/lib/character-utils';

interface CharacterAvatarProps {
  currentAvatar?: string;
  onSelect: (avatarUrl: string) => void;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  currentAvatar = '/avatars/default.png',
  onSelect
}) => {
  const [open, setOpen] = useState(false);

  const handleSelectAvatar = (avatar: string) => {
    onSelect(avatar);
    setOpen(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <img 
          src={currentAvatar} 
          alt="Avatar del personaje" 
          className="w-24 h-24 rounded-full object-cover border-2 border-accent"
          onError={(e) => {
            // Si la imagen no carga, usar la imagen predeterminada
            const target = e.target as HTMLImageElement;
            target.src = '/avatars/default.png';
          }}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
            >
              +
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Elige un avatar</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 py-4">
              {DEFAULT_AVATARS.map((avatar, index) => (
                <div 
                  key={index}
                  className={`relative cursor-pointer transition-all hover:scale-105 ${
                    avatar === currentAvatar ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectAvatar(avatar)}
                >
                  <img 
                    src={avatar} 
                    alt={`Avatar ${index + 1}`}
                    className="w-full aspect-square rounded-md object-cover"
                    onError={(e) => {
                      // Si la imagen no carga, usar la imagen predeterminada
                      const target = e.target as HTMLImageElement;
                      target.src = '/avatars/default.png';
                    }}
                  />
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <span className="text-sm text-gray-500 mt-1">Cambiar avatar</span>
    </div>
  );
};

export default CharacterAvatar;
