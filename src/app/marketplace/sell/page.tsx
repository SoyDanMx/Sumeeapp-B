"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCamera,
    faTag,
    faDollarSign,
    faAlignLeft,
    faList,
    faCheckCircle,
    faTimes,
    faSpinner,
    faPhone
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner"; // Assuming sonner is available based on package.json, otherwise use alert

const categories = [
    { id: "electricidad", name: "Electricidad" },
    { id: "plomeria", name: "Plomería" },
    { id: "construccion", name: "Construcción / Albañilería" },
    { id: "mecanica", name: "Mecánica" },
    { id: "pintura", name: "Pintura" },
    { id: "jardineria", name: "Jardinería" },
    { id: "seguridad", name: "Seguridad Industrial" },
];

const conditions = [
    { id: "nuevo", name: "Nuevo" },
    { id: "usado_excelente", name: "Usado - Excelente" },
    { id: "usado_bueno", name: "Usado - Bueno" },
    { id: "usado_regular", name: "Usado - Regular" },
    { id: "para_reparar", name: "Para Reparar" },
];

export default function SellPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Store File objects for upload + Preview URLs for display
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const [userId, setUserId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        price: "",
        original_price: "",
        category_id: "",
        condition: "",
        description: "",
        location_city: "CDMX",
        location_zone: "",
        contact_phone: "",
    });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // For demo/dev purposes, we might not force redirect, but we can't insert without ID.
                // We'll trust the RLS policies to block if not auth, but for UX let's warn.
                console.log("No active session found.");
            } else {
                setUserId(session.user.id);
            }
        };
        checkUser();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 5 * 1024 * 1024) {
                alert("La imagen no debe superar los 5MB");
                return;
            }

            const imageUrl = URL.createObjectURL(file);
            setImageFiles([...imageFiles, file]);
            setImagePreviews([...imagePreviews, imageUrl]);
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(imageFiles.filter((_, i) => i !== index));
        setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log("🚀 Starting product submission...");

        try {
            // 1. Get User ID
            let sellerId = userId;
            if (!sellerId) {
                console.log("⚠️ No userId in state, fetching from supabase.auth.getUser()...");
                // Use getUser() instead of getSession() to avoid potential lock issues
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) {
                    throw new Error("Debes iniciar sesión para vender un producto.");
                }
                sellerId = user.id;
            }
            console.log("✅ User ID confirmed:", sellerId);

            // 2. Upload Images
            const uploadedUrls: string[] = [];

            if (imageFiles.length > 0) {
                console.log(`📸 Uploading ${imageFiles.length} images...`);
                for (let i = 0; i < imageFiles.length; i++) {
                    const file = imageFiles[i];
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${sellerId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                    console.log(`   - Uploading image ${i + 1}/${imageFiles.length}: ${fileName}`);
                    const { error: uploadError } = await supabase.storage
                        .from('marketplace')
                        .upload(fileName, file);

                    if (uploadError) {
                        console.error("❌ Upload error details:", uploadError);
                        if (uploadError.message.includes("Bucket not found") || uploadError.message.includes("does not exist")) {
                            throw new Error("Error interno: El sistema de almacenamiento no está configurado. Contacta al soporte.");
                        }
                        throw new Error("Error al subir imagen: " + uploadError.message);
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('marketplace')
                        .getPublicUrl(fileName);

                    console.log(`     -> URL: ${publicUrl}`);
                    uploadedUrls.push(publicUrl);
                }
            } else {
                console.log("ℹ️ No images to upload.");
            }

            // 3. Insert Product
            console.log("💾 Inserting product into database...");
            const productData = {
                seller_id: sellerId, // Now nullable in DB but we send it if we have it
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                original_price: formData.original_price ? parseFloat(formData.original_price) : null,
                category_id: formData.category_id,
                condition: formData.condition,
                location_city: formData.location_city,
                location_zone: formData.location_zone,
                contact_phone: formData.contact_phone,
                images: uploadedUrls.length > 0 ? uploadedUrls : null,
                status: 'active'
            };

            const { error: insertError } = await (supabase
                .from('marketplace_products') as any)
                .insert(productData);

            if (insertError) {
                console.error("❌ Database Insert Error:", insertError);
                throw new Error("Error al guardar el producto: " + insertError.message);
            }

            console.log("✨ Product published successfully!");
            toast.success("¡Producto publicado exitosamente!");
            setSuccess(true);

        } catch (error: any) {
            console.error("🔥 Error submitting product:", error);
            toast.error(error.message || "Ha ocurrido un error inesperado.");
        } finally {
            console.log("🏁 Submission process finished (finally block).");
            setIsSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 px-4 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Producto Publicado!</h2>
                    <p className="text-gray-600 mb-8">
                        Tu producto ha sido publicado exitosamente y ya es visible en el marketplace.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href="/marketplace"
                            className="block w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Ir al Marketplace
                        </Link>
                        <button
                            onClick={() => {
                                setSuccess(false);
                                setFormData({ ...formData, title: "", price: "", description: "", original_price: "", contact_phone: "" });
                                setImageFiles([]);
                                setImagePreviews([]);
                            }}
                            className="block w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Vender otro producto
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-[calc(var(--header-offset,72px))] pb-20">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/marketplace"
                        className="text-gray-500 hover:text-indigo-600 transition-colors text-sm font-medium mb-4 inline-block"
                    >
                        ← Volver al Marketplace
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Vender Artículo</h1>
                    <p className="text-gray-600 mt-2">
                        Completa los detalles para publicar tu herramienta o equipo.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">

                        {/* Fotos */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-4">
                                Fotos del Producto
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {imagePreviews.map((img, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}

                                {imagePreviews.length < 5 && (
                                    <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                                        <FontAwesomeIcon icon={faCamera} className="text-gray-400 text-xl mb-1" />
                                        <span className="text-xs text-gray-500 font-medium">Agregar</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Máximo 5 fotos. La primera será la portada.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Título */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Título de la publicación
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faTag} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                        placeholder="Ej. Taladro Bosch 18V con estuche"
                                    />
                                </div>
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Categoría
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faList} className="text-gray-400" />
                                    </div>
                                    <select
                                        required
                                        value={formData.category_id}
                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                                    >
                                        <option value="">Selecciona una categoría</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Condición */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Condición
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faCheckCircle} className="text-gray-400" />
                                    </div>
                                    <select
                                        required
                                        value={formData.condition}
                                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                                    >
                                        <option value="">Selecciona el estado</option>
                                        {conditions.map(cond => (
                                            <option key={cond.id} value={cond.id}>{cond.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Precio */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Precio (MXN)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faDollarSign} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Precio Original (Opcional) */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Precio Original (Opcional)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faDollarSign} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.original_price}
                                        onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Si aplicas un descuento sobre el precio de lista.</p>
                            </div>

                            {/* WhatsApp de Contacto */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    WhatsApp de Contacto
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FontAwesomeIcon icon={faPhone} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.contact_phone}
                                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Ej. 55 1234 5678"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Los compradores te contactarán a este número.</p>
                            </div>

                            {/* Ubicación (Zona simple por ahora) */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Ubicación / Zona de Entrega
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.location_zone}
                                    onChange={(e) => setFormData({ ...formData, location_zone: e.target.value })}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Ej. Colonia Del Valle, Narvarte, Centro..."
                                />
                            </div>

                            {/* Descripción */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Descripción Detallada
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none">
                                        <FontAwesomeIcon icon={faAlignLeft} className="text-gray-400" />
                                    </div>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Describe el estado, accesorios incluidos, tiempo de uso, motivos de venta, etc..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-4">
                            <Link
                                href="/marketplace"
                                className="px-6 py-3 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                onClick={(e) => isSubmitting && e.preventDefault()}
                            >
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2 ${isSubmitting ? "opacity-75 cursor-wait" : ""
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                        Publicando...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faCheckCircle} />
                                        Publicar Producto
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
