const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verificationToken");
const { createAlbaran, getAlbaranes, getAlbaranId, deleteAlbaran, createPDF, signAlbaran} = require("../controllers/albaran");
const { uploadMiddleware, uploadMiddlewareMemory } = require('../utils/handleStorage');

router.post("/create", verifyToken, createAlbaran);
router.get("/show", verifyToken, getAlbaranes);
router.get("/show/:id", verifyToken, getAlbaranId);
router.get("/pdf/:id", verifyToken, createPDF);
router.delete("/delete/:id", verifyToken, deleteAlbaran);
router.post("/firmar/:id", verifyToken, uploadMiddlewareMemory.single("file"), signAlbaran);

module.exports = router;
