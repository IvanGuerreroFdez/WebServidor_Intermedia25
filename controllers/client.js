const Client = require("../models/client");
const handleClientError = require("../utils/handleClientError");

exports.createClient = async (req, res) => {
  try {
    /* const errorResponse = handleClientError(req, res);
    if (errorResponse) return; */

    const { name, cif, address } = req.body;
    const userId = req.user.id;
    const existing = await Client.findOne({ name, userId, archived: false });
    if (existing) return res.status(400).json({ message: "Client already exists." });

    const newClient = new Client({ name, cif, address, userId });
    await newClient.save();
    res.status(200).json(newClient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClients = async (req, res) => {
  try {
    /* const errorResponse = handleClientError(req, res);
    if (errorResponse) return; */

    const userId = req.user.id;
    const clients = await Client.find({
      $or: [{ userId }, { companyId: req.user.companyId }],
      archived: false
    });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    /* const errorResponse = handleClientError(req, res);
    if (errorResponse) return; */
    
    const client = await Client.findOne({
      _id: req.params.id,
      $or: [{ userId: req.user.id }, { companyId: req.user.companyId }]
    });
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.status(200).json(client);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    /* const errorResponse = handleClientError(req, res);
    if (errorResponse) return; */
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.archiveClient = async (req, res) => {
  try {
    /* const errorResponse = handleClientError(req, res);
    if (errorResponse) return; */
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    
    const archived = await Client.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    res.status(200).json(archived);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getArchivedClients = async (req, res) => {
  try {
    /* const errorResponse = handleClientError(req, res);
    if (errorResponse) return; */
    
    const archived = await Client.find({ userId: req.user.id, archived: true });
    res.status(200).json(archived);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.restoreClient = async (req, res) => {
  try {
    /* const errorResponse = handleClientError(req, res);
    if (errorResponse) return; */
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    
    const restored = await Client.findByIdAndUpdate(req.params.id, { archived: false }, { new: true });
    res.status(200).json(restored);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    /* const errorResponse = handleClientError(req, res);
    if (errorResponse) return; */
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    
    await Client.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Client deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
