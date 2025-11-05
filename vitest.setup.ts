import "@testing-library/jest-dom";
import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Limpiar después de cada test
afterEach(() => {
  cleanup();
});

// Mock de variables de entorno para tests
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-gemini-key";
// NODE_ENV es read-only, se configura automáticamente por Vitest
if (typeof process.env.NODE_ENV === "undefined") {
  (process.env as { NODE_ENV?: string }).NODE_ENV = "test";
}

// Mock de window.matchMedia (usado por algunos componentes de UI)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
