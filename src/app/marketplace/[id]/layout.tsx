import { Metadata } from "next";
import { generateMetadata as generateProductMetadata } from "./metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return generateProductMetadata({ params });
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

