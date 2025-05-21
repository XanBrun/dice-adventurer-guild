
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Campaign, PREDEFINED_CAMPAIGNS } from "@/lib/campaign-utils";
import { ChevronRight, MapIcon, Shield, Scroll, Home, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { useRollSounds } from "@/hooks/useRollSounds";

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const navigate = useNavigate();
  const { playSound } = useRollSounds();
  
  const handleLaunchCampaign = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('d20');
    toast.success(`¡Campaña "${campaign.name}" iniciada!`, {
      description: "Prepárate para la aventura"
    });
    
    // Navigate to campaign detail after a short delay for a better UX
    setTimeout(() => {
      navigate(`/campaigns/${campaign.id}`);
    }, 500);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border-2 border-accent overflow-hidden bg-white/70 dark:bg-black/20 backdrop-blur-sm hover:border-primary transition-all">
        <div 
          className="h-36 bg-center bg-cover" 
          style={{ 
            backgroundImage: `url(${campaign.thumbnail})`,
            backgroundPosition: 'center'
          }}
        />
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-medieval">{campaign.name}</CardTitle>
            <Badge variant={
              campaign.difficulty === 'easy' ? 'outline' : 
              campaign.difficulty === 'medium' ? 'secondary' : 
              'destructive'
            }>
              {campaign.difficulty === 'easy' ? 'Fácil' : 
               campaign.difficulty === 'medium' ? 'Medio' : 'Difícil'}
            </Badge>
          </div>
          <CardDescription className="mt-2">
            {campaign.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4" />
              <span>Nivel {campaign.minLevel}-{campaign.maxLevel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Scroll className="h-4 w-4" />
              <span>{campaign.adventures.length} aventuras</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            onClick={handleLaunchCampaign} 
            className="flex-1"
            variant="default"
          >
            <Play className="h-4 w-4 mr-1" />
            Iniciar
          </Button>
          <Button 
            onClick={() => navigate(`/campaigns/${campaign.id}`)} 
            variant="outline"
            className="flex-1"
          >
            Detalles <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const Campaigns = () => {
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const navigate = useNavigate();
  
  const filteredCampaigns = difficultyFilter === "all" 
    ? PREDEFINED_CAMPAIGNS 
    : PREDEFINED_CAMPAIGNS.filter(campaign => campaign.difficulty === difficultyFilter);
  
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex flex-col items-center justify-between gap-4"
        >
          <div className="w-full flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home className="h-4 w-4" /> Volver al inicio
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <MapIcon className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-medieval text-center text-primary">
              Campañas y Aventuras
            </h1>
          </div>
          <p className="text-center text-muted-foreground max-w-2xl">
            Explora mundos épicos, vence a poderosos enemigos y encuentra tesoros legendarios
            en estas campañas predefinidas para tus partidas de rol.
          </p>
        </motion.div>
        
        <Tabs defaultValue="all" onValueChange={setDifficultyFilter}>
          <div className="flex justify-center mb-6">
            <TabsList className="font-medieval">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="easy">Fácil</TabsTrigger>
              <TabsTrigger value="medium">Medio</TabsTrigger>
              <TabsTrigger value="hard">Difícil</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value={difficultyFilter} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map(campaign => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No hay campañas disponibles con este filtro.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Campaigns;
