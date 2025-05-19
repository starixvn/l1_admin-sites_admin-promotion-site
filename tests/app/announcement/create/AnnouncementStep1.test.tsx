import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormProvider, useForm } from "react-hook-form";
import AnnouncementStep1 from "../../../../src/app/announcement/create/AnnouncementStep1";

jest.mock("papaparse", () => ({
  parse: (file: File, options: any) => {
    setTimeout(() => {
      options.complete({
        data: [
          { Language: "vi-VN", "Promotion Title": "Tiêu đề", "Banner Content": "Biểu ngữ", "Terms & Conditions": "Điều khoản" }
        ]
      });
    }, 0);
  }
}));

function Wrapper({ children, defaultValues }: any) {
  const methods = useForm({ defaultValues, mode: "onChange" });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

function renderWithForm(children: React.ReactNode, defaultValues?: any) {
  return render(<Wrapper defaultValues={defaultValues}>{children}</Wrapper>);
}

describe("AnnouncementStep1", () => {
  it("renders all language fields", () => {
    renderWithForm(<AnnouncementStep1 onNext={jest.fn()} />);
    // Promotion Title
    expect(screen.getByText("Promotion Title")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Enter title in/).length).toBe(6);
    // Banner Content
    expect(screen.getByText("Banner Content")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Enter banner content in/).length).toBe(6);
    // Terms & Conditions
    expect(screen.getByText("Terms & Conditions")).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Enter terms in/).length).toBe(6);
  });

  it("updates value when typing in input", () => {
    renderWithForm(<AnnouncementStep1 onNext={jest.fn()} />);
    const input = screen.getByPlaceholderText("Enter title in en-US");
    fireEvent.change(input, { target: { value: "Test Title" } });
    expect(input).toHaveValue("Test Title");
  });

  it("calls onNext when Next button is clicked", () => {
    const mockNext = jest.fn();
    renderWithForm(<AnnouncementStep1 onNext={mockNext} />);
    fireEvent.click(screen.getByText(/Next/));
    expect(mockNext).toHaveBeenCalled();
  });

  it("uploads valid CSV and updates fields", async () => {
    renderWithForm(<AnnouncementStep1 onNext={jest.fn()} />);
    const file = new File(
      [
        "Language,Promotion Title,Banner Content,Terms & Conditions\nvi-VN,Tiêu đề,Biểu ngữ,Điều khoản"
      ],
      "test.csv",
      { type: "text/csv" }
    );
    const input = document.querySelector("input[type='file']");
    fireEvent.change(input!, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter title in vi-VN")).toHaveValue("Tiêu đề");
      expect(screen.getByPlaceholderText("Enter banner content in vi-VN")).toHaveValue("Biểu ngữ");
      expect(screen.getByPlaceholderText("Enter terms in vi-VN")).toHaveValue("Điều khoản");
    });
  });

  it("shows alert if upload wrong file type", () => {
    window.alert = jest.fn();
    renderWithForm(<AnnouncementStep1 onNext={jest.fn()} />);
    const file = new File(["dummy"], "test.txt", { type: "text/plain" });
    const input = document.querySelector("input[type='file']");
    fireEvent.change(input!, { target: { files: [file] } });
    expect(window.alert).toHaveBeenCalledWith("Only .csv files are allowed!");
  });

  it("shows alert if upload file > 2MB", () => {
    window.alert = jest.fn();
    renderWithForm(<AnnouncementStep1 onNext={jest.fn()} />);
    const file = new File(["a".repeat(2 * 1024 * 1024 + 1)], "big.csv", { type: "text/csv" });
    Object.defineProperty(file, "size", { value: 2 * 1024 * 1024 + 1 });
    const input = document.querySelector("input[type='file']");
    fireEvent.change(input!, { target: { files: [file] } });
    expect(window.alert).toHaveBeenCalledWith("File size must be less than 2MB!");
  });
});
