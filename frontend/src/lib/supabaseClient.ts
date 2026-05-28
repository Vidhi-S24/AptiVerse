import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabaseAnonKey: string = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient("https://aiirjjbhplzoymkijori.supabase.co", "sb_publishable_GaklnSBfco0KYJ4N7s0SPw_jYvRburJ");