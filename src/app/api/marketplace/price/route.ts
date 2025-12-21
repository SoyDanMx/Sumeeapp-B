import { NextRequest, NextResponse } from "next/server";
import { getSyscomProduct } from "@/lib/syscom/api";

/**
 * API endpoint para obtener precio de un producto de forma segura
 * Evita exponer credenciales de Syscom en el cliente
 * 
 * @route GET /api/marketplace/price?external_code=123
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const externalCode = searchParams.get("external_code");

    if (!externalCode) {
      return NextResponse.json(
        { error: "external_code es requerido" },
        { status: 400 }
      );
    }

    const externalCodeNum = parseInt(externalCode);
    if (isNaN(externalCodeNum)) {
      return NextResponse.json(
        { error: "external_code debe ser un número válido" },
        { status: 400 }
      );
    }

    // ⚠️ API DE SYSCOM TEMPORALMENTE DESHABILITADA
    // Retornar null inmediatamente sin hacer petición a Syscom
    return NextResponse.json(
      { 
        price: null,
        originalPrice: null,
        source: "syscom_api_disabled",
        currency: "MXN",
        error: "API de Syscom temporalmente deshabilitada"
      },
      { status: 200 }
    );

    /* CÓDIGO DESHABILITADO TEMPORALMENTE
    // Obtener producto de Syscom
    try {
      const syscomProduct = await getSyscomProduct(externalCodeNum);

      if (!syscomProduct?.precio) {
        // Retornar 200 con precio null en lugar de 404 para evitar errores en el cliente
        return NextResponse.json(
          { 
            price: null,
            originalPrice: null,
            source: "syscom_api",
            currency: "MXN",
            error: "Producto sin precio disponible"
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

        // Priorizar precio_especial si existe y es válido
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
        // Retornar 200 con precio null en lugar de 404
        return NextResponse.json(
          { 
            price: null,
            originalPrice: null,
            source: "syscom_api",
            currency: "MXN",
            error: "Precio no disponible"
          },
          { status: 200 }
        );
      }

      return NextResponse.json({
        price,
        originalPrice,
        source: "syscom_api",
        currency: "MXN",
      });
    } catch (error: any) {
      // No loguear errores 404 para evitar spam en logs
      if (error.response?.status !== 404) {
        console.error("Error obteniendo precio de Syscom:", error);
      }
      
      // Retornar 200 con precio null en lugar de 404/500 para evitar errores en el cliente
      // El cliente puede manejar esto mostrando "Consultar precio"
      return NextResponse.json(
        { 
          price: null,
          originalPrice: null,
          source: "syscom_api",
          currency: "MXN",
          error: error.response?.status === 404 
            ? "Producto no encontrado en Syscom" 
            : "Error al obtener precio"
        },
        { status: 200 }
      );
    }
    */ // FIN DE CÓDIGO DESHABILITADO
  } catch (error: any) {
    console.error("Error en endpoint de precio:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

