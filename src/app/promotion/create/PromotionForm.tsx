import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { getNowInGMT7 } from "@/lib/date-time.utils";
import { checkPromotionCodeExists } from "@/lib/api/checkPromotionCodeExists";
import { addDays } from "date-fns";
import PromotionPreviewDialog from "./PromotionPreviewDialog";
import { useCurrencyGroups } from "@/hooks/useCurrencyGroups";

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
    message: "Start Date must be earlier than or equal to the End Date",
    path: ["startDate"],
  });

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
}

export default function PromotionForm({
  mode = "create",
  initialValues,
  onClose,
  onSubmit,
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
    defaultValues: initialValues
      ? {
          ...initialValues,
          startDate: new Date(initialValues.startDate),
          endDate: new Date(initialValues.endDate),
          gameConfigType: initialValues.gameConfigType as 2 | 3,
          offeredSiteNames: initialValues.offeredSiteNames || [],
          offeredPlayerIds: initialValues.offeredPlayerIds || [],
          betLevels: initialValues.betLevels || [],
          allPlayers:
            !initialValues.offeredPlayerIds ||
            initialValues.offeredPlayerIds.length === 0,
        }
      : {
          name: "",
          code: "",
          bonusItemCount: 0,
          startDate: addDays(getNowInGMT7(), 1),
          endDate: addDays(getNowInGMT7(), 1),
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

  const currencyGroups = useWatch({ control, name: "currencyGroups" });
  const gameConfigType = useWatch({ control, name: "gameConfigType" });
  const gameIds = useWatch({ control, name: "gameIds" });
  const { data: operators = [] } = useOperators();
  const shouldFetchGames = currencyGroups.length > 0 && !!gameConfigType;
  const {
    data: games = [],
    isLoading,
    error,
  } = useFilteredGames(
    shouldFetchGames ? currencyGroups : [],
    shouldFetchGames ? gameConfigType : undefined
  );
  const operatorId = useWatch({ control, name: "operatorId" });
  const { data: currencyGroupsInfo = [], isLoading: isLoadingCurrencyGroups } =
    useCurrencyGroups(operatorId);

  useEffect(() => {
    if (initialValues && initialValues.offeredSiteNames) {
      setSiteInput(initialValues.offeredSiteNames.join(";"));
    }
  }, [initialValues]);

  const [lastCheckedCode, setLastCheckedCode] = useState("");

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

    if (mode === "create" && values.code) {
      if (values.code !== lastCheckedCode) {
        const exists = await checkPromotionCodeExists(values.code);
        if (exists) {
          setError("code", {
            type: "manual",
            message:
              "This promotion code already exists. Please choose another.",
          });
          return;
        }
        setLastCheckedCode(values.code);
      }
    }

    setStep(2);
  };

  const { mutate: createPromotion, isPending } = useCreatePromotion();
  const [previewData, setPreviewData] = useState<PromotionFormValues | null>(
    null
  );
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const handleFormSubmit = (data: PromotionFormValues) => {
    const payload: PromotionFormSubmission = {
      betLevels: (data.betLevels || []).map(({ currencyGroup, betLevel }) => ({
        currencyGroup,
        betLevel,
      })),
      bonusItemCount: data.bonusItemCount,
      code: data.code,
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
    console.log(payload);

    if (onSubmit) {
      onSubmit(payload as Promotion);
    } else {
      createPromotion(payload, {
        onSuccess: () => {
          setShowPreviewDialog(false);
          onClose?.(true);
        },
        onError: (err) => console.error("Failed to create promotion", err),
      });
    }
  };

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <form
          id="promotionForm"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-6"
        >
          {/* Step Progress UI */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-sm font-medium text-gray-600 px-1">
              <span>Step {step} of 2</span>
              <span>
                {step === 1 ? "Basic Details" : "Targeting & Settings"}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-gray-800 transition-all duration-300"
                style={{ width: step === 1 ? "50%" : "100%" }}
              />
            </div>
          </div>

          {/* Form Steps */}
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
      {/* Footer fixed at bottom of dialog */}
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
              className="btn-next flex items-center gap-2"
            >
              Preview
            </button>
          ) : null}
        </div>
      </div>
      {previewData && (
        <PromotionPreviewDialog
          open={showPreviewDialog}
          onClose={() => setShowPreviewDialog(false)}
          data={previewData}
          operatorName={
            operators.find((op) => op.PartnerId === previewData?.operatorId)
              ?.Name
          }
          gameList={games}
          currencyGroupsInfo={currencyGroupsInfo}
          isSubmitting={isPending}
          mode={mode as "create" | "edit"}
          initialId={initialValues?._id}
          onConfirm={(finalPayload) => {
            handleFormSubmit(finalPayload);
          }}
        />
      )}
    </div>
  );
}
