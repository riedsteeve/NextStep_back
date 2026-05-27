import express from "express";
import cors from "cors";
import { setupSwagger } from "./config/swagger.js";

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || "https://nextstep-roan-two.vercel.app/",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

// Configuration Swagger
setupSwagger(app);

// Routes de base
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API NextStep" });
});

// Import des routes
import authRoutes from "./routes/auth.routes.js";
import applicationRoutes from "./routes/application.routes.js";
import noteRoutes from "./routes/note.routes.js";
import userRoutes from "./routes/user.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

export default app;
