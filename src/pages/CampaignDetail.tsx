
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Campaign, Adventure, getCampaignById } from "@/lib/campaign-utils";
import { ArrowLeft, CheckCircle, Sword, Trophy, Target, MapPin, Home, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRollSounds } from "@/hooks/useRollSounds";
import { toast } from "@/components/ui/sonner";

const CampaignDetail = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [selectedAdventureId, setSelectedAdventureId] = useState<string | null>(null);
  const { playSound } = useRollSounds();

  useEffect(() => {
    if (campaignId) {
      const foundCampaign = getCampaignById(campaignId);
      if (foundCampaign) {
        setCampaign(foundCampaign);
        if (foundCampaign.adventures.length > 0) {
          setSelectedAdventureId(foundCampaign.adventures[0].id);
        }
      }
    }
  }, [campaignId]);

  const selectedAdventure = campaign?.adventures.find(
    adventure => adventure.id === selectedAdventureId
  );
  
  const handleStartCampaign = () => {
    playSound('d20');
    toast.success(`¡Campaña "${campaign?.name}" iniciada!`, {
      description: "¡Que comience la aventura!"
    });
  };

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Campaña no encontrada</CardTitle>
            <CardDescription>
              La campaña que buscas no existe o ha sido eliminada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/campaigns')}>
              Volver a campañas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/campaigns')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Volver a campañas
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Home className="h-4 w-4" /> Volver al inicio
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-medieval text-primary">
                {campaign.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {campaign.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                campaign.difficulty === 'easy' ? 'outline' : 
                campaign.difficulty === 'medium' ? 'secondary' : 
                'destructive'
              } className="text-sm">
                Dificultad: {campaign.difficulty === 'easy' ? 'Fácil' : 
                             campaign.difficulty === 'medium' ? 'Media' : 'Difícil'}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Nivel {campaign.minLevel}-{campaign.maxLevel}
              </Badge>
            </div>
          </div>
          
          <div className="flex justify-end mb-6">
            <div className="flex gap-3">
              <Button
                onClick={handleStartCampaign}
                size="sm"
                variant="default"
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" /> Iniciar campaña
              </Button>
              
              <Button
                onClick={() => navigate(`/campaigns/${campaign.id}/maps`)}
                size="sm"
                variant="outline"
              >
                <MapPin className="h-4 w-4 mr-2" /> Ver mapas
              </Button>
            </div>
          </div>
          
          <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-medieval">Aventuras</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={selectedAdventureId || ''} 
                onValueChange={setSelectedAdventureId}
                className="w-full"
              >
                <TabsList className="w-full mb-4 overflow-auto">
                  {campaign.adventures.map((adventure) => (
                    <TabsTrigger 
                      key={adventure.id} 
                      value={adventure.id}
                      className="font-medieval"
                    >
                      {adventure.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {campaign.adventures.map((adventure) => (
                  <TabsContent 
                    key={adventure.id} 
                    value={adventure.id}
                    className="border rounded-md p-4"
                  >
                    <AdventureDetail adventure={adventure} />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const AdventureDetail = ({ adventure }: { adventure: Adventure }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medieval mb-2">{adventure.name}</h3>
        <p className="text-muted-foreground">{adventure.description}</p>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="flex items-center font-medieval text-primary mb-2">
          <Target className="h-4 w-4 mr-2" /> Objetivos
        </h4>
        <ul className="space-y-1">
          {adventure.objectives.map((objective, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-4 w-4 mr-2 mt-1 text-primary" />
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="flex items-center font-medieval text-primary mb-2">
          <Sword className="h-4 w-4 mr-2" /> Encuentros
        </h4>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {adventure.encounters.map((encounter) => (
            <Card key={encounter.id} className="overflow-hidden">
              <CardHeader className="bg-secondary/40 py-2">
                <CardTitle className="text-sm font-medieval">{encounter.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-3 text-sm">
                <ScrollArea className="h-20">
                  <p>{encounter.description}</p>
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h4 className="flex items-center font-medieval text-primary mb-2">
          <Trophy className="h-4 w-4 mr-2" /> Recompensas
        </h4>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {adventure.rewards.map((reward, index) => (
            <div key={index} className="flex items-start bg-white/50 dark:bg-black/20 p-3 rounded-md">
              <div>
                <p className="font-medieval">{reward.name}</p>
                <p className="text-sm text-muted-foreground">{reward.description}</p>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="text-xs">
                    {reward.type === 'gold' ? 'Oro' : 
                     reward.type === 'xp' ? 'Experiencia' : 
                     reward.type === 'item' ? 'Objeto' : 'Habilidad'}
                  </Badge>
                  {reward.value > 0 && (
                    <span className="text-xs ml-2 font-medieval">
                      {reward.value} {reward.type === 'gold' ? 'monedas' : 
                                    reward.type === 'xp' ? 'XP' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
