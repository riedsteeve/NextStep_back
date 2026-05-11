import fetch from 'node-fetch'; // Ou utiliser le fetch natif de Node 18+
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, './.env') });

const url = process.env.SUPABASE_URL;

async function testConnection() {
    console.log("Tentative de connexion à :", url);
    try {
        const response = await fetch(url + '/rest/v1/', {
            headers: {
                'apikey': process.env.SUPABASE_KEY,
                'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
            }
        });
        console.log("Status de la réponse :", response.status);
        const data = await response.json();
        console.log("Réponse reçue avec succès !");
    } catch (error) {
        console.error("❌ Échec du fetch :");
        console.error(error);
    }
}

testConnection();
