const express = require("express");
const router = express.Router();
const {createClient, getClients, getArchivedClients, getClientById, updateClient, deleteClient, archiveClient, restoreClient} = require("../controllers/client");
const verifyToken = require("../middleware/verificationToken");
const { clientValidator } = require("../validators/client");

/**
 * @swagger
 * /api/client/create:
 *   post:
 *     summary: Crea un nuevo cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cif, address]
 *             properties:
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: number
 *                   postal:
 *                     type: number
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       200:
 *         description: Cliente creado con éxito
 *       400:
 *         description: Cliente ya existente
 */
router.post("/create", verifyToken, clientValidator, createClient);

/**
 * @swagger
 * /api/client/show:
 *   get:
 *     summary: Obtener todos los clientes del usuario o su empresa
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get("/show", verifyToken, getClients);

/**
 * @swagger
 * /api/client/archived:
 *   get:
 *     summary: Obtener los clientes archivados del usuario
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes archivados
 */
router.get("/archived", verifyToken, getArchivedClients);

/**
 * @swagger
 * /api/client/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     tags: [Clients]
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
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 */
router.get("/:id", verifyToken, getClientById);

/**
 * @swagger
 * /api/client/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cif:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: number
 *                   postal:
 *                     type: number
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado
 */
router.put("/:id", verifyToken, clientValidator, updateClient);

/**
 * @swagger
 * /api/client/{id}:
 *   delete:
 *     summary: Eliminar cliente permanentemente (hard delete)
 *     tags: [Clients]
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
 *         description: Cliente eliminado
 */
router.delete("/:id", verifyToken, deleteClient);

/**
 * @swagger
 * /api/client/archive/{id}:
 *   delete:
 *     summary: Archivar cliente (soft delete)
 *     tags: [Clients]
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
 *         description: Cliente archivado
 */
router.delete("/archive/:id", verifyToken, archiveClient);

/**
 * @swagger
 * /api/client/restore/{id}:
 *   patch:
 *     summary: Restaurar cliente archivado
 *     tags: [Clients]
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
 *         description: Cliente restaurado
 */
router.patch("/restore/:id", verifyToken, restoreClient);

module.exports = router;
