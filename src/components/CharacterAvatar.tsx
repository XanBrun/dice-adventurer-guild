
import React, { useState, useRef } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DEFAULT_AVATARS } from '@/lib/character-utils';
import { Camera, ImageIcon } from 'lucide-react';

interface CharacterAvatarProps {
  currentAvatar?: string;
  onSelect: (avatarUrl: string) => void;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  currentAvatar = '/avatars/default.png',
  onSelect
}) => {
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSelectAvatar = (avatar: string) => {
    onSelect(avatar);
    setOpen(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      setCameraError('No se pudo acceder a la cámara. Asegúrate de conceder permisos.');
      console.error('Error accediendo a la cámara:', err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const openCamera = () => {
    setCameraOpen(true);
    startCamera();
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convertir a formato de datos URL
      const dataUrl = canvas.toDataURL('image/png');
      onSelect(dataUrl);
      
      // Cerrar cámara y diálogo
      closeCamera();
      setOpen(false);
    }
  };

  React.useEffect(() => {
    return () => {
      // Limpiar stream al desmontar
      stopCamera();
    };
  }, []);

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
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            closeCamera();
          }
        }}>
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
            {cameraOpen ? (
              <div className="flex flex-col items-center gap-4">
                {cameraError && (
                  <div className="bg-destructive/20 p-3 rounded-md text-destructive text-sm">
                    {cameraError}
                  </div>
                )}
                <div className="relative w-full max-w-sm aspect-square bg-black overflow-hidden rounded-md">
                  <video 
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={closeCamera}>
                    Cancelar
                  </Button>
                  <Button className="bg-accent text-black hover:bg-accent/90" onClick={takePhoto}>
                    Tomar foto
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Button 
                  onClick={openCamera}
                  variant="outline" 
                  className="flex items-center gap-2 mb-4"
                >
                  <Camera className="h-4 w-4" />
                  <span>Tomar foto con la cámara</span>
                </Button>
                
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
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <span className="text-sm text-gray-500 mt-1">Cambiar avatar</span>
    </div>
  );
};

export default CharacterAvatar;
