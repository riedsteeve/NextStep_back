import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration du chemin absolu pour le .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Erreur : SUPABASE_URL ou SUPABASE_KEY manquante dans le fichier .env");
}

// Client unique avec la clé service_role pour gérer manuellement les profils
export const supabase = createClient(supabaseUrl, supabaseKey);
