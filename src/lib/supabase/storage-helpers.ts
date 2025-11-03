// =========================================================================
// FUNCIONES HELPER PARA SUPABASE STORAGE
// =========================================================================
// Funciones para subir archivos a Supabase Storage para profesionales

import { supabase } from "@/lib/supabase/client";

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Sube una foto de perfil a Supabase Storage
 * @param file - Archivo de imagen
 * @param userId - ID del usuario
 * @returns URL pública de la imagen subida
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("professional-avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("professional-avatars").getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    console.error("Error uploading avatar:", error);
    return {
      url: "",
      path: "",
      error: error.message || "Error al subir la foto de perfil",
    };
  }
}

/**
 * Sube una foto al portfolio de un profesional
 * @param file - Archivo de imagen
 * @param userId - ID del usuario
 * @param description - Descripción del trabajo (ej: "Instalación de bombas hidroneumáticas")
 * @returns URL pública de la imagen subida
 */
export async function uploadPortfolioItem(
  file: File,
  userId: string,
  description: string
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/portfolio-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("professional-portfolio")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("professional-portfolio").getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    console.error("Error uploading portfolio item:", error);
    return {
      url: "",
      path: "",
      error: error.message || "Error al subir la foto del portfolio",
    };
  }
}

/**
 * Sube una certificación (DC-3, Red CONOCER, etc.)
 * @param file - Archivo de imagen o PDF
 * @param userId - ID del usuario
 * @returns URL pública del archivo subido
 */
export async function uploadCertificate(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/certificate-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("professional-certificates")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("professional-certificates")
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    console.error("Error uploading certificate:", error);
    return {
      url: "",
      path: "",
      error: error.message || "Error al subir la certificación",
    };
  }
}

/**
 * Sube la constancia de antecedentes no penales
 * @param file - Archivo de imagen o PDF
 * @param userId - ID del usuario
 * @returns URL pública del archivo subido
 */
export async function uploadBackgroundCheck(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/background-check-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from("professional-background-checks")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("professional-background-checks")
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (error: any) {
    console.error("Error uploading background check:", error);
    return {
      url: "",
      path: "",
      error: error.message || "Error al subir la constancia de antecedentes",
    };
  }
}

/**
 * Elimina un archivo de Supabase Storage
 * @param bucket - Nombre del bucket
 * @param path - Ruta del archivo
 */
export async function deleteStorageFile(
  bucket: string,
  path: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error(`Error deleting file from ${bucket}:`, error);
    return false;
  }
}
