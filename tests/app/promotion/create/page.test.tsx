import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Page from "@/app/promotion/create/page";

jest.mock("@/app/promotion/create/PromotionDialog", () => (props: any) => (
  props.open ? <div data-testid="promotion-dialog">Dialog Open</div> : null
));

describe("Promotion Create Page", () => {
  it("renders open dialog button", () => {
    render(<Page />);
    expect(screen.getByText("Open Promotion Dialog")).toBeInTheDocument();
  });

  it("opens PromotionDialog when button is clicked", () => {
    render(<Page />);
    fireEvent.click(screen.getByText("Open Promotion Dialog"));
    expect(screen.getByTestId("promotion-dialog")).toBeInTheDocument();
  });
});
