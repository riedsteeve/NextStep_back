import express from 'express';
import { getAll, create, update, deleteApp } from '../controllers/application.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: Récupérer toutes les candidatures de l'utilisateur connecté
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des candidatures
 */
router.get('/', authMiddleware, getAll);

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Créer une nouvelle candidature pour l'utilisateur connecté
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company:
 *                 type: string
 *               position:
 *                 type: string
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Candidature créée
 */
router.post('/', authMiddleware, create);

/**
 * @swagger
 * /api/applications/{id}:
 *   put:
 *     summary: Modifier une candidature (si elle appartient à l'utilisateur)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Candidature mise à jour
 */
router.put('/:id', authMiddleware, update);

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: Supprimer une candidature (si elle appartient à l'utilisateur)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidature supprimée
 */
router.delete('/:id', authMiddleware, deleteApp);

export default router;
