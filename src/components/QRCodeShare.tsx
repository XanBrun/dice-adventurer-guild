import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Share2, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import QRCode from "qrcode";
import { motion, AnimatePresence } from "framer-motion";

const QRCodeShare: React.FC = () => {
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const appUrl = window.location.href;

  const generateQR = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const qrCode = await QRCode.toDataURL(appUrl, {
        type: 'image/png',
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H',
        quality: 0.92
      });

      setQrDataUrl(qrCode);
      setQrGenerated(true);
      toast.success('Código QR generado correctamente');
    } catch (error) {
      console.error('Error generating QR code:', error);
      setError('Error al generar el código QR');
      toast.error('Error al generar código QR');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQR();
  }, []);

  const downloadQR = () => {
    if (!qrDataUrl) return;

    try {
      const link = document.createElement('a');
      link.download = 'dados-del-aventurero-qr.png';
      link.href = qrDataUrl;
      link.click();
      toast.success('QR descargado correctamente');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Error al descargar el código QR');
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
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Error al compartir');
        }
      }
    } else {
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
          <div className="relative w-52 h-52">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg"
                >
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/10 rounded-lg p-4"
                >
                  <p className="text-center text-sm text-destructive mb-2">{error}</p>
                  <Button variant="destructive" size="sm" onClick={generateQR}>
                    Reintentar
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center p-4 bg-white"
                >
                  {qrDataUrl ? (
                    <motion.img
                      src={qrDataUrl}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <QrCode className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Generando código QR...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2 w-full">
            <Button 
              onClick={generateQR} 
              className="w-full font-medieval"
              variant={qrGenerated ? "outline" : "default"}
              disabled={isGenerating}
            >
              <QrCode className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generando...' : qrGenerated ? 'Regenerar QR' : 'Generar QR'}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                onClick={downloadQR} 
                className="flex-1 font-medieval" 
                variant="secondary"
                disabled={!qrGenerated || isGenerating}
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
              
              <Button 
                onClick={shareApp} 
                className="flex-1 font-medieval" 
                variant="secondary"
                disabled={isGenerating}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
          
          <p className="text-sm text-center text-muted-foreground">
            Este QR contiene la URL de la aplicación para compartir fácilmente
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeShare;