import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Pas de token fourni" });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Vérification du jeton JWT personnalisé
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // On injecte les infos de l'utilisateur dans la requête
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token invalide ou expiré" });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Accès refusé : Droits Administrateur requis" });
    }
};
