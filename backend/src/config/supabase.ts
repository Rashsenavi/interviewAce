import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn("⚠️  Supabase configuration incomplete. File uploads will not work.");
}

// Create Supabase client with service key for server-side operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Upload file to Supabase Storage
 */
export const uploadFileToSupabase = async (
  bucketName: string,
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<{ url: string; error?: string }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      return { url: "", error: error.message };
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return { url: publicData.publicUrl };
  } catch (error) {
    return {
      url: "",
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFileFromSupabase = async (
  bucketName: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Deletion failed",
    };
  }
};

export default {
  supabase,
  uploadFileToSupabase,
  deleteFileFromSupabase,
};
