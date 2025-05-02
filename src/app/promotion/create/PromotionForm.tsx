import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Step1 from "./Step1";
import Step2 from "./Step2";
import { useCreatePromotion } from "@/hooks/useCreatePromotion";
import { GAME_TYPES } from "@/constants/gameTypes";
import { useOperators } from "@/hooks/useOperators";
import { useFilteredGames } from "@/hooks/useFilteredGames";

const getNowInGMT7 = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 60 * 60 * 1000);
};

const promotionSchema = z
  .object({
    name: z
      .string()
      .min(1, "Promotion name is required")
      .max(50)
      .regex(
        /^[a-zA-Z0-9_ ]+$/,
        "Only letters, numbers, and underscores allowed"
      ),
    code: z
      .string()
      .min(1, "Promotion code is required")
      .max(50)
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Only letters, numbers, and underscores allowed"
      ),
    bonusItemCount: z.coerce
      .number()
      .min(1, "Free spins must be greater than 0"),
    startDate: z.coerce.date({
      required_error: "Start date is required",
      invalid_type_error: "Invalid start date",
    }),
    endDate: z.coerce.date({
      required_error: "End date is required",
      invalid_type_error: "Invalid end date",
    }),
    operatorId: z.coerce.string().min(1, { message: "Operator is required" }),
    offeredSiteNames: z.array(z.string()).optional(),
    gameIds: z.array(z.coerce.number()).min(1, "Select at least one game"),
    currencyGroups: z
      .array(z.string().nonempty("Currency group cannot be empty"))
      .min(1, "At least one currency group is required"),
    allPlayers: z.boolean(),
    offeredPlayerIds: z.array(z.string()).optional(),
    uploadedFile: z.any().optional(),
    gameConfigType: z.nativeEnum(GAME_TYPES),
    betLevels: z
      .array(
        z.object({
          currencyGroup: z.string().min(1, "Currency Group is required"),
          betLevel: z.coerce
            .number()
            .min(0.01, "Bet Level must be greater than 0"),
        })
      )
      .optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type PromotionFormValues = z.infer<typeof promotionSchema>;
export default function PromotionForm({
  onClose,
}: {
  onClose?: (shouldReload?: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      code: "",
      bonusItemCount: 0,
      startDate: getNowInGMT7(),
      endDate: getNowInGMT7(),
      operatorId: "",
      offeredSiteNames: [],
      gameIds: [],
      currencyGroups: [],
      allPlayers: true,
      offeredPlayerIds: [],
      uploadedFile: undefined,
      gameConfigType: GAME_TYPES.CLASSIC,
      betLevels: [],
    },
  });

  const [step, setStep] = useState(1);
  const [codeEdited, setCodeEdited] = useState(false);
  const [openBetSettings, setOpenBetSettings] = useState(false);
  const [siteInput, setSiteInput] = useState("");

  const watchFields = watch();
  const { data: operators = [] } = useOperators();
  const {
    data: games = [],
    isLoading,
    error,
  } = useFilteredGames(watch("currencyGroups"), watch("gameConfigType"));

  useEffect(() => {
    if (!codeEdited && watchFields.name) {
      const autoCode = watchFields.name
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_]/g, "_");
      setValue("code", autoCode);
    }
  }, [watchFields.name, codeEdited, setValue]);

  useEffect(() => {
    console.log("Validation errors:", errors);
  }, [errors]);

  const handleNextStep = async () => {
    const valid = await trigger([
      "name",
      "code",
      "bonusItemCount",
      "startDate",
      "endDate",
      "operatorId",
    ]);
    if (valid) setStep(2);
  };

  const { mutate: createPromotion, isPending } = useCreatePromotion();
  const onSubmit = (data: PromotionFormValues) => {
    const payload = {
      name: data.name,
      code: data.code,
      operatorId: data.operatorId,
      offeredSiteNames: data.offeredSiteNames ?? [],
      currencyGroups: data.currencyGroups,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      bonusItemCount: data.bonusItemCount,
      offeredPlayerIds: data.offeredPlayerIds ?? [],
      gameConfigType: data.gameConfigType,
      gameIds: data.gameIds,
      betLevels: data.betLevels ?? [],
    };

    createPromotion(payload, {
      onSuccess: () => onClose?.(true),
      onError: (err) => console.error("Failed to create promotion", err),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="w-full space-y-1">
        <div className="flex justify-between items-center text-sm font-medium text-gray-600 px-1">
          <span>Step {step} of 2</span>
          <span>{step === 1 ? "Basic Details" : "Targeting & Settings"}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full bg-gray-800 transition-all duration-300`}
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      {step === 1 ? (
        <Step1
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          handleNext={handleNextStep}
          codeEdited={codeEdited}
          setCodeEdited={setCodeEdited}
          operators={operators}
        />
      ) : (
        <Step2
          setValue={setValue}
          watch={watch}
          errors={errors}
          isPending={isPending}
          onBack={() => setStep(1)}
          openBetSettings={openBetSettings}
          setOpenBetSettings={setOpenBetSettings}
          siteInput={siteInput}
          setSiteInput={setSiteInput}
          games={games}
          isLoading={isLoading}
          error={error || null}
          toggleGame={(id: number) => {
            const gameIds = watch("gameIds");
            const updated = gameIds.includes(id)
              ? gameIds.filter((gid) => gid !== id)
              : [...gameIds, id];
            setValue("gameIds", updated);
          }}
        />
      )}
    </form>
  );
}
