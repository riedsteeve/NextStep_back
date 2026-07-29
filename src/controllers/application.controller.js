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
  const { company, position, status, notes, contact, type_contact } = req.body;

  const updates = {
    company,
    position,
    status,
    notes: notes || null,
    contact: contact || null,
    type_contact: type_contact || null,
  };

  const cvFile = req.files?.cv ? req.files.cv[0] : null;
  const lmFile = req.files?.lm ? req.files.lm[0] : null;

  if (cvFile) updates.nom_cv = await uploadToAzure(cvFile);
  if (lmFile) updates.nom_lm = await uploadToAzure(lmFile);

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

// Télécharger un fichier (CV ou LM) depuis Azure
export const downloadFile = async (req, res) => {
  const { id, type } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  if (type !== "cv" && type !== "lm") {
    return res.status(400).json({ message: "Type de fichier invalide" });
  }

  const column = type === "cv" ? "nom_cv" : "nom_lm";

  let query = supabase.from("applications").select(column).eq("id", id);
  if (role !== "admin") {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.single();

  if (error || !data || !data[column]) {
    return res.status(404).json({ message: "Fichier non trouvé" });
  }

  const blobName = data[column];
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    const downloadResponse = await blockBlobClient.download(0);
    const originalName = blobName.substring(blobName.indexOf("-") + 1);

    res.setHeader("Content-Type", downloadResponse.contentType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${originalName}"`);
    res.setHeader("Content-Length", downloadResponse.contentLength);

    downloadResponse.readableStreamBody.pipe(res);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du téléchargement du fichier" });
  }
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
