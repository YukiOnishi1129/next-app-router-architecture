import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@/test/test-utils";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "./ContactForm";

describe("ContactForm Component", () => {
  it("renders all form fields", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const submitButton = screen.getByRole("button", { name: /send message/i });

    await user.click(submitButton);

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Message is required")).toBeInTheDocument();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole("button", { name: /send message/i });

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email format")).toBeInTheDocument();
    });
  });

  it("validates message length", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole("button", { name: /send message/i });

    await user.type(messageInput, "Too short");
    await user.click(submitButton);

    expect(
      screen.getByText("Message must be at least 10 characters")
    ).toBeInTheDocument();
  });

  it("clears error when user starts typing", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole("button", { name: /send message/i });

    // Trigger validation error
    await user.click(submitButton);
    expect(screen.getByText("Name is required")).toBeInTheDocument();

    // Start typing
    await user.type(nameInput, "J");
    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<ContactForm onSubmit={handleSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole("button", { name: /send message/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(
      messageInput,
      "This is a test message with enough characters"
    );

    await user.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        message: "This is a test message with enough characters",
      });
    });
  });

  it("shows loading state during submission", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn(
      () => new Promise<void>((resolve) => setTimeout(resolve, 100))
    );
    render(<ContactForm onSubmit={handleSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole("button", { name: /send message/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(
      messageInput,
      "This is a test message with enough characters"
    );

    await user.click(submitButton);

    expect(
      screen.getByRole("button", { name: /sending/i })
    ).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /send message/i })
      ).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("shows success message after successful submission", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole("button", { name: /send message/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(
      messageInput,
      "This is a test message with enough characters"
    );

    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Message sent successfully!")
      ).toBeInTheDocument();
    });
  });

  it("clears form after successful submission", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const messageInput = screen.getByLabelText(
      /message/i
    ) as HTMLTextAreaElement;
    const submitButton = screen.getByRole("button", { name: /send message/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(
      messageInput,
      "This is a test message with enough characters"
    );

    await user.click(submitButton);

    await waitFor(() => {
      expect(nameInput.value).toBe("");
      expect(emailInput.value).toBe("");
      expect(messageInput.value).toBe("");
    });
  });

  it("shows error message when submission fails", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn(() =>
      Promise.reject(new Error("Network error"))
    );
    render(<ContactForm onSubmit={handleSubmit} />);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const messageInput = screen.getByLabelText(/message/i);
    const submitButton = screen.getByRole("button", { name: /send message/i });

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");
    await user.type(
      messageInput,
      "This is a test message with enough characters"
    );

    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to send message. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("has proper accessibility attributes", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole("button", { name: /send message/i });

    // Trigger validation error
    await user.click(submitButton);

    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput).toHaveAttribute("aria-describedby", "name-error");

    // Clear error
    await user.type(nameInput, "John");
    expect(nameInput).toHaveAttribute("aria-invalid", "false");
    expect(nameInput).not.toHaveAttribute("aria-describedby");
  });
});
