"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function DebugPage() {
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        supabase.from("marketplace_products").select("*").then(({ data }) => {
            setProducts(data || []);
        });
    }, []);

    return (
        <div className="p-10 font-mono text-sm">
            <h1>Debug Marketplace Data</h1>
            <table className="w-full border-collapse border border-gray-400 mt-4">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Title</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Original Price</th>
                        <th className="border p-2">Images (First 3)</th>
                        <th className="border p-2">Seller ID</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p) => (
                        <tr key={p.id}>
                            <td className="border p-2">{p.title}</td>
                            <td className="border p-2">{p.price}</td>
                            <td className="border p-2">{p.original_price}</td>
                            <td className="border p-2 text-xs">
                                {p.images?.slice(0, 3).join("\n")}
                            </td>
                            <td className="border p-2 text-xs">{p.seller_id}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
