
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";
import QRCode from "qrcode";

const QRCodeShare: React.FC = () => {
  const [url, setUrl] = useState<string>(window.location.href);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [url]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;
    
    try {
      // Generate QR code directly on the canvas
      await QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      // Then get the data URL from the canvas
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setQrCodeUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = "rolmaster-qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-medieval flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Compartir en Android
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="mb-4 w-full">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mb-2"
            placeholder="URL a compartir"
          />
          <p className="text-sm text-muted-foreground mb-4">
            Escanea este código QR con la cámara de otro dispositivo para abrir esta aplicación
          </p>
        </div>
        
        <div className="flex flex-col items-center">
          <canvas 
            ref={canvasRef} 
            className="border border-gray-200 rounded-md mb-4"
            width="200"
            height="200"
          />
          
          <Button onClick={downloadQRCode} className="flex items-center gap-2 w-full">
            <Download className="h-4 w-4" />
            Descargar código QR
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeShare;
