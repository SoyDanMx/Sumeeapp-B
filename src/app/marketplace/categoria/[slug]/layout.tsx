import { Metadata } from "next";
import { generateCategoryMetadata } from "./metadata";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  // Obtener conteo de productos para la categoría
  let productCount: number | undefined;
  
  try {
    const supabase = await createSupabaseServerClient();
    const { data: category } = await supabase
      .from("marketplace_categories")
      .select("id")
      .eq("slug", slug)
      .single();

    if (category) {
      const { count } = await supabase
        .from("marketplace_products")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)
        .eq("status", "active")
        .gt("price", 0); // Excluir productos con precio 0

      productCount = count || undefined;
    }
  } catch (error) {
    console.error("Error fetching product count for metadata:", error);
  }

  return generateCategoryMetadata(slug, productCount);
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

