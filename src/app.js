import express from "express";
import cors from "cors";
import { setupSwagger } from "./config/swagger.js";

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
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

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

export default app;
