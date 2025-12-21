import { NextRequest, NextResponse } from "next/server";
import { getSyscomProduct } from "@/lib/syscom/api";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * API endpoint para sincronizar precio de un producto desde Syscom a la BD
 * Actualiza el precio en la base de datos cuando se obtiene de Syscom
 * 
 * @route POST /api/marketplace/price/sync
 * Body: { external_code: string, product_id?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { external_code, product_id } = body;

    if (!external_code) {
      return NextResponse.json(
        { error: "external_code es requerido" },
        { status: 400 }
      );
    }

    const externalCodeNum = parseInt(external_code);
    if (isNaN(externalCodeNum)) {
      return NextResponse.json(
        { error: "external_code debe ser un número válido" },
        { status: 400 }
      );
    }

    // ⚠️ API DE SYSCOM TEMPORALMENTE DESHABILITADA
    // Retornar error inmediatamente sin hacer petición a Syscom
    return NextResponse.json(
      {
        success: false,
        error: "API de Syscom temporalmente deshabilitada",
        price: null,
        originalPrice: null,
        source: "syscom_api_disabled",
        currency: "MXN",
      },
      { status: 200 }
    );

    /* CÓDIGO DESHABILITADO TEMPORALMENTE
    // Obtener producto de Syscom
    try {
      const syscomProduct = await getSyscomProduct(externalCodeNum);

      if (!syscomProduct?.precio) {
        return NextResponse.json(
          { 
            success: false,
            error: "Producto sin precio disponible en Syscom",
            price: null,
            originalPrice: null,
          },
          { status: 200 }
        );
      }

      const precioData = syscomProduct.precio;
      let price = 0;
      let originalPrice: number | undefined = undefined;

      // Procesar estructura de precios según la API de Syscom
      if (typeof precioData === "object" && precioData !== null) {
        const precioEspecial =
          precioData.precio_especial || precioData.precio_descuento;
        const precioLista = precioData.precio_lista;

        // PRIORIDAD: precio_especial es el precio principal (precio con descuento)
        if (precioEspecial && precioEspecial > 0) {
          price = precioEspecial;
          // Si hay precio_lista mayor, usarlo como precio original
          if (precioLista && precioLista > precioEspecial) {
            originalPrice = precioLista;
          }
        } else if (precioLista && precioLista > 0) {
          price = precioLista;
        }
      } else if (typeof precioData === "number" && precioData > 0) {
        price = precioData;
      }

      if (price === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: "Precio no disponible",
            price: null,
            originalPrice: null,
          },
          { status: 200 }
        );
      }

      // Si se proporciona product_id, actualizar en la BD
      if (product_id) {
        try {
          const supabase = createClient(supabaseUrl, supabaseServiceKey);
          
          const updateData: any = {
            price: price,
          };
          
          if (originalPrice && originalPrice > price) {
            updateData.original_price = originalPrice;
          }

          const { error: updateError } = await supabase
            .from("marketplace_products")
            .update(updateData)
            .eq("id", product_id);

          if (updateError) {
            console.error("Error actualizando precio en BD:", updateError);
            return NextResponse.json(
              { 
                success: false,
                error: "Error al actualizar precio en base de datos",
                price,
                originalPrice,
                synced: false,
              },
              { status: 200 }
            );
          }

          return NextResponse.json({
            success: true,
            price,
            originalPrice,
            synced: true,
            source: "syscom_api",
            currency: "MXN",
            message: "Precio actualizado en base de datos",
          });
        } catch (dbError: any) {
          console.error("Error en actualización de BD:", dbError);
          return NextResponse.json(
            { 
              success: true,
              price,
              originalPrice,
              synced: false,
              error: "Error al actualizar en BD, pero precio obtenido",
              source: "syscom_api",
            },
            { status: 200 }
          );
        }
      }

      // Si no hay product_id, solo retornar el precio sin actualizar BD
      return NextResponse.json({
        success: true,
        price,
        originalPrice,
        synced: false,
        source: "syscom_api",
        currency: "MXN",
        message: "Precio obtenido (no se actualizó BD porque no se proporcionó product_id)",
      });
    } catch (error: any) {
      // No loguear errores 404 para evitar spam en logs
      if (error.response?.status !== 404) {
        console.error("Error obteniendo precio de Syscom:", error);
      }
      
      return NextResponse.json(
        { 
          success: false,
          price: null,
          originalPrice: null,
          synced: false,
          error: error.response?.status === 404 
            ? "Producto no encontrado en Syscom" 
            : "Error al obtener precio",
        },
        { status: 200 }
      );
    }
    */ // FIN DE CÓDIGO DESHABILITADO
  } catch (error: any) {
    console.error("Error en endpoint de sincronización:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

