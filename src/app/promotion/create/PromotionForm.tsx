import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BetSettingsDialog from "./BetSettingsDialog";
import axios from "axios";

const promotionSchema = z.object({
  name: z
    .string()
    .min(1, "Promotion name is required")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  code: z
    .string()
    .min(1, "Promotion code is required")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  freeSpins: z.coerce.number().min(1, "Free spins must be greater than 0"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  operator: z.string().min(1, "Operator is required"),
  siteOffering: z.string().optional(),
  selectedGames: z.array(z.string()).min(1, "Select at least one game"),
  allPlayers: z.boolean(),
  uploadedFile: z.any().optional(),
});

export type PromotionFormValues = z.infer<typeof promotionSchema>;

const gameList = [
  { id: "1", name: "Four Guardians" },
  { id: "2", name: "Dragon Ball" },
  { id: "3", name: "One Piece" },
  { id: "4", name: "Transformers" },
  { id: "5", name: "BlackPink" },
  { id: "6", name: "Mission Impossible" },
  { id: "7", name: "Fortune Cat" },
  { id: "8", name: "Happy Fish" },
];

export default function PromotionForm() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: "",
      code: "",
      freeSpins: 0,
      startDate: undefined,
      endDate: undefined,
      operator: "",
      siteOffering: "",
      selectedGames: [],
      allPlayers: true,
    },
  });

  const [codeEdited, setCodeEdited] = useState(false);
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const name = watch("name");
  const selectedGames = watch("selectedGames");

  const [games, setGames] = useState<{ id: string; name: string }[]>([]);

/*   useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get("/api/games");
        setGames(res.data);
      } catch (err) {
        console.error("Failed to fetch games", err);
      }
    };

    fetchGames();
  }, []); */

  useEffect(() => {
    if (!codeEdited && name) {
      const autoCode = name
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_]/g, "_");
      setValue("code", autoCode);
    }
  }, [name, codeEdited, setValue]);

  const toggleGame = (id: string) => {
    const updated = selectedGames.includes(id)
      ? selectedGames.filter((gid) => gid !== id)
      : [...selectedGames, id];
    setValue("selectedGames", updated);
  };

  const onSubmit = (data: PromotionFormValues) => {
    console.log("Submitting...", data);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <form
        className="max-w-5xl mx-auto bg-white rounded-md shadow p-6 space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-2xl font-bold border-b pb-4">Add New Promotion</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Promotion Name</Label>
            <Input {...register("name")} maxLength={50} />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label>Promotion Code</Label>
            <Input
              {...register("code")}
              maxLength={50}
              onChange={() => setCodeEdited(true)}
            />
            {errors.code && (
              <p className="text-red-500 text-sm">{errors.code.message}</p>
            )}
          </div>

          <div>
            <Label>No. of Free Spins</Label>
            <Input type="number" {...register("freeSpins")} />
            {errors.freeSpins && (
              <p className="text-red-500 text-sm">{errors.freeSpins.message}</p>
            )}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>* Start Date</Label>
            <Popover open={openStart} onOpenChange={setOpenStart}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => setOpenStart(true)}
                >
                  {getValues("startDate")
                    ? format(getValues("startDate"), "dd-MM-yyyy HH:mm")
                    : "Pick start date"}
                  <CalendarIcon className="ml-auto h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white rounded-lg shadow-lg">
                <Calendar
                  mode="single"
                  selected={getValues("startDate")}
                  onSelect={(date) => {
                    setValue("startDate", date!);
                    setOpenStart(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>* End Date</Label>
            <Popover open={openEnd} onOpenChange={setOpenEnd}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => setOpenEnd(true)}
                >
                  {getValues("endDate")
                    ? format(getValues("endDate"), "dd-MM-yyyy HH:mm")
                    : "Pick end date"}
                  <CalendarIcon className="ml-auto h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white rounded-lg shadow-lg">
                <Calendar
                  mode="single"
                  selected={getValues("endDate")}
                  onSelect={(date) => {
                    setValue("endDate", date!);
                    setOpenEnd(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="bg-white rounded-md border p-4 shadow-sm">
          <fieldset className="border p-4">
            <legend className="font-semibold">Operator Settings</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>* Operator Name</Label>
                <Select onValueChange={(val) => setValue("operator", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator1">Operator 1</SelectItem>
                    <SelectItem value="operator2">Operator 2</SelectItem>
                  </SelectContent>
                </Select>
                {errors.operator && (
                  <p className="text-red-500 text-sm">
                    {errors.operator.message}
                  </p>
                )}
              </div>

              <div className="relative flex items-end">
                <Label className="mr-2">* Bet Settings</Label>
                <div className="z-50">
                  <BetSettingsDialog />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>Site Offering</Label>
                <Input
                  {...register("siteOffering")}
                  placeholder="e.g. site1;site2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ** Enter the site names to offer the promotion (Separate
                  multiple names with a semicolon ;). Leave the field empty to
                  offer the promotion to all sites associated with the selected
                  Operator.
                </p>
              </div>
            </div>
          </fieldset>
        </div>

        <div>
          <Label className="mb-2 block">* Games</Label>
          <div className="border p-4 max-w-md">
               {gameList.map((game) => (
              <div key={game.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`game-${game.id}`}
                  checked={selectedGames.includes(game.id)}
                  onCheckedChange={() => toggleGame(game.id)}
                />
                <label htmlFor={`game-${game.id}`} className="text-sm">
                  {game.name}
                </label>
              </div>
            ))}
          {/*   {games.map((game) => (
              <div key={game.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`game-${game.id}`}
                  checked={selectedGames.includes(game.id)}
                  onCheckedChange={() => toggleGame(game.id)}
                />
                <label htmlFor={`game-${game.id}`} className="text-sm">
                  {game.name}
                </label>
              </div>
            ))} */}
          </div>
          {errors.selectedGames && (
            <p className="text-red-500 text-sm mt-1">
              {errors.selectedGames.message}
            </p>
          )}
        </div>

        <div>
          <Label className="mb-2 block">Members</Label>
          <RadioGroup
            value={watch("allPlayers") ? "true" : "false"}
            onValueChange={(val) => setValue("allPlayers", val === "true")}
            className="space-y-2"
          >
            <div className="flex items-start gap-2">
              <RadioGroupItem value="true" id="all" />
              <div>
                <label htmlFor="all" className="text-sm font-medium">
                  All Players
                </label>
                <p className="text-xs text-muted-foreground">
                  FSB will be given to everybody who opens the promoted game
                  during the promo period.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <RadioGroupItem value="false" id="file" />
              <div>
                <label htmlFor="file" className="text-sm font-medium">
                  Players from the file
                </label>
                <p className="text-xs text-muted-foreground">
                  Only the players from the uploaded file will receive the Free
                  Spins Bonus.
                </p>
              </div>
            </div>
          </RadioGroup>

          {!watch("allPlayers") && (
            <div className="mt-4 space-y-1">
              <Input
                type="file"
                accept=".csv"
                {...register("uploadedFile")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.size > 2 * 1024 * 1024) {
                    alert("File size exceeds 2MB limit");
                    e.target.value = "";
                    return;
                  }
                }}
              />
              {watch("uploadedFile")?.[0]?.name && (
                <p className="text-sm text-blue-600 underline cursor-pointer">
                  {watch("uploadedFile")[0].name} (click to preview)
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Must be a .csv file, maximum size 2MB. Uploading a new file will
                override the existing one.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" type="button">
            Close
          </Button>
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
