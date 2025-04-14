const express = require("express");
const router = express.Router();
const {createClient, getClients, getArchivedClients, getClientById, updateClient, deleteClient, archiveClient, restoreClient} = require("../controllers/client");
const verifyToken = require("../middleware/verificationToken");

router.post("/create", verifyToken, createClient);
router.get("/show", verifyToken, getClients);
router.get("/archived", verifyToken, getArchivedClients);
router.get("/:id", verifyToken, getClientById);
router.put("/:id", verifyToken, updateClient);
router.delete("/:id", verifyToken, deleteClient);
router.delete("/archive/:id", verifyToken, archiveClient);
router.patch("/restore/:id", verifyToken, restoreClient);

module.exports = router;
