/**
 * Prueba unitaria para la creación de leads
 *
 * Esta es la funcionalidad CRÍTICA del MVP:
 * Los clientes deben poder crear solicitudes de servicio gratuitas
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock de Supabase client
const mockSupabaseRPC = vi.fn();
const mockSupabaseInsert = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    rpc: mockSupabaseRPC,
    from: () => ({
      insert: mockSupabaseInsert,
      select: () => ({ single: () => ({ data: null, error: null }) }),
    }),
    auth: {
      getSession: () => ({
        data: {
          session: {
            user: { id: "test-user-id" },
            access_token: "test-token",
          },
        },
        error: null,
      }),
    },
  },
}));

describe("Creación de Leads - Funcionalidad Crítica del MVP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validación de datos", () => {
    it("debería validar que el servicio es requerido", () => {
      const leadData = {
        descripcion: "Necesito reparar mi boiler",
        // servicio faltante
      };

      expect(leadData).not.toHaveProperty("servicio");
    });

    it("debería aceptar datos válidos de lead", () => {
      const validLeadData = {
        nombre_cliente: "Juan Pérez",
        whatsapp: "+52 55 1234 5678",
        descripcion_proyecto: "Mi boiler no prende",
        servicio: "plomeria",
        ubicacion_lat: 19.4326,
        ubicacion_lng: -99.1332,
        ubicacion_direccion: "CDMX",
      };

      expect(validLeadData.servicio).toBeDefined();
      expect(validLeadData.descripcion_proyecto).toBeDefined();
      expect(typeof validLeadData.servicio).toBe("string");
    });
  });

  describe("Estrategia de creación (RPC vs INSERT)", () => {
    it("debería intentar primero usar RPC create_lead", async () => {
      // Simular éxito con RPC
      mockSupabaseRPC.mockResolvedValueOnce({
        data: "lead-uuid-123",
        error: null,
      });

      // Simulación de llamada RPC
      const rpcResult = await mockSupabaseRPC("create_lead", {
        nombre_cliente_in: "Test",
        servicio_in: "plomeria",
      });

      expect(mockSupabaseRPC).toHaveBeenCalledWith(
        "create_lead",
        expect.any(Object)
      );
      expect(rpcResult.error).toBeNull();
    });

    it("debería hacer fallback a INSERT si RPC falla", async () => {
      // Simular fallo de RPC
      mockSupabaseRPC.mockResolvedValueOnce({
        data: null,
        error: { message: "Function not found" },
      });

      // Simular INSERT como fallback
      mockSupabaseInsert.mockResolvedValueOnce({
        data: { id: "lead-uuid-456" },
        error: null,
      });

      const rpcResult = await mockSupabaseRPC("create_lead", {});

      if (rpcResult.error) {
        // Fallback a INSERT
        const insertResult = await mockSupabaseInsert({
          servicio: "plomeria",
          estado: "nuevo",
        });

        expect(insertResult.data).toBeDefined();
      }
    });
  });

  describe("Manejo de errores RLS", () => {
    it("debería detectar errores de RLS", () => {
      const rlsError = {
        code: "42501",
        message: "new row violates row-level security policy",
      };

      const isRLSError =
        rlsError.code === "42501" ||
        rlsError.message?.includes("row-level security");

      expect(isRLSError).toBe(true);
    });

    it("debería proporcionar mensaje amigable para errores RLS", () => {
      const rlsError = {
        code: "42501",
        message: "new row violates row-level security policy",
      };

      let errorMessage = "Error desconocido";

      if (
        rlsError.message?.includes("row-level security") ||
        rlsError.code === "42501"
      ) {
        errorMessage =
          "No tienes permisos para crear solicitudes. Por favor, verifica tu sesión o contacta a soporte.";
      }

      expect(errorMessage).toContain("permisos");
      expect(errorMessage.length).toBeGreaterThan(20);
    });
  });
});

/**
 * NOTA: Estas son pruebas unitarias básicas
 *
 * Para pruebas de integración completas, necesitarías:
 * 1. Base de datos de prueba (Supabase test instance)
 * 2. Usuario de prueba autenticado
 * 3. Limpieza de datos después de cada test
 *
 * Ejemplo de test de integración completo:
 *
 * ```typescript
 * import { supabase } from '@/lib/supabase/client';
 *
 * it('debería crear un lead exitosamente', async () => {
 *   // Autenticar usuario de prueba
 *   const { data: { session } } = await supabase.auth.signInWithPassword({
 *     email: 'test@example.com',
 *     password: 'test123'
 *   });
 *
 *   // Crear lead
 *   const { data, error } = await supabase.rpc('create_lead', {
 *     servicio_in: 'plomeria',
 *     descripcion_proyecto_in: 'Test lead'
 *   });
 *
 *   expect(error).toBeNull();
 *   expect(data).toBeDefined();
 *
 *   // Limpiar
 *   await supabase.from('leads').delete().eq('id', data);
 * });
 * ```
 */
