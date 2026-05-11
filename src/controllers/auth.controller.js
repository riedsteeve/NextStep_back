import { supabase } from "../config/supabase.js";

// REGISTER
export const register = async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name,
        last_name
      }
    }
  });

  if (error) return res.status(400).json(error);

  res.json(data);
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return res.status(400).json(error);

  res.json(data);
};
