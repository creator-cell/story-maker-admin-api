import mongoose from "mongoose";
const Schema = mongoose.Schema;

const assetsSchema = Schema({
    name: {
        required: true,
        type: String
    },
    url: {
        required: true,
        type: String
    },
    type: {
        required: true,
        type: String
    },
    format: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    tags: [
        {
            required: true,
            type: String
        }
    ],
    status: {
        type: String,
        enum: ["Pending", "Reject", "Approve"],
        default: "Pending"
    },
    uploadedBy: {
        required: true,
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

const Assets = mongoose.model("assets", assetsSchema);

export default Assets;