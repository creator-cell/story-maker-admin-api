import mongoose from "mongoose";
const Schema = mongoose.Schema;

const notificationSchema = Schema({
    type: {
        type: String,
        enum: ["mail", "sms"],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    deliverCount: {
        type: Number,
        default: 0
    },
    sendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
}, {
    timestamps: true
});

const Notification = mongoose.model("notification", notificationSchema);

export default Notification;