const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verificationToken");
const { createProject, updateProject, getAllProjects, getProjectsByClient, getProjectByClientAndId, getArchivedProjects, getArchivedByClient, archiveProject, restoreProject, deleteProject } = require("../controllers/project");
const { projectValidator } = require("../validators/projects");

/**
 * @swagger
 * /api/project/create:
 *   post:
 *     summary: Crear un proyecto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, projectCode, code, clientId, address]
 *             properties:
 *               name:
 *                 type: string
 *               projectCode:
 *                 type: string
 *               code:
 *                 type: string
 *               clientId:
 *                 type: string
 *               email:
 *                 type: string
 *               notes:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: integer
 *                   postal:
 *                     type: integer
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       200:
 *         description: Proyecto creado con éxito
 *       400:
 *         description: Ya existe un proyecto con ese nombre
 *       401:
 *         description: Token no proporcionado o inválido
 *       422:
 *         description: Error de validación de campos
 */
router.post("/create", verifyToken, projectValidator,createProject);

/**
 * @swagger
 * /api/project/modify/{id}:
 *   put:
 *     summary: Modificar un proyecto
 *     tags: [Projects]
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
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               projectCode:
 *                 type: string
 *               email:
 *                 type: string
 *               notes:
 *                 type: string
 *               clientId:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   number:
 *                     type: integer
 *                   postal:
 *                     type: integer
 *                   city:
 *                     type: string
 *                   province:
 *                     type: string
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *       400:
 *         description: Proyecto no encontrado
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: No tienes permisos para modificar este proyecto
 *       422:
 *         description: Error de validación de campos
 */
router.put("/modify/:id", verifyToken, projectValidator,updateProject);

/**
 * @swagger
 * /api/project/show:
 *   get:
 *     summary: Obtener todos los proyectos
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proyectos obtenidos con éxito
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get("/show", verifyToken, getAllProjects);

/**
 * @swagger
 * /api/project/show/{client}:
 *   get:
 *     summary: Obtener proyectos por cliente
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: client
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyectos obtenidos con éxito
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get("/show/:client", verifyToken, getProjectsByClient);

/**
 * @swagger
 * /api/project/show/{client}/{id}:
 *   get:
 *     summary: Obtener un proyecto por cliente e ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: client
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyecto obtenido con éxito
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get("/show/:client/:id", verifyToken, getProjectByClientAndId);

/**
 * @swagger
 * /api/project/archived:
 *   get:
 *     summary: Obtener proyectos archivados
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Proyectos archivados obtenidos con éxito
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get("/archived", verifyToken, getArchivedProjects);

/**
 * @swagger
 * /api/project/archived/{client}:
 *   get:
 *     summary: Obtener proyectos archivados por cliente
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: client
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Proyectos archivados obtenidos con éxito
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.get("/archived/:client", verifyToken, getArchivedByClient);

/**
 * @swagger
 * /api/project/delete/{id}:
 *   delete:
 *     summary: Eliminar un proyecto
 *     tags: [Projects]
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
 *         description: Proyecto eliminado con éxito
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.delete("/delete/:id", verifyToken, deleteProject);

/**
 * @swagger
 * /api/project/archive/{id}:
 *   delete:
 *     summary: Archivar un proyecto
 *     tags: [Projects]
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
 *         description: Proyecto archivado con éxito
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.delete("/archive/:id", verifyToken, archiveProject);

/**
 * @swagger
 * /api/project/restore/{id}:
 *   patch:
 *     summary: Restaurar un proyecto archivado
 *     tags: [Projects]
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
 *         description: Proyecto restaurado con éxito
 *       401:
 *         description: Token no proporcionado o inválido
 */
router.patch("/restore/:id", verifyToken, restoreProject);

module.exports = router;
