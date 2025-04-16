const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verificationToken");
const { createAlbaran, getAlbaranes, getAlbaranId, deleteAlbaran, createPDF, signAlbaran} = require("../controllers/albaran");
const { uploadMiddleware, uploadMiddlewareMemory } = require('../utils/handleStorage');
const { albaranValidator } = require("../validators/albaran");
const { validateSignatureUpload } = require("../validators/file");

/**
 * @swagger
 * /api/albaran/create:
 *   post:
 *     summary: Crear un albarán
 *     tags: [Albaran]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clientId, projectId, format]
 *             properties:
 *               clientId:
 *                 type: string
 *               projectId:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [material, hours]
 *               material:
 *                 type: array
 *                 items:
 *                   type: string
 *               workers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     hours:
 *                       type: number
 *               description:
 *                 type: string
 *               workdate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Albarán creado
 *       401:
 *         description: Token inválido
 *       422:
 *         description: Validación fallida
 */
router.post("/create", verifyToken, albaranValidator, createAlbaran);

/**
 * @swagger
 * /api/albaran/show:
 *   get:
 *     summary: Listar albaranes del usuario
 *     tags: [Albaran]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de albaranes
 *       401:
 *         description: No autorizado
 */
router.get("/show", verifyToken, getAlbaranes);

/**
 * @swagger
 * /api/albaran/show/{id}:
 *   get:
 *     summary: Obtener un albarán por ID
 *     tags: [Albaran]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán encontrado
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Albarán no encontrado
 */
router.get("/show/:id", verifyToken, getAlbaranId);

/**
 * @swagger
 * /api/albaran/pdf/{id}:
 *   get:
 *     summary: Descargar PDF del albarán firmado
 *     tags: [Albaran]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del albarán
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF devuelto
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Token inválido
 *       403:
 *         description: No autorizado
 *       404:
 *         description: PDF no disponible
 */
router.get("/pdf/:id", verifyToken, createPDF);

/**
 * @swagger
 * /api/albaran/delete/{id}:
 *   delete:
 *     summary: Eliminar un albarán (solo si no está firmado)
 *     tags: [Albaran]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Albarán eliminado
 *       401:
 *         description: Token inválido
 *       403:
 *         description: Albarán firmado, no puede eliminarse
 *       404:
 *         description: Albarán no encontrado
 */
router.delete("/delete/:id", verifyToken, deleteAlbaran);

/**
 * @swagger
 * /api/albaran/firmar/{id}:
 *   post:
 *     summary: Firmar albarán y generar PDF
 *     tags: [Albaran]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del albarán a firmar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente
 *       400:
 *         description: Ya estaba firmado
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Albarán no encontrado
 *       422:
 *         description: Archivo inválido
 */
router.post("/firmar/:id", verifyToken, uploadMiddlewareMemory.single("file"), validateSignatureUpload, signAlbaran);

module.exports = router;
