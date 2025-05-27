import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormProvider, useForm } from "react-hook-form";
import AnnouncementStep2 from "../../../../src/app/announcement/create/AnnouncementStep2";

jest.mock("@/components/custom/date-time-picker", () => (props: any) => (
  <input
    data-testid={props.value === props.value ? "date-picker" : "date-picker"}
    type="datetime-local"
    value={props.value ? new Date(props.value).toISOString().slice(0, 16) : ""}
    onChange={e => props.onChange && props.onChange(new Date(e.target.value))}
    disabled={props.disabled}
  />
));
const promotionsMock = [
  { code: "promo1", name: "Promo 1", operatorId: "op1", startDate: "2024-01-01T00:00:00Z", endDate: "2024-01-10T00:00:00Z" },
  { code: "promo2", name: "Promo 2", operatorId: "op2", startDate: "2024-02-01T00:00:00Z", endDate: "2024-02-10T00:00:00Z" }
];
const usePromotionsMock = { promotions: promotionsMock };
jest.mock("@/hooks/usePromotions", () => ({
  usePromotions: () => usePromotionsMock
}));
jest.mock("@/components/ConfirmDialog", () => (props: any) => (
  props.open ? (
    <div data-testid="confirm-dialog">
      <button onClick={props.onConfirm}>Yes</button>
      <button onClick={props.onCancel}>No</button>
    </div>
  ) : null
));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    json: () => Promise.resolve([
      { PartnerId: "op1", Name: "Operator 1" },
      { PartnerId: "op2", Name: "Operator 2" }
    ])
  }) as any;
});

function Wrapper({ defaultValues, props }: any) {
  const methods = useForm({
    defaultValues: defaultValues || {
      template: 1,
      fromDate: new Date("2024-01-01T00:00:00Z"),
      toDate: new Date("2024-01-10T00:00:00Z"),
      promotionMappings: [{ operatorId: "op1", promotionCode: "promo1" }]
    }
  });
  return (
    <FormProvider {...methods}>
      <AnnouncementStep2
        onBack={props?.onBack || jest.fn()}
        onSave={props?.onSave || jest.fn()}
        mode={props?.mode || "create"}
        status={props?.status}
      />
    </FormProvider>
  );
}

function renderWithForm(defaultValues?: any, props?: any) {
  return render(<Wrapper defaultValues={defaultValues} props={props} />);
}

describe("AnnouncementStep2", () => {
  it("calls onBack when Back button is clicked", async () => {
    const onBack = jest.fn();
    await act(async () => {
      renderWithForm(undefined, { onBack });
    });
    fireEvent.click(screen.getByText("← Back"));
    expect(onBack).toHaveBeenCalled();
  });

  it("shows confirm dialog and calls onSave when Save is confirmed", async () => {
    const onSave = jest.fn();
    await act(async () => {
      renderWithForm(undefined, { onSave });
    });
    fireEvent.click(screen.getByText("Save"));
    expect(await screen.findByTestId("confirm-dialog")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Yes"));
    expect(onSave).toHaveBeenCalled();
  });

  it("adds a new mapping when Add new Operator is clicked", async () => {
    await act(async () => {
      renderWithForm();
    });
    fireEvent.click(screen.getByText("Add new Operator"));
    await waitFor(() => {
      expect(screen.getAllByText("Select Operator").length).toBeGreaterThanOrEqual(2);
    });
  });

  it("selects a template when clicked", async () => {
    await act(async () => {
      renderWithForm();
    });
    const template2 = screen.getByText("Template 2");
    fireEvent.click(template2);
    expect(template2.parentElement).toHaveClass("border-emerald-500");
  });
});
