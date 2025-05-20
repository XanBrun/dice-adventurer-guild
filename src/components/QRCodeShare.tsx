
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Share2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Using a CDN-based QR code library that doesn't require installation
// This will be loaded at runtime
declare global {
  interface Window {
    QRCode: any;
  }
}

const QRCodeShare: React.FC = () => {
  const [qrGenerated, setQrGenerated] = useState(false);
  const appUrl = window.location.href;
  const qrContainerId = "qr-code-container";

  const generateQR = () => {
    // Check if the QR library script is loaded
    if (!document.getElementById('qrcode-script')) {
      const script = document.createElement('script');
      script.id = 'qrcode-script';
      script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
      script.onload = () => {
        createQRCode();
      };
      document.body.appendChild(script);
    } else {
      createQRCode();
    }
  };

  const createQRCode = () => {
    const container = document.getElementById(qrContainerId);
    if (container) {
      // Clear previous QR code if any
      container.innerHTML = '';
      
      // Generate new QR code if the library is loaded
      if (window.QRCode) {
        try {
          window.QRCode.toCanvas(
            container.appendChild(document.createElement('canvas')),
            appUrl,
            {
              width: 200,
              margin: 1,
              color: {
                dark: '#000000',
                light: '#ffffff'
              }
            },
            function(error: Error) {
              if (error) {
                console.error('Error generating QR code:', error);
                toast.error('Error al generar código QR');
              } else {
                setQrGenerated(true);
                toast.success('Código QR generado correctamente');
              }
            }
          );
        } catch (error) {
          console.error('Error creating QR code:', error);
          toast.error('Error al generar código QR');
        }
      }
    }
  };

  const downloadQR = () => {
    const canvas = document.querySelector(`#${qrContainerId} canvas`) as HTMLCanvasElement;
    if (canvas) {
      try {
        const link = document.createElement('a');
        link.download = 'dados-del-aventurero-qr.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('QR descargado correctamente');
      } catch (error) {
        console.error('Error downloading QR code:', error);
        toast.error('Error al descargar el código QR');
      }
    }
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dados del Aventurero Guild',
          text: '¡Descarga esta aplicación para tus partidas de rol!',
          url: appUrl,
        });
        toast.success('¡Compartido exitosamente!');
      } catch (error) {
        console.error('Error sharing:', error);
        toast.error('Error al compartir');
      }
    } else {
      // Fallback if Web Share API is not supported
      try {
        await navigator.clipboard.writeText(appUrl);
        toast.success('URL copiada al portapapeles');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Error al copiar URL');
      }
    }
  };

  return (
    <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-medieval flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Compartir Aplicación
        </CardTitle>
        <CardDescription>
          Genera un código QR para compartir esta aplicación con otros jugadores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div 
            id={qrContainerId} 
            className="w-52 h-52 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center p-4 bg-white"
          >
            {!qrGenerated && (
              <div className="text-center text-gray-500">
                <QrCode className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Haz clic en "Generar QR" para crear el código</p>
              </div>
            )}
          </div>

          <div className="space-y-2 w-full">
            <Button 
              onClick={generateQR} 
              className="w-full font-medieval"
              variant={qrGenerated ? "outline" : "default"}
            >
              <QrCode className="h-4 w-4 mr-2" />
              {qrGenerated ? "Regenerar QR" : "Generar QR"}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                onClick={downloadQR} 
                className="flex-1 font-medieval" 
                variant="secondary"
                disabled={!qrGenerated}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              
              <Button 
                onClick={shareApp} 
                className="flex-1 font-medieval" 
                variant="secondary"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-center text-muted-foreground">
            Este QR contiene la URL de la aplicación para compartir fácilmente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeShare;
