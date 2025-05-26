
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  STANDARD_ACTIONS,
  BONUS_ACTIONS,
  REACTIONS,
  CONDITIONS,
  COVER_RULES,
  CRITICAL_HIT_RULES,
  INITIATIVE_VARIANTS
} from "@/lib/combat-utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sword } from "lucide-react";

const CombatRules: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("actions");

  return (
    <Card className="border-2 border-accent bg-white/70 dark:bg-black/20 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-medieval flex items-center gap-2">
          <Sword className="h-6 w-6" />
          Reglas de Combate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="actions" className="text-xs sm:text-sm font-medieval">Acciones</TabsTrigger>
            <TabsTrigger value="conditions" className="text-xs sm:text-sm font-medieval">Condiciones</TabsTrigger>
            <TabsTrigger value="cover" className="text-xs sm:text-sm font-medieval">Cobertura</TabsTrigger>
            <TabsTrigger value="critical" className="text-xs sm:text-sm font-medieval">Críticos</TabsTrigger>
          </TabsList>

          <TabsContent value="actions">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medieval mb-2">Acciones Estándar</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {STANDARD_ACTIONS.map((action, index) => (
                      <AccordionItem value={`action-${index}`} key={`action-${index}`}>
                        <AccordionTrigger className="font-medieval">
                          <div className="flex items-center">
                            <span>{action.name}</span>
                            <Badge variant="outline" className="ml-2">Acción</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{action.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medieval mb-2">Acciones Adicionales</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {BONUS_ACTIONS.map((action, index) => (
                      <AccordionItem value={`bonus-${index}`} key={`bonus-${index}`}>
                        <AccordionTrigger className="font-medieval">
                          <div className="flex items-center">
                            <span>{action.name}</span>
                            <Badge variant="outline" className="ml-2 bg-amber-100 dark:bg-amber-950">Adicional</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{action.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medieval mb-2">Reacciones</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {REACTIONS.map((action, index) => (
                      <AccordionItem value={`reaction-${index}`} key={`reaction-${index}`}>
                        <AccordionTrigger className="font-medieval">
                          <div className="flex items-center">
                            <span>{action.name}</span>
                            <Badge variant="outline" className="ml-2 bg-blue-100 dark:bg-blue-950">Reacción</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">{action.description}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="conditions">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  {CONDITIONS.map((condition, index) => (
                    <AccordionItem value={`condition-${index}`} key={`condition-${index}`}>
                      <AccordionTrigger className="font-medieval">
                        {condition.name}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground mb-2">{condition.description}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="cover">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {COVER_RULES.map((rule, index) => (
                  <div key={`cover-${index}`} className="border rounded-lg p-4">
                    <h3 className="font-medieval text-lg mb-2">{rule.name}</h3>
                    <p className="text-muted-foreground">{rule.description}</p>
                  </div>
                ))}

                <Separator />

                <div>
                  <h3 className="text-lg font-medieval mb-2">Variantes de Iniciativa</h3>
                  <div className="grid gap-4">
                    {INITIATIVE_VARIANTS.map((variant, index) => (
                      <div key={`initiative-${index}`} className="border rounded-lg p-4">
                        <h4 className="font-medieval mb-1">{variant.name}</h4>
                        <p className="text-muted-foreground text-sm">{variant.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="critical">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medieval text-lg mb-2">Golpe Crítico</h3>
                  <p className="text-muted-foreground">{CRITICAL_HIT_RULES.description}</p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CombatRules;
