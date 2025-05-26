
import { renderHook } from "@testing-library/react";
import { useResetOnChange } from "@/hooks/useResetOnChange";
import { Promotion } from "@/types/promotion";

const mockSetValue = jest.fn();
const mockSetSiteInput = jest.fn();
const mockSetInitialOfferedPlayerIds = jest.fn();

describe("useResetOnChange", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should reset fields in create mode", () => {
    renderHook(() =>
      useResetOnChange({
        mode: "create",
        dependencies: [],
        setValue: mockSetValue,
        setSiteInput: mockSetSiteInput,
        setInitialOfferedPlayerIds: mockSetInitialOfferedPlayerIds,
      })
    );

    expect(mockSetValue).toHaveBeenCalledWith("currencyGroups", []);
    expect(mockSetValue).toHaveBeenCalledWith("betLevels", []);
    expect(mockSetValue).toHaveBeenCalledWith("gameIds", []);
    expect(mockSetValue).toHaveBeenCalledWith("offeredPlayerIds", []);
    expect(mockSetValue).toHaveBeenCalledWith("uploadedFile", undefined);
    expect(mockSetValue).toHaveBeenCalledWith("allPlayers", true);
    expect(mockSetSiteInput).toHaveBeenCalledWith("");
    expect(mockSetInitialOfferedPlayerIds).toHaveBeenCalledWith([]);
  });

  it("should restore fields in edit mode when values are unchanged", () => {
    const initialValues = {
      currencyGroups: ["cg1"],
      betLevels: [{ currencyGroup: "cg1", betLevel: 10 }],
      gameIds: [1],
      offeredPlayerIds: ["p1", "p2"],
      offeredSiteNames: ["site1", "site2"],
    };

    renderHook(() =>
      useResetOnChange({
        mode: "edit",
        dependencies: [
          ["op1", "op1"], // unchanged
          [2, 2], // unchanged
        ],
        initialValues: initialValues as Promotion,
        setValue: mockSetValue,
        setSiteInput: mockSetSiteInput,
        setInitialOfferedPlayerIds: mockSetInitialOfferedPlayerIds,
      })
    );

    expect(mockSetValue).toHaveBeenCalledWith("currencyGroups", initialValues.currencyGroups);
    expect(mockSetValue).toHaveBeenCalledWith("betLevels", initialValues.betLevels);
    expect(mockSetValue).toHaveBeenCalledWith("gameIds", initialValues.gameIds);
    expect(mockSetValue).toHaveBeenCalledWith("offeredPlayerIds", initialValues.offeredPlayerIds);
    expect(mockSetValue).toHaveBeenCalledWith("allPlayers", false);
    expect(mockSetSiteInput).toHaveBeenCalledWith("site1;site2");
  });

  it("should reset fields in edit mode when values are changed", () => {
    const initialValues = {
      currencyGroups: ["cg1"],
      betLevels: [{ currencyGroup: "cg1", betLevel: 10 }],
      gameIds: [1],
      offeredPlayerIds: ["p1", "p2"],
      offeredSiteNames: ["site1", "site2"],
    };

    renderHook(() =>
      useResetOnChange({
        mode: "edit",
        dependencies: [
          ["op1", "op2"], // changed
        ],
        initialValues: initialValues as Promotion,
        setValue: mockSetValue,
        setSiteInput: mockSetSiteInput,
        setInitialOfferedPlayerIds: mockSetInitialOfferedPlayerIds,
      })
    );

    expect(mockSetValue).toHaveBeenCalledWith("currencyGroups", []);
    expect(mockSetValue).toHaveBeenCalledWith("betLevels", []);
    expect(mockSetValue).toHaveBeenCalledWith("gameIds", []);
    expect(mockSetValue).toHaveBeenCalledWith("offeredPlayerIds", []);
    expect(mockSetValue).toHaveBeenCalledWith("uploadedFile", undefined);
    expect(mockSetValue).toHaveBeenCalledWith("allPlayers", true);
    expect(mockSetSiteInput).toHaveBeenCalledWith("");
    expect(mockSetInitialOfferedPlayerIds).toHaveBeenCalledWith([]);
  });
});
