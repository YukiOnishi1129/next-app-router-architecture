import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@/test/test-utils";
import UserList from "./UserList";

// Mock the global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("UserList Server Component", () => {
  const mockUsers = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Smith", email: "jane@example.com" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com" },
    { id: 4, name: "Alice Brown", email: "alice@example.com" },
    { id: 5, name: "Charlie Davis", email: "charlie@example.com" },
  ];

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("renders user list when data is fetched successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    });

    render(<UserList />);

    // Initially shows loading
    expect(screen.getByText("Loading...")).toBeInTheDocument();

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText("User List")).toBeInTheDocument();
    });

    // Check that all users are rendered
    for (const user of mockUsers) {
      expect(screen.getByText(user.name)).toBeInTheDocument();
      expect(screen.getByText(user.email)).toBeInTheDocument();
      expect(screen.getByTestId(`user-${user.id}`)).toBeInTheDocument();
    }
  });

  it("only renders first 5 users", async () => {
    const manyUsers = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => manyUsers,
    });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText("User List")).toBeInTheDocument();
    });

    // Should only render first 5 users
    expect(screen.getByText("User 1")).toBeInTheDocument();
    expect(screen.getByText("User 5")).toBeInTheDocument();
    expect(screen.queryByText("User 6")).not.toBeInTheDocument();
  });

  it("handles fetch errors gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<UserList />);

    await waitFor(() => {
      expect(
        screen.getByText("Error: Failed to fetch users")
      ).toBeInTheDocument();
    });
  });

  it("handles network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText("Error: Network error")).toBeInTheDocument();
    });
  });

  it("applies correct styling classes", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText("User List")).toBeInTheDocument();
    });

    // Check heading styling
    const heading = screen.getByText("User List");
    expect(heading).toHaveClass("text-2xl", "font-bold");

    // Check list styling
    const list = screen.getByRole("list");
    expect(list).toHaveClass("divide-y", "divide-gray-200");

    // Check individual user items
    const firstUser = screen.getByTestId("user-1");
    expect(firstUser).toHaveClass("py-4");
  });
});
