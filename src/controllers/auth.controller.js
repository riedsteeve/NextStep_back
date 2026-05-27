import { supabase } from "../config/supabase.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// REGISTER
export const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // 1. Vérifier si l'utilisateur existe déjà
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    // 2. Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insérer dans la table profiles
    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          email,
          password: hashedPassword,
          first_name,
          last_name,
          role: "user"
          // La date est gérée par created_at dans Supabase
        },
      ])
      .select("id, email, first_name, last_name, role, created_at")
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Utilisateur créé avec succès", user: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Chercher l'utilisateur par email
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: "Identifiants invalides" });
    }

    // 2. Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Identifiants invalides" });
    }

    // 3. Générer le jeton JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 4. Réponse
    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
