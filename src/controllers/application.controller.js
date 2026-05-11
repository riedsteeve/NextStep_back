import { supabase } from "../config/supabase.js";

// Récupérer les candidatures (Toutes pour l'Admin, seulement les siennes pour le User)
export const getAll = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    let query = supabase.from('applications').select('*');

    // Si l'utilisateur n'est pas admin, on filtre par son user_id
    if (role !== 'admin') {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) return res.status(400).json(error);
    res.json(data);
};

// Créer une candidature liée à l'utilisateur
export const create = async (req, res) => {
    const userId = req.user.id;
    const { company, position, status, notes } = req.body;

    const { data, error } = await supabase
        .from('applications')
        .insert([{ 
            company, 
            position, 
            status, 
            notes, 
            user_id: userId 
        }])
        .select();

    if (error) return res.status(400).json(error);
    res.status(201).json(data);
};

// Mettre à jour une candidature
export const update = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const updates = req.body;

    let query = supabase.from('applications').update(updates).eq('id', id);

    // Si ce n'est pas un admin, on vérifie que la candidature lui appartient
    if (role !== 'admin') {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query.select();

    if (error) return res.status(400).json(error);
    
    if (data.length === 0) {
        return res.status(404).json({ message: "Candidature non trouvée ou non autorisée" });
    }

    res.json(data);
};

// Supprimer une candidature
export const deleteApp = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    let query = supabase.from('applications').delete().eq('id', id);

    // Si ce n'est pas un admin, on vérifie que la candidature lui appartient
    if (role !== 'admin') {
        query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) return res.status(400).json(error);
    res.json({ message: "Candidature supprimée avec succès" });
};
