import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://YOUR_PROJECT.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "YOUR_ANON_KEY";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadDocument(file: File, folder: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("documents")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw new Error(error.message);

  // Get public URL
  const { data: publicData } = supabase.storage.from("documents").getPublicUrl(fileName);
  return publicData?.publicUrl || "";
}
