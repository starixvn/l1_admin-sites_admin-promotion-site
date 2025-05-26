import { useEffect } from "react";
import { Promotion } from "@/types/promotion";
import { UseFormSetValue } from "react-hook-form";
import { PromotionFormValues } from "@/app/promotion/create/PromotionForm";

export const useResetOnChange = ({
  mode,
  dependencies,
  initialValues,
  setValue,
  setSiteInput,
  setInitialOfferedPlayerIds,
}: {
  mode: string;
  dependencies: any[];
  initialValues?: Promotion;
  setValue: UseFormSetValue<PromotionFormValues>;
  setSiteInput: (value: string) => void;
  setInitialOfferedPlayerIds: (value: string[]) => void;
}) => {
  useEffect(
    () => {
      const resetFields = () => {
        setValue("currencyGroups", []);
        setValue("betLevels", []);
        setValue("gameIds", []);
        setValue("offeredPlayerIds", []);
        setValue("uploadedFile", undefined);
        setValue("allPlayers", true);
        setSiteInput("");
        setInitialOfferedPlayerIds?.([]);
      };

      const restoreFields = () => {
        if (!initialValues) {
          return;
        }
        setValue("currencyGroups", initialValues.currencyGroups || []);
        setValue("betLevels", initialValues.betLevels || []);
        setValue("gameIds", initialValues.gameIds || []);
        setValue("offeredPlayerIds", initialValues.offeredPlayerIds || []);
        setValue(
          "allPlayers",
          !initialValues.offeredPlayerIds ||
            initialValues.offeredPlayerIds.length === 0
        );
        setSiteInput(initialValues.offeredSiteNames?.join(";") || "");
      };

      if (mode === "create") {
        resetFields();
      } else if (mode === "edit") {
        const hasChanged = dependencies.some(
          ([current, initial]) => current !== initial
        );
        hasChanged ? resetFields() : restoreFields();
      }
    },
    dependencies.map(([value]) => value)
  ); // 👈 Dependency: chỉ theo dõi giá trị hiện tại
};
