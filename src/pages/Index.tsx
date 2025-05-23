
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/sonner"
import { useToast } from "@/components/ui/use-toast"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, NavigationMenuViewport } from "@/components/ui/navigation-menu"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CharacterAvatar from "@/components/CharacterAvatar";
import { bluetoothManager } from "@/lib/bluetooth-utils";
import { loadCharacters, saveCharacter } from "@/lib/character-utils";
import { Character } from "@/lib/character-utils";

const Index = () => {
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isBluetoothAvailable, setIsBluetoothAvailable] = useState(bluetoothManager.isAvailable);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(bluetoothManager.isConnected);
  const [bluetoothRole, setBluetoothRole] = useState(bluetoothManager.role);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const storedCharacters = loadCharacters();
    if (storedCharacters.length > 0) {
      setCharacter(storedCharacters[0]);
    }

    const handleBluetoothStateChange = () => {
      setIsBluetoothAvailable(bluetoothManager.isAvailable);
      setIsBluetoothConnected(bluetoothManager.isConnected);
      setBluetoothRole(bluetoothManager.role);
    };

    const handleSearchingStateChange = (searching: boolean) => {
      setIsSearching(searching);
    };

    bluetoothManager.setOnConnectionChangeCallback(handleBluetoothStateChange);
    bluetoothManager.setOnSearchingCallback(handleSearchingStateChange);

    return () => {
      bluetoothManager.setOnConnectionChangeCallback(null);
      bluetoothManager.setOnSearchingCallback(null);
    };
  }, []);

  const handleAvatarSelect = (avatarUrl: string) => {
    if (character) {
      const updatedCharacter = { ...character, avatarUrl };
      setCharacter(updatedCharacter);
      saveCharacter(updatedCharacter);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (character) {
      const updatedCharacter = { ...character, [name]: value };
      setCharacter(updatedCharacter);
      saveCharacter(updatedCharacter);
    }
  };

  const handleStartNarrator = async () => {
    await bluetoothManager.startAsNarrator();
  };

  const handleConnectPlayer = async () => {
    await bluetoothManager.connectAsPlayer();
  };

  const handleDisconnect = () => {
    bluetoothManager.disconnect();
  };

  const CombinedRollSchema = z.object({
    attackRoll: z.number(),
    defenseRoll: z.number(),
    damageRoll: z.number(),
  });

  type CombinedRollResult = z.infer<typeof CombinedRollSchema>;

  const form = useForm<CombinedRollResult>({
    resolver: zodResolver(CombinedRollSchema),
    defaultValues: {
      attackRoll: 0,
      defenseRoll: 0,
      damageRoll: 0,
    },
  });

  const onSubmit = (values: CombinedRollResult) => {
    sendCombinedRoll(values);
  };

  const sendCombinedRoll = (combinedResults: CombinedRollResult) => {
    if (bluetoothManager.isConnected) {
      bluetoothManager.sendMessage({
        type: 'ROLL',  // Changed from 'COMBINED_ROLL' to 'ROLL' which is a valid type
        playerId: 'player1',
        playerName: character ? character.name : 'Player',
        data: combinedResults
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {character ? (
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="w-full md:w-1/3">
            <CardHeader>
              <CardTitle>Perfil del Personaje</CardTitle>
              <CardDescription>Información básica del personaje.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <CharacterAvatar
                currentAvatar={character.avatarUrl}
                onSelect={handleAvatarSelect}
              />
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nombre del personaje"
                  value={character.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Descripción del personaje"
                  value={character.description || ''}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="w-full md:w-2/3">
            <CardHeader>
              <CardTitle>Tiradas Combinadas</CardTitle>
              <CardDescription>Realiza tiradas de ataque, defensa y daño.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="attackRoll"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tirada de Ataque</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} 
                                 onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="defenseRoll"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tirada de Defensa</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field}
                                 onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="damageRoll"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tirada de Daño</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field}
                                 onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Enviar Tirada Combinada</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p>No se encontró información del personaje.</p>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Bluetooth</h2>
        <p>Estado: {isBluetoothAvailable ? 'Disponible' : 'No disponible'}</p>
        <p>Conexión: {isBluetoothConnected ? 'Conectado' : 'Desconectado'}</p>
        <p>Rol: {bluetoothRole}</p>

        {!isBluetoothConnected && (
          <div className="flex gap-2">
            <Button onClick={handleStartNarrator} disabled={isSearching}>
              {isSearching ? 'Buscando...' : 'Iniciar como Narrador'}
            </Button>
            <Button onClick={handleConnectPlayer} disabled={isSearching}>
              {isSearching ? 'Buscando...' : 'Conectar como Jugador'}
            </Button>
          </div>
        )}

        {isBluetoothConnected && (
          <Button onClick={handleDisconnect}>Desconectar</Button>
        )}
      </div>
    </div>
  );
};

export default Index;
