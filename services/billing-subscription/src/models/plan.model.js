import mongoose from "mongoose";
const Schema = mongoose.Schema;

const planSchema = Schema({
    name: {
        required: true,
        type: String
    },
    title: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ["team", "individual"],
        default: "individual"
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: String,
        enum: ["monthly", "yearly"],
        required: true
    },
    features: [
        {
            type: String,
            required: true,
        }
    ],
    uploadedBy: {
        required: true,
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
}, {
    timestamps: true
});

const Plan = mongoose.model("plan", planSchema);

export default Plan;