const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  projectCode: { type: String, required: true },
  code: { type: String, required: true },
  email: { type: String },
  address: {
    street: String,
    number: Number,
    postal: Number,
    city: String,
    province: String
  },
  notes: { type: String },
  begin: { type: String },
  end: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  servicePrices: { type: Array, default: [] },
  archived: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
