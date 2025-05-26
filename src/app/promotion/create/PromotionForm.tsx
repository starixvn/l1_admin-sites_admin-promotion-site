import { useState, useEffect } from "react";
import { useForm, useWatch, UseFormSetValue } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Step1 from "./Step1";
import Step2 from "./Step2";
import { useCreatePromotion } from "@/hooks/useCreatePromotion";
import { GAME_TYPES } from "@/constants/gameTypes";
import { useOperators } from "@/hooks/useOperators";
import { useFilteredGames } from "@/hooks/useFilteredGames";
import { Promotion } from "@/types/promotion";
import { getStatus } from "@/constants/promotionStatusMap";
import { getTodayAtMidnightGMT7 } from "@/lib/date-time.utils";
import { checkPromotionCodeExists } from "@/lib/api/checkPromotionCodeExists";
import { addDays } from "date-fns";
import PromotionPreviewDialog from "./PromotionPreviewDialog";
import { useCurrencyGroups } from "@/hooks/useCurrencyGroups";

export const promotionSchema = z
  .object({
    name: z
      .string()
      .min(1, "Promotion name is required")
      .max(50)
      .regex(
        /^[a-zA-Z0-9_ ]+$/,
        "The Promotion name contains invalid characters"
      ),
    code: z
      .string()
      .min(1, "Promotion code is required")
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, "The Code name contains invalid characters"),
    bonusItemCount: z.coerce
      .number({
        invalid_type_error: "Free spins must be greater than 0",
        required_error: "Free spins is required",
      })
      .int("Free spins must be an integer")
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
    gameIds: z
      .array(z.coerce.number())
      .min(1, "At least one game must be selected for the promotion."),
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
    message: "Start Date must be earlier than the End Date",
    path: ["startDate"],
  })
  .refine((data) => data.startDate > new Date(), {
    message: "Start Date must be greater than the current time",
    path: ["startDate"],
  })
  .refine(
    (data) => {
      // ✅ Validate tại đây
      return data.allPlayers ||
        (data.uploadedFile instanceof File && data.uploadedFile.size > 0) ||
        (data.offeredPlayerIds && data.offeredPlayerIds.length > 0);
    },
    {
      path: ["uploadedFile"],
      message: "Please upload a file before saving.",
    }
  );

export type PromotionFormValues = z.infer<typeof promotionSchema>;

type PromotionFormSubmission = Omit<
  Promotion,
  "_id" | "createdAt" | "updatedAt" | "__v" | "betLevels"
> & {
  betLevels: { currencyGroup: string; betLevel: number }[];
};

interface PromotionFormProps {
  mode?: string;
  initialValues?: Promotion;
  onClose?: (shouldReload?: boolean) => void;
  onSubmit?: (values: Promotion) => Promise<void>;
  onSuccess?: (promotionCode: string) => void;
}

const getDefaultValues = (initialValues?: Promotion) => {
  if (initialValues) {
    return {
      ...initialValues,
      startDate: new Date(initialValues.startDate),
      endDate: new Date(initialValues.endDate),
      gameConfigType: initialValues.gameConfigType as 2 | 3,
      offeredSiteNames: initialValues.offeredSiteNames || [],
      offeredPlayerIds: initialValues.offeredPlayerIds || [],
      betLevels: initialValues.betLevels || [],
      allPlayers: !initialValues.offeredPlayerIds || initialValues.offeredPlayerIds.length === 0,
    };
  }
  return {
    name: "",
    code: "",
    bonusItemCount: 0,
    startDate: addDays(getTodayAtMidnightGMT7(), 1),
    endDate: addDays(getTodayAtMidnightGMT7(), 1),
    operatorId: "",
    offeredSiteNames: [],
    gameIds: [],
    currencyGroups: [],
    allPlayers: true,
    offeredPlayerIds: [],
    uploadedFile: undefined,
    gameConfigType: GAME_TYPES.CLASSIC,
    betLevels: [],
  };
};

const handleOperatorChange = (
  operatorId: string,
  initialValues: Promotion | undefined,
  mode: string,
  setValue: UseFormSetValue<PromotionFormValues>,
  setSiteInput: (value: string) => void
) => {
  if (!operatorId) {
    return;
  }

  const isChanged = operatorId !== initialValues?.operatorId;

  if (mode === "create") {
    setValue("currencyGroups", []);
    setValue("betLevels", []);
    setValue("gameIds", []);
    setSiteInput("");
    return;
  }

  if (mode === "edit") {
    if (isChanged) {
      setValue("currencyGroups", []);
      setValue("betLevels", []);
      setValue("gameIds", []);
      setSiteInput("");
    } else {
      setValue("currencyGroups", initialValues?.currencyGroups || []);
      setValue("betLevels", initialValues?.betLevels || []);
      setValue("gameIds", initialValues?.gameIds || []);
      setValue("offeredPlayerIds", initialValues?.offeredPlayerIds || []);
      setSiteInput(initialValues?.offeredSiteNames?.join(";") || "");
    }
  }
};

const StepProgress = ({ step }: { step: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm text-gray-500 font-medium">
      <span>Step {step} of 2</span>
      <span>{step === 1 ? "Basic Details" : "Targeting & Settings"}</span>
    </div>
    <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
      <div
        className="h-full bg-gray-800 transition-all duration-300"
        style={{ width: step === 1 ? "50%" : "100%" }}
      />
    </div>
  </div>
);

const FormFooter = ({
  step,
  setStep,
  handleNextStep,
  trigger,
  getValues,
  setPreviewData,
  setShowPreviewDialog,
  isPending,
}: {
  step: number;
  setStep: (step: number) => void;
  handleNextStep: () => Promise<void>;
  trigger: () => Promise<boolean>;
  getValues: () => PromotionFormValues;
  setPreviewData: (data: PromotionFormValues) => void;
  setShowPreviewDialog: (show: boolean) => void;
  isPending: boolean;
}) => (
  <div className="form-footer relative px-6 py-4">
    <div className="absolute left-6 top-1/2 -translate-y-1/2">
      {step === 2 && (
        <button
          type="button"
          onClick={() => setStep(1)}
          className="btn-cancel flex items-center gap-2"
        >
          ← Back
        </button>
      )}
    </div>

    <div className="flex justify-end">
      {step === 1 ? (
        <button type="button" onClick={handleNextStep} className="btn-next">
          Next →
        </button>
      ) : step === 2 ? (
        <button
          type="button"
          onClick={async () => {
            const isValid = await trigger();
            if (isValid) {
              setPreviewData(getValues());
              setShowPreviewDialog(true);
            }
          }}
          disabled={isPending}
          className="btn-primary flex items-center gap-2"
        >
          Save
        </button>
      ) : null}
    </div>
  </div>
);

export default function PromotionForm({
  mode = "create",
  initialValues,
  onClose,
  onSubmit,
  onSuccess,
}: PromotionFormProps) {
  const status = initialValues ? getStatus(initialValues) : "";
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    control,
    formState: { errors },
    setError,
    getValues,
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    mode: "onSubmit",
    defaultValues: getDefaultValues(initialValues),
  });

  const [step, setStep] = useState(1);
  const [codeEdited, setCodeEdited] = useState(false);
  const [openBetSettings, setOpenBetSettings] = useState(false);
  const [siteInput, setSiteInput] = useState("");
  const [lastCheckedCode, setLastCheckedCode] = useState("");
  const [previewData, setPreviewData] = useState<PromotionFormValues | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const currencyGroups = useWatch({ control, name: "currencyGroups" });
  const gameConfigType = useWatch({ control, name: "gameConfigType" });
  const gameIds = useWatch({ control, name: "gameIds" });
  const operatorId = useWatch({ control, name: "operatorId" });
  const initialGameIds = initialValues?.gameIds ?? [];

  const { data: operators = [] } = useOperators();
  const shouldFetchGames = currencyGroups.length > 0 && !!gameConfigType;
  const {
    data: games = [],
    isLoading,
    error,
  } = useFilteredGames({
    currencyGroups: shouldFetchGames ? currencyGroups : [],
    gameType: shouldFetchGames ? gameConfigType : undefined,
    gameIds: shouldFetchGames ? initialGameIds : [],
  });

  const { data: currencyGroupsInfo = [], isLoading: isLoadingCurrencyGroups } =
    useCurrencyGroups(operatorId);

  useEffect(() => {
    if (initialValues?.offeredSiteNames) {
      setSiteInput(initialValues.offeredSiteNames.join(";"));
    }
  }, [initialValues]);

  useEffect(() => {
    handleOperatorChange(operatorId, initialValues, mode, setValue, setSiteInput);
  }, [operatorId, initialValues, mode, setValue]);

  const handleNextStep = async () => {
    const isValid = await trigger([
      "name",
      "code",
      "bonusItemCount",
      "startDate",
      "endDate",
      "operatorId",
    ]);

    if (!isValid) {
      return;
    }

    const values = getValues();
    if (mode === "create" && values.code && values.code !== lastCheckedCode) {
      const exists = await checkPromotionCodeExists(values.code);
      if (exists) {
        setError("code", {
          type: "manual",
          message: "This promotion code already exists. Please choose another.",
        });
        return;
      }
      setLastCheckedCode(values.code);
    }

    setStep(2);
  };

  const { mutate: createPromotion, isPending } = useCreatePromotion();

  const handleFormSubmit = (data: PromotionFormValues) => {
    const payload: PromotionFormSubmission = {
      betLevels: (data.betLevels || []).map(({ currencyGroup, betLevel }) => ({
        currencyGroup,
        betLevel,
      })),
      bonusItemCount: data.bonusItemCount,
      code: data.code.toLowerCase(),
      currencyGroups: data.currencyGroups,
      gameConfigType: data.gameConfigType,
      gameIds: data.gameIds,
      name: data.name,
      operatorId: data.operatorId,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      offeredSiteNames: data.offeredSiteNames || [],
      offeredPlayerIds: data.offeredPlayerIds || [],
      ...(initialValues ? { _id: initialValues._id } : {}),
    };

    if (onSubmit) {
      onSubmit(payload as Promotion);
    } else {
      createPromotion(payload, {
        onSuccess: () => {
          setShowPreviewDialog(false);
          onSuccess?.(payload.code);
        },
        onError: (err) => console.error("Failed to create promotion", err),
      });
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] bg-white rounded-xl shadow-md">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <form
          id="promotionForm"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          <StepProgress step={step} />

          {step === 1 ? (
            <Step1
              mode={mode}
              status={status}
              register={register}
              setValue={setValue}
              control={control}
              errors={errors}
              codeEdited={codeEdited}
              setCodeEdited={setCodeEdited}
              operators={operators}
            />
          ) : (
            <Step2
              mode={mode}
              status={status}
              setValue={setValue}
              control={control}
              errors={errors}
              openBetSettings={openBetSettings}
              setOpenBetSettings={setOpenBetSettings}
              siteInput={siteInput}
              setSiteInput={setSiteInput}
              games={games}
              currencyGroupsInfo={currencyGroupsInfo}
              operators={operators ?? []}
              initialOfferedPlayerIds={initialValues?.offeredPlayerIds || []}
              isLoadingCurrencyGroups={isLoadingCurrencyGroups}
              isLoading={isLoading}
              error={error || null}
              toggleGame={(id: number) => {
                setValue(
                  "gameIds",
                  gameIds.includes(id)
                    ? gameIds.filter((gid: number) => gid !== id)
                    : [...gameIds, id]
                );
              }}
            />
          )}
        </form>
      </div>

      <FormFooter
        step={step}
        setStep={setStep}
        handleNextStep={handleNextStep}
        trigger={trigger}
        getValues={getValues}
        setPreviewData={setPreviewData}
        setShowPreviewDialog={setShowPreviewDialog}
        isPending={isPending}
      />

      {previewData && (
        <PromotionPreviewDialog
          open={showPreviewDialog}
          onClose={() => setShowPreviewDialog(false)}
          data={previewData}
          operatorName={operators.find((op) => op.PartnerId === previewData?.operatorId)?.Name}
          gameList={games}
          currencyGroupsInfo={currencyGroupsInfo}
          isSubmitting={isPending}
          mode={mode as "create" | "edit"}
          initialId={initialValues?._id}
          onConfirm={handleFormSubmit}
        />
      )}
    </div>
  );
}
