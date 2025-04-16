const mongoose = require("mongoose");

const albaranSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  format: { type: String, enum: ["material", "hours"], required: true },
  material: { type: String },
  hours: { type: Number },
  description: { type: String },
  workdate: { type: String },
  pending: { type: Boolean, default: true },
  sign: { type: String }, //url de la firma (IPFS)
  pdf: { type: String },
  material: [String],
  workers: [
    {
      name: { type: String },
      hours: { type: Number }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model("Albaran", albaranSchema);
