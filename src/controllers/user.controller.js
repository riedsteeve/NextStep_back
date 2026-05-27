import { supabase } from "../config/supabase.js";

// Récupérer tous les utilisateurs qui ont créé un compte (réservé aux admins)
export const getAll = async (req, res) => {
    // On sélectionne tout SAUF le mot de passe pour la sécurité
    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role, created_at')
        .order('created_at', { ascending: false });

    if (error) return res.status(400).json(error);
    res.json(data);
};