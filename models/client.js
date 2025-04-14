const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cif: { type: String, required: true },
  address: {
    street: String,
    number: Number,
    postal: Number,
    city: String,
    province: String
  },
  logo: { type: String, default: "" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  archived: { type: Boolean, default: false },
  activeProjects: { type: Number, default: 0 },
  pendingDeliveryNotes: { type: Number, default: 0 },
  archivedProjects: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);
