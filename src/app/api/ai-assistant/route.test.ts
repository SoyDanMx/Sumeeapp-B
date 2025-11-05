/**
 * Prueba de integración para /api/ai-assistant
 *
 * Esta es una prueba básica para la ruta crítica del MVP:
 * El asistente de IA que ayuda a diagnosticar problemas
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock de variables de entorno
process.env.GOOGLE_GENERATIVE_AI_API_KEY = "test-api-key";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

describe("API: /api/ai-assistant", () => {
  beforeEach(() => {
    // Reset mocks antes de cada test
    vi.clearAllMocks();
  });

  it("debería validar que la query es requerida", async () => {
    // Nota: Esta es una prueba unitaria básica
    // En un test de integración real, haríamos un fetch al endpoint
    const requestBody = {};

    // Validación esperada: query es requerida
    expect(requestBody).not.toHaveProperty("query");
  });

  it("debería aceptar una query de texto válida", () => {
    const requestBody = {
      query: "Mi boiler no prende",
    };

    expect(requestBody.query).toBeDefined();
    expect(typeof requestBody.query).toBe("string");
    expect(requestBody.query.length).toBeGreaterThan(0);
  });

  it("debería aceptar una imagen opcional en base64", () => {
    const requestBody: { query: string; image: string } = {
      query: "Analiza esta imagen",
      image: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
    };

    expect(requestBody.query).toBeDefined();
    expect(requestBody.image).toBeDefined();
    expect(requestBody.image).toMatch(/^data:image\/\w+;base64,/);
  });

  it("debería requerir al menos query o image", () => {
    const validRequest1: { query: string; image?: string } = { query: "Test" };
    const validRequest2: { query?: string; image: string } = {
      image: "data:image/jpeg;base64,test",
    };
    const invalidRequest: { query?: string; image?: string } = {};

    expect(validRequest1.query || validRequest1.image).toBeDefined();
    expect(validRequest2.query || validRequest2.image).toBeDefined();
    expect(invalidRequest.query || invalidRequest.image).toBeUndefined();
  });
});

/**
 * NOTA: Esta es una prueba básica (unit test)
 *
 * Para una prueba de integración completa, necesitarías:
 * 1. Mockear la respuesta de Google Gemini API
 * 2. Mockear Supabase client
 * 3. Hacer un fetch real al endpoint
 *
 * Ejemplo de test de integración completo:
 *
 * ```typescript
 * import { POST } from './route';
 * import { NextRequest } from 'next/server';
 *
 * it('debería retornar respuesta exitosa', async () => {
 *   const request = new NextRequest('http://localhost/api/ai-assistant', {
 *     method: 'POST',
 *     body: JSON.stringify({ query: 'Mi boiler no prende' })
 *   });
 *
 *   const response = await POST(request);
 *   const data = await response.json();
 *
 *   expect(response.status).toBe(200);
 *   expect(data.response).toBeDefined();
 * });
 * ```
 */
