import { supabase } from "../config/supabase.js";

// Récupérer toutes les notes (Toutes pour l'Admin, seulement les siennes pour le User)
export const getAll = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    let query = supabase.from('notes').select('*');

    // Si l'utilisateur n'est pas admin, on filtre par son user_id
    if (role !== 'admin') {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) return res.status(400).json(error);
    res.json(data);
};

// Créer une nouvelle note
export const create = async (req, res) => {
    const userId = req.user.id;
    const { title, content } = req.body;

    const { data, error } = await supabase
        .from('notes')
        .insert([{ 
            title: title || '', 
            content: content || '', 
            user_id: userId 
        }])
        .select()
        .single();

    if (error) return res.status(400).json(error);
    res.status(201).json(data);
};

// Mettre à jour une note
export const update = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;
    const updates = req.body;

    let query = supabase.from('notes').update(updates).eq('id', id);

    // Si ce n'est pas un admin, on vérifie que la note lui appartient
    if (role !== 'admin') {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query.select().single();

    if (error) return res.status(400).json(error);
    
    if (!data) {
        return res.status(404).json({ message: "Note non trouvée ou non autorisée" });
    }

    res.json(data);
};

// Supprimer une note
export const deleteNote = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    let query = supabase.from('notes').delete().eq('id', id);

    // Si ce n'est pas un admin, on vérifie que la note lui appartient
    if (role !== 'admin') {
        query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) return res.status(400).json(error);
    res.json({ message: "Note supprimée avec succès" });
};
