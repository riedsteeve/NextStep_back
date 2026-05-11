import { supabase } from "../config/supabase.js";

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Pas de token fourni" });
    }

    const token = authHeader.split(' ')[1];

    // Vérification du token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: "Token invalide ou expiré" });
    }

    // RÉCUPÉRATION DU RÔLE DEPUIS LA TABLE PROFILES
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error("Erreur récupération profil:", profileError);
        // On définit un rôle par défaut en cas d'erreur
        user.role = 'user';
    } else {
        user.role = profile.role;
    }

    req.user = user;
    next();
};

// Middleware optionnel pour restreindre une route aux Admins uniquement
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Accès refusé : Droits Administrateur requis" });
    }
};
