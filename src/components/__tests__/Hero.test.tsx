import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hero } from "../Hero";
import { toast } from "sonner";

// Global mocks
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock("@/hooks/useUser", () => ({
    useUser: () => ({
        user: null,
        isLoading: false,
    }),
}));

vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
    },
}));

vi.mock("@/lib/location", () => ({
    isValidMexicanPostalCode: (code: string) => /^\d{5}$/.test(code),
    formatPostalCode: (code: string) => code.replace(/\D/g, "").slice(0, 5),
    getCurrentPostalCode: vi.fn(),
}));

vi.mock("next/image", () => ({
    default: (props: any) => <img {...props} />,
}));

vi.mock("@fortawesome/react-fontawesome", () => ({
    FontAwesomeIcon: () => <span data-testid="fa-icon" />,
}));

describe("Hero Component", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders correctly", () => {
        render(<Hero />);
        expect(screen.getByRole("heading", { name: /Tus proyectos/i })).toBeInTheDocument();
        const inputs = screen.getAllByPlaceholderText("03100");
        expect(inputs.length).toBeGreaterThan(0);
    });

    it("shows error toast when clicking search with invalid postal code", async () => {
        render(<Hero />);
        const inputs = screen.getAllByPlaceholderText("03100");
        const input = inputs[0];
        const button = screen.getByRole("button", { name: /encontrar mi técnico/i });

        // Invalid input
        fireEvent.change(input, { target: { value: "123" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith(
                "Por favor, ingresa un código postal válido de 5 dígitos."
            );
        });
    });

    it("redirects to login when guest tries to search", async () => {
        render(<Hero />);
        const inputs = screen.getAllByPlaceholderText("03100");
        const input = inputs[0];
        const button = screen.getByRole("button", { name: /encontrar mi técnico/i });

        // Valid input
        fireEvent.change(input, { target: { value: "03100" } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(toast.info).toHaveBeenCalled();
            expect(mockPush).toHaveBeenCalledWith("/login?redirect=/professionals");
        });
    });
});
