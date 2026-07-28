import "dotenv/config";
import { BlobServiceClient } from "@azure/storage-blob";
import { supabase } from "../config/supabase.js";

//Conf azure
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME || "uploads";
const blobServiceClient =
  BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

//Fonction pour téléverser les fichiers
const uploadToAzure = async (file) => {
  if (!file) return null;

  const blobName = `${Date.now()}-${file.originalname}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype },
  });

  return blobName;
};

// Récupérer les candidatures (Toutes pour l'Admin, seulement les siennes pour le User)
export const getAll = async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  let query = supabase.from("applications").select("*");

  // Si l'utilisateur n'est pas admin, on filtre par son user_id
  if (role !== "admin") {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) return res.status(400).json(error);
  res.json(data);
};

// Créer une candidature liée à l'utilisateur
//Je modifie l'endpoint afin qu'il puisse envoyer les fichier vers le bucket Azure et récupérer les liens pour les stocker dans la base de données
export const create = async (req, res) => {
  const userId = req.user.id;
  const { company, position, status, notes, contact, type_contact } = req.body;

  const cvFile = req.files?.cv ? req.files.cv[0] : null;
  const lmFile = req.files?.lm ? req.files.lm[0] : null;

  //Upload sur Azure si les fichiers sont présent
  const nom_cv = await uploadToAzure(cvFile);
  const nom_lm = await uploadToAzure(lmFile);

  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        company,
        position,
        status,
        notes,
        nom_cv,
        nom_lm,
        contact,
        type_contact,
        user_id: userId,
      },
    ])
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

  let query = supabase.from("applications").update(updates).eq("id", id);
  // Si ce n'est pas un admin, on vérifie que la candidature lui appartient
  if (role !== "admin") {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.select();

  if (error) return res.status(400).json(error);

  if (data.length === 0) {
    return res
      .status(404)
      .json({ message: "Candidature non trouvée ou non autorisée" });
  }

  res.json(data);
};

// Supprimer une candidature
export const deleteApp = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  let query = supabase.from("applications").delete().eq("id", id);

  // Si ce n'est pas un admin, on vérifie que la candidature lui appartient
  if (role !== "admin") {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;

  if (error) return res.status(400).json(error);
  res.json({ message: "Candidature supprimée avec succès" });
};
