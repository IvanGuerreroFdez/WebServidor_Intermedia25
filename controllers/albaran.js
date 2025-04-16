const Albaran = require("../models/albaran");
const Storage = require("../models/storage");
const { uploadToPinata } = require("../utils/handleIPFS");
const PDF = require("pdfkit");
//const {uploadImage} = require("./logo");
const axios = require('axios');

exports.createAlbaran = async (req, res) => {
  try {
    const note = await Albaran.create({
      ...req.body,
      userId: req.user.id,
    });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAlbaranes = async (req, res) => {
  try {
    const filters = {
      userId: req.user.id,
      ...(req.query.signed === "true" ? { pending: false } : {}),
    };

    const notes = await Albaran.find(filters);
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAlbaranId = async (req, res) => {
  try {
    const note = await Albaran.findById(req.params.id)
      .populate("userId")
      .populate("clientId")
      .populate("projectId");

    if (!note) return res.status(404).json({ message: "Albaran no encontrado" });

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.signAlbaran = async (req, res) => {
    try {
        const albaran = req.params.id;
        const { buffer, originalname } = req.file;
    
        const signResponse = await uploadToPinata(buffer, originalname);
        const signUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${signResponse.IpfsHash}`;
    
        const note = await Albaran.findById(albaran).populate("userId").populate("clientId").populate("projectId");
    
        if (!note) return res.status(404).json({ message: "Albaran not found" });
        if (!note.pending) return res.status(400).json({ message: "Ya está firmado" });
    
        //arreglos errores en cannot read properties
        const userEmail = note.userId?.email || "No disponible";
        const clientName = note.clientId?.name || "No disponible";
        const projectName = note.projectId?.name || "No disponible";

        const document = new PDF();
        let pdfBuffer = [];
    
        document.on("data", chunk => pdfBuffer.push(chunk));
        document.on("end", async () => {
          const finalBuffer = Buffer.concat(pdfBuffer);
    
          const pdfResponse = await uploadToPinata(finalBuffer, `albaran-${note._id}.pdf`);
          const pdfUrl = `https://${process.env.PINATA_GATEWAY_URL}/ipfs/${pdfResponse.IpfsHash}`;
    
          note.sign = signUrl;
          note.pdf = pdfUrl;
          note.pending = false;
          await note.save();
    
          res.status(200).json({
            message: "Albaran firmado!",
            sign: signUrl,
            pdf: pdfUrl
          });
        });
    
        document.fontSize(16).text("ALBARAN", { align: "center" }).moveDown();
        /* document.fontSize(12).text(`Usuario: ${note.userId.email}`);
        document.text(`Cliente: ${note.clientId.name}`);
        document.text(`Proyecto: ${note.projectId.name}`); */
        document.fontSize(12).text(`Usuario: ${userEmail}`);
        document.text(`Cliente: ${clientName}`);
        document.text(`Proyecto: ${projectName}`);
        document.text(`Descripción: ${note.description}`);
        document.text(`Formato: ${note.format}`);
        /* document.text(`Horas: ${note.hours || "N/A"}`);
        document.text(`Trabajadores: ${note.workers.name || "N/A"}`);
        document.text(`Trabajadores (horas): ${note.workers.hours || "N/A"}`); 
        document.text(`Material: ${note.material || "N/A"}`);*/
        document.text(`Fecha de trabajo: ${note.workdate || "N/A"}`);
        document.text(`Firmado: Sí`);

        if (note.format === "material") {
            document.text("Materiales:");
            (note.materials || []).forEach((mat, i) => {
              document.text(`  ${i + 1}. ${mat}`);
            });
        }

        if (note.format === "hours") {
            document.text("Trabajadores (horas)");
            (note.workers || []).forEach((w, i) => {
              document.text(`  ${i + 1}. ${w.name} → ${w.hours} horas`);
            });
        }
        document.end();
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al firmar el albaran" });
    }
}

exports.createPDF = async (req, res) => {
    try {
        const note = await Albaran.findById(req.params.id);
        if (!note || !note.pdf) return res.status(404).json({ message: "PDF no disponible" });
    
        //res.redirect(note.pdf);
        if (note.userId._id.toString() !== req.user.id && req.user.role !== "guest") {
            return res.status(403).json({ message: "No tienes permiso para acceder a este albarán" });
        }
      
        const pdfStream = await axios.get(note.pdf, { responseType: 'stream' });
        res.setHeader('Content-Type', 'application/pdf');
        pdfStream.data.pipe(res);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el PDF" });
    }
}

exports.deleteAlbaran = async (req, res) => {
    try {
        const note = await Albaran.findById(req.params.id);
        if (!note) return res.status(404).json({ message: "Albaran no encontrado" });

        if (!note.pending) {
            return res.status(403).json({ message: "Albarán firmado --> no puede eliminarse" });
        }

        await Albaran.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Albaran eliminado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar albaran" });
    }
}