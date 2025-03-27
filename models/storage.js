const mongoose = require("mongoose")
//const mongooseDelete = require("mongoose-delete")

const StorageScheme = new mongoose.Schema(
    {
        url:  String,
        filename: String
    },
    {
        timestamps: true, // TODO createdAt, updatedAt
        versionKey: false
    }
)

//TrackScheme.plugin(mongooseDelete, { overrideMethods: "all" }) // Soft delete
module.exports = mongoose.model("storages", StorageScheme) // Nombre de la colección 